import { Router } from 'express';
import { getNotifications } from './notification.service';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getNotifications);

export default router;
