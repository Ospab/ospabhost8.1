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
  createSnapshot,
  getSnapshots,
  restoreSnapshot,
  removeSnapshot,
  getConsole,
  getMyServers,
  controlServerAction
} from './server.controller';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = Router();


router.use(authMiddleware);

// Получить список моих серверов
router.get('/my-servers', getMyServers);

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
router.get('/:id/console', getConsole);

// Управление сервером (универсальный endpoint)
router.post('/:id/control', controlServerAction);

// Snapshot management
router.post('/:id/snapshot', createSnapshot);
router.get('/:id/snapshots', getSnapshots);
router.post('/:id/snapshot/restore', restoreSnapshot);
router.delete('/:id/snapshot/:snapshotId', removeSnapshot);

router.post('/create', createServer);
router.post('/:id/start', startServer);
router.post('/:id/stop', stopServer);
router.post('/:id/restart', restartServer);
router.delete('/:id', deleteServer);
router.post('/:id/change-password', changeRootPassword);

export default router;