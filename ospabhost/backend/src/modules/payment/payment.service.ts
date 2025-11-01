import { prisma } from '../../prisma/client';

// Утилита для добавления дней к дате
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export class PaymentService {
  /**
   * Обработка автоматических платежей за серверы
   * Запускается по расписанию каждые 6 часов
   */
  async processAutoPayments() {
    const now = new Date();
    
    // Находим серверы, у которых пришло время оплаты
    const serversDue = await prisma.server.findMany({
      where: {
        status: { in: ['running', 'stopped'] },
        autoRenew: true,
        nextPaymentDate: {
          lte: now
        }
      },
      include: {
        user: true,
        tariff: true
      }
    });

    console.log(`[Payment Service] Найдено серверов для оплаты: ${serversDue.length}`);

    for (const server of serversDue) {
      try {
        await this.chargeServerPayment(server);
      } catch (error) {
        console.error(`[Payment Service] Ошибка при списании за сервер ${server.id}:`, error);
      }
    }
  }

  /**
   * Списание оплаты за конкретный сервер
   */
  async chargeServerPayment(server: any) {
    const amount = server.tariff.price;
    const user = server.user;

    // Проверяем достаточно ли средств
    if (user.balance < amount) {
      console.log(`[Payment Service] Недостаточно средств у пользователя ${user.id} для сервера ${server.id}`);
      
      // Создаём запись о неудачном платеже
      await prisma.payment.create({
        data: {
          userId: user.id,
          serverId: server.id,
          amount,
          status: 'failed',
          type: 'subscription',
          processedAt: new Date()
        }
      });

      // Отправляем уведомление
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Недостаточно средств',
          message: `Не удалось списать ${amount}₽ за сервер #${server.id}. Пополните баланс, иначе сервер будет приостановлен.`
        }
      });

      // Приостанавливаем сервер через 3 дня неоплаты
      const daysSincePaymentDue = Math.floor((new Date().getTime() - server.nextPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSincePaymentDue >= 3) {
        await prisma.server.update({
          where: { id: server.id },
          data: { status: 'suspended' }
        });

        await prisma.notification.create({
          data: {
            userId: user.id,
            title: 'Сервер приостановлен',
            message: `Сервер #${server.id} приостановлен из-за неоплаты.`
          }
        });
      }

      return;
    }

    // Списываем средства
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - amount;

    await prisma.$transaction([
      // Обновляем баланс
      prisma.user.update({
        where: { id: user.id },
        data: { balance: balanceAfter }
      }),

      // Создаём запись о платеже
      prisma.payment.create({
        data: {
          userId: user.id,
          serverId: server.id,
          amount,
          status: 'success',
          type: 'subscription',
          processedAt: new Date()
        }
      }),

      // Записываем транзакцию
      prisma.transaction.create({
        data: {
          userId: user.id,
          amount: -amount,
          type: 'withdrawal',
          description: `Оплата сервера #${server.id} за месяц`,
          balanceBefore,
          balanceAfter
        }
      }),

      // Обновляем дату следующего платежа (через 30 дней)
      prisma.server.update({
        where: { id: server.id },
        data: {
          nextPaymentDate: addDays(new Date(), 30)
        }
      })
    ]);

    console.log(`[Payment Service] Успешно списано ${amount}₽ с пользователя ${user.id} за сервер ${server.id}`);

    // Отправляем уведомление
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Списание за сервер',
        message: `Списано ${amount}₽ за сервер #${server.id}. Следующая оплата: ${addDays(new Date(), 30).toLocaleDateString('ru-RU')}`
      }
    });
  }

  /**
   * Устанавливаем дату первого платежа при создании сервера
   */
  async setInitialPaymentDate(serverId: number) {
    await prisma.server.update({
      where: { id: serverId },
      data: {
        nextPaymentDate: addDays(new Date(), 30)
      }
    });
  }
}

export default new PaymentService();
