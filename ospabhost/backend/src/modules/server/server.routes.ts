import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
// import { createProxmoxContainer } from '../../proxmox/proxmoxApi'; // если есть интеграция

const router = Router();
const prisma = new PrismaClient();

// POST /api/server/create — создать сервер (контейнер)
router.post('/create', async (req, res) => {
  try {
    const { tariffId, osId } = req.body;
    // TODO: получить userId из авторизации (req.user)
    const userId = 1; // временно, заменить на реального пользователя

    // Получаем тариф и ОС
    const tariff = await prisma.tariff.findUnique({ where: { id: tariffId } });
    const os = await prisma.operatingSystem.findUnique({ where: { id: osId } });
    if (!tariff || !os) {
      return res.status(400).json({ error: 'Тариф или ОС не найдены' });
    }

    // TODO: интеграция с Proxmox для создания контейнера
    // Если интеграция с Proxmox есть, то только при успешном создании контейнера создавать запись в БД
    // Например:
    // let proxmoxResult;
    // try {
    //   proxmoxResult = await createProxmoxContainer({ ... });
    // } catch (proxmoxErr) {
    //   console.error('Ошибка Proxmox:', proxmoxErr);
    //   return res.status(500).json({ error: 'Ошибка создания контейнера на Proxmox' });
    // }

    // Если всё успешно — создаём запись сервера в БД
    const server = await prisma.server.create({
      data: {
        userId,
        tariffId,
        osId,
        status: 'creating',
      },
    });
    res.json({ success: true, server });
  } catch (err) {
    console.error('Ошибка создания сервера:', err);
    // Не создавать сервер, если есть ошибка
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

export default router;
