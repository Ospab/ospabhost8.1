import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Создать тикет
export async function createTicket(req: Request, res: Response) {
  const { title, message } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Нет авторизации' });
  try {
    const ticket = await prisma.ticket.create({
      data: { title, message, userId },
    });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка создания тикета' });
  }
}

// Получить тикеты (клиент — свои, оператор — все)
export async function getTickets(req: Request, res: Response) {
  const userId = req.user?.id;
  const isOperator = Number(req.user?.operator) === 1;
  if (!userId) return res.status(401).json({ error: 'Нет авторизации' });
  try {
    const tickets = await prisma.ticket.findMany({
      where: isOperator ? {} : { userId },
      include: {
        responses: { include: { operator: true } },
        user: true
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения тикетов' });
  }
}

// Ответить на тикет (только оператор)
export async function respondTicket(req: Request, res: Response) {
  const { ticketId, message } = req.body;
  const operatorId = req.user?.id;
  const isOperator = Number(req.user?.operator) === 1;
  if (!operatorId || !isOperator) return res.status(403).json({ error: 'Нет прав' });
  try {
    const response = await prisma.response.create({
      data: { ticketId, operatorId, message },
    });
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'answered' },
    });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка ответа на тикет' });
  }
}

// Закрыть тикет (клиент или оператор)
export async function closeTicket(req: Request, res: Response) {
  const { ticketId } = req.body;
  const userId = req.user?.id;
  const isOperator = Number(req.user?.operator) === 1;
  if (!userId) return res.status(401).json({ error: 'Нет авторизации' });
  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: 'Тикет не найден' });
    if (!isOperator && ticket.userId !== userId) return res.status(403).json({ error: 'Нет прав' });
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'closed' },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка закрытия тикета' });
  }
}
