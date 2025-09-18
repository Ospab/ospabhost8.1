import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../auth/auth.middleware';
import { checkProxmoxConnection, createProxmoxContainer } from './proxmoxApi';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/proxmox-status', async (req, res) => {
  const status = await checkProxmoxConnection();
  res.json(status);
});
router.post('/create', async (req, res) => {
  try {
    const { tariffId, osId } = req.body;
    // Получаем userId из авторизации
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Нет авторизации' });

    // Получаем тариф и ОС
    const tariff = await prisma.tariff.findUnique({ where: { id: tariffId } });
    const os = await prisma.operatingSystem.findUnique({ where: { id: osId } });
    if (!tariff || !os) {
      return res.status(400).json({ error: 'Тариф или ОС не найдены' });
    }

    // Проверяем баланс пользователя
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.balance < tariff.price) {
      return res.status(400).json({ error: 'Недостаточно средств на балансе' });
    }

    // 1. Создаём сервер на Proxmox
    let proxmoxResult;
    try {
      proxmoxResult = await createProxmoxContainer({ os, tariff, user });
    } catch (proxmoxErr) {
      console.error('Ошибка Proxmox:', proxmoxErr);
      return res.status(500).json({ error: 'Ошибка создания сервера на Proxmox', details: proxmoxErr });
    }
    if (!proxmoxResult || proxmoxResult.status !== 'ok') {
      return res.status(500).json({ error: 'Сервер не создан на Proxmox', details: proxmoxResult });
    }

    // 2. Списываем средства
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: tariff.price
        }
      }
    });

    // 3. Создаём запись о сервере в БД
    const node = process.env.PROXMOX_NODE;
    const diskTemplate = process.env.PROXMOX_DISK_TEMPLATE;
    const server = await prisma.server.create({
      data: {
        userId,
        tariffId,
        osId,
        status: 'active',
        node,
        diskTemplate,
        proxmoxId: proxmoxResult.proxmoxId || null,
      },
    });
    res.json({ success: true, server });
  } catch (err) {
    console.error('Ошибка создания сервера:', err);
    return res.status(500).json({ error: 'Ошибка создания сервера' });
  }
});

// GET /api/server — получить все серверы пользователя
router.get('/', async (req, res) => {
  try {
    // TODO: получить userId из авторизации (req.user)
    const userId = 1; // временно
    const servers = await prisma.server.findMany({
      where: { userId },
      include: {
        os: true,
        tariff: true,
      },
    });
    console.log('API /api/server ответ:', servers);
    res.json(servers);
  } catch (err) {
    console.error('Ошибка получения серверов:', err);
    res.status(500).json({ error: 'Ошибка получения серверов' });
  }
});

// GET /api/server/:id — получить один сервер пользователя по id
router.get('/:id', async (req, res) => {
  try {
    // TODO: получить userId из авторизации (req.user)
    const userId = 1; // временно
    const serverId = Number(req.params.id);
    const server = await prisma.server.findFirst({
      where: { id: serverId, userId },
      include: { os: true, tariff: true },
    });
    if (!server) return res.status(404).json({ error: 'Сервер не найден' });
    res.json(server);
  } catch (err) {
    console.error('Ошибка получения сервера:', err);
    res.status(500).json({ error: 'Ошибка получения сервера' });
  }
});

export default router;
