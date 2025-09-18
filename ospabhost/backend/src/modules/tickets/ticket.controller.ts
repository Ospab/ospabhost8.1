import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: number;
}

// Create a new ticket (users only)
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован.' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Заголовок и сообщение обязательны.' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        message,
        userId,
        status: 'open'
      },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        responses: {
          include: {
            operator: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Тикет успешно создан.',
      ticket
    });
  } catch (error) {
    console.error('Ошибка при создании тикета:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании тикета.' });
  }
};

// Get user's own tickets
export const getMyTickets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован.' });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId
      },
      include: {
        responses: {
          include: {
            operator: {
              select: {
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      tickets
    });
  } catch (error) {
    console.error('Ошибка при получении тикетов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении тикетов.' });
  }
};

// Get all tickets (operators only)
export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Пользователь не авторизован.' });
    }

    // Check if user is operator
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.operator !== 1) {
      return res.status(403).json({ message: 'Доступ запрещен. Только операторы могут просматривать все тикеты.' });
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        responses: {
          include: {
            operator: {
              select: {
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      tickets
    });
  } catch (error) {
    console.error('Ошибка при получении всех тикетов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении тикетов.' });
  }
};

// Create response to ticket (operators only)
export const createResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const operatorId = req.userId;

    if (!operatorId) {
      return res.status(401).json({ message: 'Пользователь не авторизован.' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Сообщение обязательно.' });
    }

    // Check if user is operator
    const operator = await prisma.user.findUnique({
      where: { id: operatorId }
    });

    if (!operator || operator.operator !== 1) {
      return res.status(403).json({ message: 'Доступ запрещен. Только операторы могут отвечать на тикеты.' });
    }

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Тикет не найден.' });
    }

    const response = await prisma.response.create({
      data: {
        ticketId: parseInt(id),
        operatorId,
        message
      },
      include: {
        operator: {
          select: {
            username: true
          }
        }
      }
    });

    // Update ticket status to show it has been responded to
    await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: { status: 'pending' }
    });

    res.status(201).json({
      message: 'Ответ успешно добавлен.',
      response
    });
  } catch (error) {
    console.error('Ошибка при создании ответа:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании ответа.' });
  }
};