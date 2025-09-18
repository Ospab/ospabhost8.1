import { Router } from 'express';
import { createTicket, getMyTickets, getAllTickets, createResponse } from './ticket.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// All ticket routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', createTicket);
router.get('/my', getMyTickets);

// Operator routes (authorization checked inside controller)
router.get('/', getAllTickets);
router.post('/:id/response', createResponse);

export default router;