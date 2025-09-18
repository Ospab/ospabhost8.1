// 3. Исправляем frontend/src/pages/dashboard/billing.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';

const Billing = () => {
  const [amount, setAmount] = useState(0);
  const [isPaymentGenerated, setIsPaymentGenerated] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  // ИСПРАВЛЕНО: используем правильные переменные окружения для Vite
  const cardNumber = import.meta.env.VITE_CARD_NUMBER || '';
  const sbpUrl = import.meta.env.VITE_SBP_QR_URL || '';

  const handleGeneratePayment = () => {
    if (amount <= 0) {
      alert('Пожалуйста, введите сумму больше нуля.');
      return;
    }
    if (!cardNumber || !sbpUrl) {
      alert('Данные для оплаты не настроены. Пожалуйста, обратитесь к администратору.');
      return;
    }
    setIsPaymentGenerated(true);
  };

  const handleCopyCard = () => {
    if (cardNumber) {
      navigator.clipboard.writeText(cardNumber);
      setCopyStatus('Номер карты скопирован!');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Пополнение баланса</h2>
      
      {!isPaymentGenerated ? (
        <div>
          <p className="text-lg text-gray-500 mb-4">
            Пополните свой баланс, чтобы оплачивать услуги. Минимальная сумма пополнения: 1 руб.
          </p>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">Сумма (₽)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ospab-primary"
              min="1"
            />
          </div>
          <button
            onClick={handleGeneratePayment}
            className="w-full px-5 py-3 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent"
          >
            Сгенерировать платеж
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg text-gray-700 mb-4">
            Для пополнения баланса переведите <strong>₽{amount}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Ваш заказ будет обработан вручную после проверки чека.
          </p>
          
          {sbpUrl && (
            <div className="bg-gray-100 p-6 rounded-2xl inline-block mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Оплата по СБП</h3>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCode value={sbpUrl} size={256} />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Отсканируйте QR-код через мобильное приложение вашего банка.
              </p>
            </div>
          )}
          
          {cardNumber && (
            <div className="bg-gray-100 p-6 rounded-2xl mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Оплата по номеру карты</h3>
              <p className="text-2xl font-bold text-gray-800 select-all">{cardNumber}</p>
              <button
                onClick={handleCopyCard}
                className="mt-4 px-4 py-2 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-gray-500 hover:bg-gray-700"
              >
                Скопировать номер карты
              </button>
              {copyStatus && <p className="mt-2 text-sm text-green-500">{copyStatus}</p>}
            </div>
          )}

          <div className="bg-red-50 p-6 rounded-2xl border-l-4 border-red-500 text-left mb-6">
            <p className="font-bold text-red-800">Важно:</p>
            <p className="text-sm text-red-700">
              После оплаты сделайте скриншот или сохраните чек и отправьте его нам в тикет поддержки.
            </p>
          </div>
          
          <p className="mt-4 text-gray-600">
            После подтверждения ваш баланс будет пополнен. Перейдите в раздел{' '}
            <Link to="/dashboard/tickets" className="text-ospab-primary font-bold hover:underline">
              Тикеты
            </Link>
            , чтобы отправить нам чек.
          </p>
        </div>
      )}
    </div>
  );
};

export default Billing;