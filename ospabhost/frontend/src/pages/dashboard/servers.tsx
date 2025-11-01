import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Server {
  id: number;
  status: string;
  createdAt: string;
  ipAddress: string | null;
  tariff: {
    name: string;
    price: number;
  };
  os: {
    name: string;
  };
  nextPaymentDate: string | null;
  autoRenew: boolean;
}

const Servers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.get(`${API_URL}/api/auth/me`, { headers });
      setServers(response.data.user.servers || []);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки серверов:', err);
      setError('Не удалось загрузить список серверов');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'creating':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Работает';
      case 'stopped':
        return 'Остановлен';
      case 'creating':
        return 'Создаётся';
      case 'suspended':
        return 'Приостановлен';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Мои серверы</h1>
        <Link
          to="/dashboard/checkout"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Купить сервер
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {servers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🖥️</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            У вас пока нет серверов
          </h2>
          <p className="text-gray-600 mb-6">
            Купите свой первый сервер, чтобы начать работу
          </p>
          <Link
            to="/dashboard/checkout"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Выбрать тариф
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <div
              key={server.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Сервер #{server.id}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getStatusColor(server.status)}`}>
                    {getStatusText(server.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Тариф:</span> {server.tariff.name}
                </p>
                <p>
                  <span className="font-medium">ОС:</span> {server.os.name}
                </p>
                <p>
                  <span className="font-medium">IP:</span> {server.ipAddress || 'Н/Д'}
                </p>
                {server.nextPaymentDate && (
                  <p>
                    <span className="font-medium">След. платёж:</span>{' '}
                    {new Date(server.nextPaymentDate).toLocaleDateString('ru-RU')}
                  </p>
                )}
                <p>
                  <span className="font-medium">Автопродление:</span>{' '}
                  {server.autoRenew ? '✅ Включено' : '❌ Выключено'}
                </p>
              </div>

              <Link
                to={`/dashboard/server/${server.id}`}
                className="block w-full text-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Управление
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Servers;