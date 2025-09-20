// 3. Исправляем frontend/src/pages/dashboard/billing.tsx

import { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

const sbpUrl = import.meta.env.VITE_SBP_QR_URL;
const cardNumber = import.meta.env.VITE_CARD_NUMBER;


const Billing = () => {
  const [amount, setAmount] = useState(0);
  const [isPaymentGenerated, setIsPaymentGenerated] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [checkFile, setCheckFile] = useState<File | null>(null);
  const [checkStatus, setCheckStatus] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleGeneratePayment = () => {
    if (amount > 0) setIsPaymentGenerated(true);
  };

  const handleCopyCard = () => {
    if (cardNumber) {
      navigator.clipboard.writeText(cardNumber);
      setCopyStatus('Скопировано!');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleCheckUpload = async () => {
    if (!checkFile || amount <= 0) return;
    setUploadLoading(true);
    try {
  const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', checkFile);
      formData.append('amount', String(amount));
      const response = await axios.post('http://localhost:5000/api/check/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type' не указываем вручную для FormData!
        },
        withCredentials: true,
      });
      setCheckStatus('Чек успешно загружен! Ожидайте проверки.');
      setCheckFile(null);
      console.log('Чек успешно загружен:', response.data);
    } catch (error) {
      setCheckStatus('Ошибка загрузки чека.');
      console.error('Ошибка загрузки чека:', error);
    }
    setUploadLoading(false);
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Пополнение баланса</h2>
      {/* Только QR-код и карта, без реквизитов */}
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
          <div>
            <p className="text-lg text-gray-700 mb-4">
              Для пополнения баланса переведите <strong>₽{amount}</strong>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Ваш заказ будет обработан вручную после проверки чека.
            </p>
          </div>
          {/* QR-код для оплаты по СБП */}
          <div className="bg-gray-100 p-6 rounded-2xl inline-block mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Оплата по СБП</h3>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCode value={sbpUrl || 'https://qr.nspk.ru/FAKE-QR-LINK'} size={256} />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Отсканируйте QR-код через мобильное приложение вашего банка.
            </p>
          </div>
          {/* Номер карты с кнопкой копирования */}
          <div className="bg-gray-100 p-6 rounded-2xl mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Оплата по номеру карты</h3>
            <p className="text-2xl font-bold text-gray-800 select-all">{cardNumber || '0000 0000 0000 0000'}</p>
            <button
              onClick={handleCopyCard}
              className="mt-4 px-4 py-2 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-gray-500 hover:bg-gray-700"
            >
              Скопировать номер карты
            </button>
            {copyStatus && <p className="mt-2 text-sm text-green-500">{copyStatus}</p>}
          </div>
          {/* Форма загрузки чека и инструкции */}
          <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500 text-left mb-6">
            <p className="font-bold text-blue-800">Загрузите чек для проверки:</p>
            <input type="file" accept="image/*,application/pdf" onChange={e => setCheckFile(e.target.files?.[0] || null)} className="mt-2" />
            <button onClick={handleCheckUpload} disabled={!checkFile || uploadLoading} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
              {uploadLoading ? 'Загрузка...' : 'Отправить чек'}
            </button>
            {checkStatus && <div className="mt-2 text-green-600">{checkStatus}</div>}
          </div>
          <div className="bg-red-50 p-6 rounded-2xl border-l-4 border-red-500 text-left mb-6">
            <p className="font-bold text-red-800">Важно:</p>
            <p className="text-sm text-red-700">
              После оплаты сделайте скриншот или сохраните чек и загрузите его для проверки.
            </p>
          </div>
          <p className="mt-4 text-gray-600">
            После подтверждения ваш баланс будет пополнен. Ожидайте проверки чека оператором.
          </p>
        </div>
      )}
    </div>
  );
};

export default Billing;