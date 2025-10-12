import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface Tariff {
  id: number;
  name: string;
  price: number;
  description?: string;
}

interface OperatingSystem {
  id: number;
  name: string;
  type: string;
  template?: string;
}

interface CheckoutProps {
  onSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess }) => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [oses, setOses] = useState<OperatingSystem[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<number | null>(null);
  const [selectedOs, setSelectedOs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Загрузка тарифов и ОС
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [tariffRes, osRes] = await Promise.all([
          axios.get('https://ospab.host:5000/api/tariff', { headers }),
          axios.get('https://ospab.host:5000/api/os', { headers }),
        ]);
        setTariffs(tariffRes.data);
        setOses(osRes.data);
        // Автовыбор тарифа из query
        const params = new URLSearchParams(location.search);
        const tariffId = params.get('tariff');
        if (tariffId) {
          setSelectedTariff(Number(tariffId));
        }
      } catch {
        setError('Ошибка загрузки тарифов или ОС');
      }
    };
    fetchData();
  }, [location.search]);

  const handleBuy = async () => {
    if (!selectedTariff || !selectedOs) {
      setError('Выберите тариф и ОС');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('Покупка сервера:', { tariffId: selectedTariff, osId: selectedOs });
  const res = await axios.post('https://ospab.host:5000/api/server/create', {
        tariffId: selectedTariff,
        osId: selectedOs,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });
      if (res.data && res.data.error === 'Недостаточно средств на балансе') {
        setError('Недостаточно средств на балансе. Пополните баланс и попробуйте снова.');
        setLoading(false);
        return;
      }
      // После успешной покупки обновляем userData
      try {
  const userRes = await axios.get('https://ospab.host:5000/api/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        window.dispatchEvent(new CustomEvent('userDataUpdate', {
          detail: {
            user: userRes.data.user,
            balance: userRes.data.user.balance ?? 0,
            servers: userRes.data.user.servers ?? [],
            tickets: userRes.data.user.tickets ?? [],
          }
        }));
      } catch (err) {
        console.error('Ошибка обновления userData после покупки:', err);
      }
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error === 'Недостаточно средств на балансе') {
        setError('Недостаточно средств на балансе. Пополните баланс и попробуйте снова.');
      } else {
        setError('Ошибка покупки сервера');
      }
      console.error('Ошибка покупки сервера:', err);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Покупка сервера</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Тариф:</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedTariff ?? ''}
          onChange={e => setSelectedTariff(Number(e.target.value))}
        >
          <option value="">Выберите тариф</option>
          {tariffs.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} — ₽{t.price}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Операционная система:</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedOs ?? ''}
          onChange={e => setSelectedOs(Number(e.target.value))}
        >
          <option value="">Выберите ОС</option>
          {oses.map(os => (
            <option key={os.id} value={os.id}>
              {os.name} ({os.type})
            </option>
          ))}
        </select>
      </div>
      <button
        className="bg-ospab-primary text-white px-6 py-2 rounded font-bold w-full"
        onClick={handleBuy}
        disabled={loading}
      >
        {loading ? 'Покупка...' : 'Купить сервер'}
      </button>
    </div>
  );
};

export default Checkout;
