import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем интерфейс Request, чтобы добавить поле userId
interface CustomRequest extends Request {
  userId?: number;
}

// Замените 'любая_секретная_строка' на вашу переменную окружения JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'любая_секретная_строка';

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Нет токена авторизации' });
    }

    // Токен имеет формат 'Bearer <токен>', поэтому мы его разделяем
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Неправильный формат токена' });
    }

    // Проверяем валидность токена
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Сохраняем ID пользователя в объекте запроса
    req.userId = decoded.id;

    // Передаем управление следующему мидлвару или контроллеру
    next();
    
  } catch (error) {
    console.error('Ошибка в мидлваре аутентификации:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Неверный или просроченный токен' });
    }
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};