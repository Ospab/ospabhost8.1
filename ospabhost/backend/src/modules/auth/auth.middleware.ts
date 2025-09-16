import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  userId?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Нет токена авторизации.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неправильный формат токена.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
    
  } catch (error) {
    console.error('Ошибка в мидлваре аутентификации:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Неверный или просроченный токен.' });
    }
    res.status(500).json({ message: 'Ошибка сервера.' });
  }
};