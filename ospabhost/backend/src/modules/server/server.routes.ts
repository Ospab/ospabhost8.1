import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
  createServer,
  startServer,
  stopServer,
  restartServer,
  getServerStatus,
  deleteServer,
  changeRootPassword,
  resizeServer,
  createServerSnapshot,
  getServerSnapshots,
  rollbackServerSnapshot,
  deleteServerSnapshot
} from './server.controller';
import { getStorageConfig, getNodeStorages, checkProxmoxConnection } from './proxmoxApi';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = Router();


router.use(authMiddleware);



// Получить список всех серверов (для фронта)
router.get('/', async (req, res) => {
  const userId = req.user?.id;
  // Если нужен только свои сервера:
  const where = userId ? { userId } : {};
  const servers = await prisma.server.findMany({
    where,
    include: {
      os: true,
      tariff: true
    }
  });
  res.json(servers);
});

// Получить информацию о сервере (для фронта)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const server = await prisma.server.findUnique({
    where: { id },
    include: {
      os: true,
      tariff: true
    }
  });
  if (!server) return res.status(404).json({ error: 'Сервер не найден' });
  res.json(server);
});


// Получить статистику сервера (CPU, RAM и т.д.)
router.get('/:id/status', getServerStatus);

// Получить ссылку на noVNC консоль
import { getConsoleURL } from './proxmoxApi';
router.post('/console', async (req, res) => {
  const { vmid } = req.body;
  if (!vmid) return res.status(400).json({ status: 'error', message: 'Не указан VMID' });
  try {
    const result = await getConsoleURL(Number(vmid));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error?.message || 'Ошибка получения консоли' });
  }
});

router.post('/create', createServer);
router.post('/:id/start', startServer);
router.post('/:id/stop', stopServer);
router.post('/:id/restart', restartServer);
router.delete('/:id', deleteServer);
router.post('/:id/password', changeRootPassword);

// Новые маршруты для управления конфигурацией и снэпшотами
router.put('/:id/resize', resizeServer);
router.post('/:id/snapshots', createServerSnapshot);
router.get('/:id/snapshots', getServerSnapshots);
router.post('/:id/snapshots/rollback', rollbackServerSnapshot);
router.delete('/:id/snapshots', deleteServerSnapshot);
import { getContainerStats } from './proxmoxApi';
import { getContainerLogs, getContainerEvents } from './server.logs';

// Диагностика: проверить конфигурацию storage
router.get('/admin/diagnostic/storage', async (req, res) => {
  try {
    const storageConfig = await getStorageConfig();
    
    res.json({
      configured_storage: storageConfig.configured,
      note: storageConfig.note,
      instruction: 'Если ошибка socket hang up, проверьте что PROXMOX_VM_STORAGE установлен правильно в .env'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Диагностика: проверить соединение с Proxmox
router.get('/admin/diagnostic/proxmox', async (req, res) => {
  try {
    const connectionStatus = await checkProxmoxConnection();
    const storages = await getNodeStorages();
    
    res.json({
      proxmox_connection: connectionStatus,
      available_storages: storages.data || [],
      current_storage_config: process.env.PROXMOX_VM_STORAGE || 'не установлена',
      note: 'Если ошибка в available_storages, проверьте права API токена'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Получить графики нагрузок сервера (CPU, RAM, сеть)
router.get('/:id/stats', async (req, res) => {
  const id = Number(req.params.id);
  // Проверка прав пользователя (только свои сервера)
  const userId = req.user?.id;
  const server = await prisma.server.findUnique({ where: { id } });
  if (!server || server.userId !== userId) {
    return res.status(404).json({ error: 'Сервер не найден или нет доступа' });
  }
  try {
    if (!server.proxmoxId && server.proxmoxId !== 0) {
      return res.status(400).json({ error: 'proxmoxId не задан для сервера' });
    }
    const stats = await getContainerStats(Number(server.proxmoxId));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения статистики', details: err });
  }
});

// Получить логи сервера
router.get('/:id/logs', async (req, res) => {
  const id = Number(req.params.id);
  const lines = req.query.lines ? Number(req.query.lines) : 100;
  
  const userId = req.user?.id;
  const server = await prisma.server.findUnique({ where: { id } });
  if (!server || server.userId !== userId) {
    return res.status(404).json({ error: 'Сервер не найден или нет доступа' });
  }
  
  try {
    if (!server.proxmoxId && server.proxmoxId !== 0) {
      return res.status(400).json({ error: 'proxmoxId не задан для сервера' });
    }
    const logs = await getContainerLogs(Number(server.proxmoxId), lines);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения логов', details: err });
  }
});

// Получить события/историю действий сервера
router.get('/:id/events', async (req, res) => {
  const id = Number(req.params.id);
  
  const userId = req.user?.id;
  const server = await prisma.server.findUnique({ where: { id } });
  if (!server || server.userId !== userId) {
    return res.status(404).json({ error: 'Сервер не найден или нет доступа' });
  }
  
  try {
    if (!server.proxmoxId && server.proxmoxId !== 0) {
      return res.status(400).json({ error: 'proxmoxId не задан для сервера' });
    }
    const events = await getContainerEvents(Number(server.proxmoxId));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения событий', details: err });
  }
});

export default router;