
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

interface Server {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  os: { name: string; type: string };
  tariff: { name: string; price: number };
  ip?: string;
  rootPassword?: string;
}

const TABS = [
  { key: 'overview', label: 'Обзор' },
  { key: 'console', label: 'Консоль' },
  { key: 'stats', label: 'Статистика' },
  { key: 'manage', label: 'Управление' },
  { key: 'security', label: 'Безопасность' },
];

const generatePassword = () => {
  return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-6);
};

const ServerPanel: React.FC = () => {
  const { id } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [newRoot, setNewRoot] = useState<string | null>(null);
  const [showRoot, setShowRoot] = useState(false);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:5000/api/server/${id}`, { headers });
        setServer(res.data);
      } catch (err) {
        const error = err as AxiosError;
        if (error?.response?.status === 404) {
          setError('Сервер не найден или был удалён.');
        } else {
          setError('Ошибка загрузки данных сервера');
        }
        console.error('Ошибка загрузки данных сервера:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServer();
  }, [id]);

  // Генерация root-пароля (только для копирования)
  const handleGenerateRoot = () => {
    try {
      const password = generatePassword();
      setNewRoot(password);
      setShowRoot(true);
      // TODO: отправить новый пароль на backend для смены
    } catch (err) {
      console.error('Ошибка генерации root-пароля:', err);
    }
  };

  // Базовые действия (заглушки)
  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    alert(`Выполнено действие: ${action} (реализовать вызов к backend)`);
    // TODO: реализовать вызов к backend
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><span className="text-gray-500 text-lg">Загрузка...</span></div>;
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-xl w-full flex flex-col items-center">
          <span className="text-red-500 text-xl font-bold mb-4">{error}</span>
          <button
            className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold hover:bg-ospab-primary-dark transition"
            onClick={() => window.location.href = '/dashboard/servers'}
          >
            Вернуться к списку серверов
          </button>
        </div>
      </div>
    );
  }
  if (!server) {
    return <div className="flex min-h-screen items-center justify-center"><span className="text-red-500 text-lg">Сервер не найден</span></div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-3xl w-full mt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Панель управления сервером #{server.id}</h1>
        <div className="flex gap-4 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-xl font-semibold transition-colors duration-200 ${activeTab === tab.key ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="text-lg text-gray-800 font-bold">Статус: <span className="font-normal">{server.status}</span></div>
            <div className="text-lg text-gray-800 font-bold">Тариф: <span className="font-normal">{server.tariff.name} ({server.tariff.price}₽)</span></div>
            <div className="text-lg text-gray-800 font-bold">ОС: <span className="font-normal">{server.os.name} ({server.os.type})</span></div>
            <div className="text-lg text-gray-800 font-bold">IP: <span className="font-normal">{server.ip || '—'}</span></div>
            <div className="text-lg text-gray-800 font-bold">Создан: <span className="font-normal">{new Date(server.createdAt).toLocaleString()}</span></div>
            <div className="text-lg text-gray-800 font-bold">Обновлён: <span className="font-normal">{new Date(server.updatedAt).toLocaleString()}</span></div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="bg-gray-100 rounded-xl p-6 text-gray-700 font-mono text-sm">
            <div className="mb-2 font-bold">Консоль сервера (заглушка)</div>
            <div className="bg-black text-green-400 p-4 rounded-lg">root@{server.ip || 'server'}:~# _</div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="mb-2 font-bold">Графики нагрузки (заглушка)</div>
            <div className="flex gap-6">
              <div className="w-1/2 h-32 bg-white rounded-lg shadow-inner flex items-center justify-center text-gray-400">CPU</div>
              <div className="w-1/2 h-32 bg-white rounded-lg shadow-inner flex items-center justify-center text-gray-400">RAM</div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="flex gap-6">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold" onClick={() => handleAction('start')}>Запустить</button>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-bold" onClick={() => handleAction('restart')}>Перезагрузить</button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold" onClick={() => handleAction('stop')}>Остановить</button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <button className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold" onClick={handleGenerateRoot}>Сгенерировать новый root-пароль</button>
            {showRoot && newRoot && (
              <div className="bg-gray-100 rounded-xl p-6 flex flex-col items-center">
                <div className="mb-2 font-bold text-lg">Ваш новый root-пароль:</div>
                <div className="font-mono text-xl bg-white px-6 py-3 rounded-lg shadow-inner select-all">{newRoot}</div>
                <div className="text-gray-500 mt-2">Скопируйте пароль — он будет показан только один раз!</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerPanel;
