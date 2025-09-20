
import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Нет авторизации' });
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения уведомлений' });
  }
};

export const createNotification = async (userId: number, title: string, message: string) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};
