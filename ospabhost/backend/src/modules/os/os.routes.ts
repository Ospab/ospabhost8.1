import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/os — получить все ОС
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
