import { Router } from 'express';
import { createTicket, getTickets, respondTicket, closeTicket } from './ticket.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/create', createTicket);
router.get('/', getTickets);
router.post('/respond', respondTicket);
router.post('/close', closeTicket);

export default router;
