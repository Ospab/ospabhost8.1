
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// GET /api/os — получить все ОС (только для авторизованных)
router.get('/', async (req, res) => {
  try {
    const oses = await prisma.operatingSystem.findMany();
    res.json(oses);
  } catch (err) {
    console.error('Ошибка получения ОС:', err);
    res.status(500).json({ error: 'Ошибка получения ОС' });
  }
});

export default router;
