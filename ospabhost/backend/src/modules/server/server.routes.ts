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

export default router;