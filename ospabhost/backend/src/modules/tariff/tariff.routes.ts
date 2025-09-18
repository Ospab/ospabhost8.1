import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/tariff — получить все тарифы
router.get('/', async (req, res) => {
  try {
    const tariffs = await prisma.tariff.findMany();
    res.json(tariffs);
  } catch (err) {
    console.error('Ошибка получения тарифов:', err);
    res.status(500).json({ error: 'Ошибка получения тарифов' });
  }
});

export default router;
