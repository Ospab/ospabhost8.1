import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
  getAccountInfo,
  requestPasswordChangeHandler,
  confirmPasswordChangeHandler,
  requestUsernameChangeHandler,
  confirmUsernameChangeHandler,
  requestAccountDeletionHandler,
  confirmAccountDeletionHandler,
} from './account.controller';

const router = Router();

// Все маршруты требуют авторизации
router.use(authMiddleware);

/**
 * GET /api/account/info
 * Получить информацию об аккаунте
 */
router.get('/info', getAccountInfo);

/**
 * POST /api/account/password/request
 * Запросить смену пароля (отправка кода на email)
 * Body: { currentPassword: string, newPassword: string }
 */
router.post('/password/request', requestPasswordChangeHandler);

/**
 * POST /api/account/password/confirm
 * Подтвердить смену пароля
 * Body: { code: string }
 */
router.post('/password/confirm', confirmPasswordChangeHandler);

/**
 * POST /api/account/username/request
 * Запросить смену имени пользователя (отправка кода на email)
 * Body: { newUsername: string }
 */
router.post('/username/request', requestUsernameChangeHandler);

/**
 * POST /api/account/username/confirm
 * Подтвердить смену имени пользователя
 * Body: { code: string }
 */
router.post('/username/confirm', confirmUsernameChangeHandler);

/**
 * POST /api/account/delete/request
 * Запросить удаление аккаунта (отправка кода на email)
 */
router.post('/delete/request', requestAccountDeletionHandler);

/**
 * POST /api/account/delete/confirm
 * Подтвердить удаление аккаунта
 * Body: { code: string }
 */
router.post('/delete/confirm', confirmAccountDeletionHandler);

export default router;
