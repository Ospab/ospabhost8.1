import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';

/**
 * Middleware для проверки прав администратора
 */
export const requireAdmin = async (req: Request, res: Response, next: any) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }

    next();
  } catch (error) {
    console.error('Ошибка проверки прав админа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export class AdminController {
  /**
   * Получить всех пользователей
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          balance: true,
          isAdmin: true,
          operator: true,
          createdAt: true,
          _count: {
            select: {
              servers: true,
              tickets: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({ status: 'success', data: users });
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      res.status(500).json({ message: 'Ошибка получения пользователей' });
    }
  }

  /**
   * Получить детальную информацию о пользователе
   */
  async getUserDetails(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          servers: {
            include: {
              tariff: true,
              os: true
            }
          },
          checks: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          tickets: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20
          }
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      res.json({ status: 'success', data: user });
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      res.status(500).json({ message: 'Ошибка получения данных' });
    }
  }

  /**
   * Начислить средства пользователю
   */
  async addBalance(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { amount, description } = req.body;
      const adminId = (req as any).user?.id;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Некорректная сумма' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore + amount;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { balance: balanceAfter }
        }),
        prisma.transaction.create({
          data: {
            userId,
            amount,
            type: 'deposit',
            description: description || `Пополнение баланса администратором`,
            balanceBefore,
            balanceAfter,
            adminId
          }
        }),
        prisma.notification.create({
          data: {
            userId,
            title: 'Пополнение баланса',
            message: `На ваш счёт зачислено ${amount}₽. ${description || ''}`
          }
        })
      ]);

      res.json({ 
        status: 'success', 
        message: `Баланс пополнен на ${amount}₽`,
        newBalance: balanceAfter
      });
    } catch (error) {
      console.error('Ошибка пополнения баланса:', error);
      res.status(500).json({ message: 'Ошибка пополнения баланса' });
    }
  }

  /**
   * Списать средства у пользователя
   */
  async withdrawBalance(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { amount, description } = req.body;
      const adminId = (req as any).user?.id;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Некорректная сумма' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      if (user.balance < amount) {
        return res.status(400).json({ message: 'Недостаточно средств на балансе' });
      }

      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore - amount;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { balance: balanceAfter }
        }),
        prisma.transaction.create({
          data: {
            userId,
            amount: -amount,
            type: 'withdrawal',
            description: description || `Списание администратором`,
            balanceBefore,
            balanceAfter,
            adminId
          }
        }),
        prisma.notification.create({
          data: {
            userId,
            title: 'Списание с баланса',
            message: `С вашего счёта списано ${amount}₽. ${description || ''}`
          }
        })
      ]);

      res.json({ 
        status: 'success', 
        message: `Списано ${amount}₽`,
        newBalance: balanceAfter
      });
    } catch (error) {
      console.error('Ошибка списания средств:', error);
      res.status(500).json({ message: 'Ошибка списания средств' });
    }
  }

  /**
   * Удалить сервер пользователя
   */
  async deleteServer(req: Request, res: Response) {
    try {
      const serverId = parseInt(req.params.serverId);
      const { reason } = req.body;
      const adminId = (req as any).user?.id;

      const server = await prisma.server.findUnique({
        where: { id: serverId },
        include: { user: true, tariff: true }
      });

      if (!server) {
        return res.status(404).json({ message: 'Сервер не найден' });
      }

      // Удаляем сервер из Proxmox (если есть proxmoxId)
      // TODO: Добавить вызов proxmoxApi.deleteContainer(server.proxmoxId)

      // Удаляем из БД
      await prisma.$transaction([
        prisma.server.delete({
          where: { id: serverId }
        }),
        prisma.notification.create({
          data: {
            userId: server.userId,
            title: 'Сервер удалён',
            message: `Ваш сервер #${serverId} был удалён администратором. ${reason ? `Причина: ${reason}` : ''}`
          }
        })
      ]);

      res.json({ 
        status: 'success', 
        message: `Сервер #${serverId} удалён`
      });
    } catch (error) {
      console.error('Ошибка удаления сервера:', error);
      res.status(500).json({ message: 'Ошибка удаления сервера' });
    }
  }

  /**
   * Получить статистику платформы
   */
  async getStatistics(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalServers,
        activeServers,
        suspendedServers,
        totalBalance,
        pendingChecks,
        openTickets
      ] = await Promise.all([
        prisma.user.count(),
        prisma.server.count(),
        prisma.server.count({ where: { status: 'running' } }),
        prisma.server.count({ where: { status: 'suspended' } }),
        prisma.user.aggregate({ _sum: { balance: true } }),
        prisma.check.count({ where: { status: 'pending' } }),
        prisma.ticket.count({ where: { status: 'open' } })
      ]);

      // Получаем последние транзакции
      const recentTransactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      res.json({
        status: 'success',
        data: {
          users: {
            total: totalUsers
          },
          servers: {
            total: totalServers,
            active: activeServers,
            suspended: suspendedServers
          },
          balance: {
            total: totalBalance._sum.balance || 0
          },
          checks: {
            pending: pendingChecks
          },
          tickets: {
            open: openTickets
          },
          recentTransactions
        }
      });
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      res.status(500).json({ message: 'Ошибка получения статистики' });
    }
  }

  /**
   * Изменить права пользователя (админ/оператор)
   */
  async updateUserRole(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { isAdmin, operator } = req.body;

      const updates: any = {};
      if (typeof isAdmin === 'boolean') updates.isAdmin = isAdmin;
      if (typeof operator === 'number') updates.operator = operator;

      await prisma.user.update({
        where: { id: userId },
        data: updates
      });

      res.json({ 
        status: 'success', 
        message: 'Права пользователя обновлены'
      });
    } catch (error) {
      console.error('Ошибка обновления прав:', error);
      res.status(500).json({ message: 'Ошибка обновления прав' });
    }
  }
}

export default new AdminController();
