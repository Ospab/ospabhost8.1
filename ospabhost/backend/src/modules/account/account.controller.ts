import { Request, Response } from 'express';
import {
  requestPasswordChange,
  confirmPasswordChange,
  requestUsernameChange,
  confirmUsernameChange,
  requestAccountDeletion,
  confirmAccountDeletion,
  getUserInfo,
} from './account.service';

/**
 * Получить информацию о текущем пользователе
 */
export const getAccountInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const userInfo = await getUserInfo(userId);
    res.json(userInfo);
  } catch (error) {
    console.error('Ошибка получения информации об аккаунте:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Запрос на смену пароля (отправка кода)
 */
export const requestPasswordChangeHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть минимум 6 символов' });
    }

    // Проверка текущего пароля
    const bcrypt = require('bcrypt');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.password) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Неверный текущий пароль' });
      }
    }

    await requestPasswordChange(userId, newPassword);
    
    res.json({ 
      success: true, 
      message: 'Код подтверждения отправлен на вашу почту' 
    });
  } catch (error: any) {
    console.error('Ошибка запроса смены пароля:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера' });
  }
};

/**
 * Подтверждение смены пароля
 */
export const confirmPasswordChangeHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Код подтверждения обязателен' });
    }

    await confirmPasswordChange(userId, code);
    
    res.json({ 
      success: true, 
      message: 'Пароль успешно изменён' 
    });
  } catch (error: any) {
    console.error('Ошибка подтверждения смены пароля:', error);
    res.status(400).json({ error: error.message || 'Ошибка подтверждения' });
  }
};

/**
 * Запрос на смену имени пользователя (отправка кода)
 */
export const requestUsernameChangeHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { newUsername } = req.body;

    if (!newUsername) {
      return res.status(400).json({ error: 'Новое имя пользователя обязательно' });
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      return res.status(400).json({ 
        error: 'Имя пользователя должно быть от 3 до 20 символов' 
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
      return res.status(400).json({ 
        error: 'Имя пользователя может содержать только буквы, цифры, дефис и подчёркивание' 
      });
    }

    await requestUsernameChange(userId, newUsername);
    
    res.json({ 
      success: true, 
      message: 'Код подтверждения отправлен на вашу почту' 
    });
  } catch (error: any) {
    console.error('Ошибка запроса смены имени:', error);
    res.status(400).json({ error: error.message || 'Ошибка сервера' });
  }
};

/**
 * Подтверждение смены имени пользователя
 */
export const confirmUsernameChangeHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Код подтверждения обязателен' });
    }

    await confirmUsernameChange(userId, code);
    
    res.json({ 
      success: true, 
      message: 'Имя пользователя успешно изменено' 
    });
  } catch (error: any) {
    console.error('Ошибка подтверждения смены имени:', error);
    res.status(400).json({ error: error.message || 'Ошибка подтверждения' });
  }
};

/**
 * Запрос на удаление аккаунта (отправка кода)
 */
export const requestAccountDeletionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    await requestAccountDeletion(userId);
    
    res.json({ 
      success: true, 
      message: 'Код подтверждения отправлен на вашу почту. После подтверждения аккаунт будет удалён безвозвратно.' 
    });
  } catch (error: any) {
    console.error('Ошибка запроса удаления аккаунта:', error);
    res.status(500).json({ error: error.message || 'Ошибка сервера' });
  }
};

/**
 * Подтверждение удаления аккаунта
 */
export const confirmAccountDeletionHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Код подтверждения обязателен' });
    }

    await confirmAccountDeletion(userId, code);
    
    res.json({ 
      success: true, 
      message: 'Аккаунт успешно удалён' 
    });
  } catch (error: any) {
    console.error('Ошибка подтверждения удаления аккаунта:', error);
    res.status(400).json({ error: error.message || 'Ошибка подтверждения' });
  }
};
