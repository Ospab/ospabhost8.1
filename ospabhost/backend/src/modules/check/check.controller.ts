import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Multer } from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Тип расширенного запроса с Multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Загрузка чека клиентом (с файлом)
export async function uploadCheck(req: MulterRequest, res: Response) {
  const userId = req.user?.id;
  const { amount } = req.body;
  const file = req.file;
  if (!userId || !amount || !file) return res.status(400).json({ error: 'Данные не заполнены или файл не загружен' });

  // Сохраняем путь к файлу
  const fileUrl = `/uploads/checks/${file.filename}`;

  const check = await prisma.check.create({
    data: { userId, amount: Number(amount), fileUrl }
  });
  res.json(check);
}

// Получить все чеки (оператор)
export async function getChecks(req: Request, res: Response) {
  const isOperator = Number(req.user?.operator) === 1;
  if (!isOperator) return res.status(403).json({ error: 'Нет прав' });
  const checks = await prisma.check.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(checks);
}

// Подтвердить чек и пополнить баланс
export async function approveCheck(req: Request, res: Response) {
  const { checkId } = req.body;
  // Найти чек
  const check = await prisma.check.findUnique({ where: { id: checkId } });
  if (!check) return res.status(404).json({ error: 'Чек не найден' });
  // Обновить статус
  await prisma.check.update({ where: { id: checkId }, data: { status: 'approved' } });
  // Пополнить баланс пользователя
  await prisma.user.update({
    where: { id: check.userId },
    data: {
      balance: {
        increment: check.amount
      }
    }
  });
  res.json({ success: true });
}

// Отклонить чек
export async function rejectCheck(req: Request, res: Response) {
  const { checkId } = req.body;
  await prisma.check.update({ where: { id: checkId }, data: { status: 'rejected' } });
  res.json({ success: true });
}
