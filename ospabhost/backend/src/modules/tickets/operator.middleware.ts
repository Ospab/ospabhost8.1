import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: number;
}

export const operatorMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.operator !== 1) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права оператора.' });
    }

    next();
  } catch (error) {
    console.error('Ошибка в мидлваре оператора:', error);
    res.status(500).json({ message: 'Ошибка сервера.' });
  }
};