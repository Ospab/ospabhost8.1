import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Server {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  os: { name: string; type: string };
  tariff: { name: string; price: number };
}

const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/server');
        console.log('Ответ API серверов:', res.data);
        // Защита от получения HTML вместо JSON
        if (typeof res.data === 'string' && res.data.startsWith('<!doctype html')) {
          setError('Ошибка соединения с backend: получен HTML вместо JSON. Проверьте адрес и порт.');
          setServers([]);
        } else if (Array.isArray(res.data)) {
          setServers(res.data);
        } else {
          setError('Некорректный формат данных серверов');
          setServers([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки серверов:', err);
        setError('Ошибка загрузки серверов');
        setServers([]);
      }
      setLoading(false);
    };
    fetchServers();
  }, []);

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Серверы</h2>
        {/* Кнопка 'Купить сервер' только если серверов нет */}
        {servers.length === 0 && !loading && !error && (
          <a href="/tariffs" className="bg-ospab-primary text-white px-4 py-2 rounded font-bold hover:bg-ospab-primary-dark transition">Купить сервер</a>
        )}
      </div>
      {loading ? (
        <p className="text-lg text-gray-500">Загрузка...</p>
      ) : error ? (
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <button className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold hover:bg-ospab-primary-dark transition" onClick={() => window.location.reload()}>Перезагрузить страницу</button>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center">
          <p className="text-lg text-gray-500 mb-4">У вас пока нет активных серверов.</p>
          <a href="/tariffs" className="inline-block bg-ospab-primary text-white px-6 py-3 rounded-full font-bold hover:bg-ospab-primary-dark transition">Посмотреть тарифы</a>
        </div>
      ) : (
        <div className="text-center">
          <a href="/dashboard/servermanagement" className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold hover:bg-ospab-primary-dark transition">Перейти к управлению серверами</a>
        </div>
      )}
    </div>
  );
};

export default Servers;