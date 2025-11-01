import paymentService from '../modules/payment/payment.service';

/**
 * Cron-задача для обработки автоматических платежей
 * Запускается каждые 6 часов
 */
export function startPaymentCron() {
  // Запускаем сразу при старте
  console.log('[Payment Cron] Запуск обработки автоматических платежей...');
  paymentService.processAutoPayments().catch((err: any) => {
    console.error('[Payment Cron] Ошибка при обработке платежей:', err);
  });

  // Затем каждые 6 часов
  setInterval(async () => {
    console.log('[Payment Cron] Запуск обработки автоматических платежей...');
    try {
      await paymentService.processAutoPayments();
      console.log('[Payment Cron] Обработка завершена');
    } catch (error) {
      console.error('[Payment Cron] Ошибка при обработке платежей:', error);
    }
  }, 6 * 60 * 60 * 1000); // 6 часов в миллисекундах
}
