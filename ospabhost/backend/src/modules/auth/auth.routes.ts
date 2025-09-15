import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { authMiddleware } from './auth.middleware';

const router = Router();

// Маршрут для регистрации нового пользователя
router.post('/register', register);

// Маршрут для входа
router.post('/login', login);

// Маршрут для получения данных о текущем пользователе
// Он защищен мидлваром authMiddleware
router.get('/me', authMiddleware, getMe);

export default router;