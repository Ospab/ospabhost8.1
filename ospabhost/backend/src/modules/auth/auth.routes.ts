import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { authMiddleware } from './auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

export default router;