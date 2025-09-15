import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Замените 'любая_секретная_строка' на вашу переменную окружения JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'любая_секретная_строка'; 

export const register = async (req: Request, res: Response) => {
  try {
  const { name, email, password } = req.body;

    // Проверка, есть ли уже пользователь с таким email
  const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание нового пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Генерация JWT токена
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Регистрация прошла успешно!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Генерация JWT токена
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Вход выполнен успешно!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // ID пользователя будет добавлен в req.user.id мидлваром
    const userId = (req as any).userId; 
    
    // Получение пользователя из базы данных, исключая пароль
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json({ user });
    
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
};