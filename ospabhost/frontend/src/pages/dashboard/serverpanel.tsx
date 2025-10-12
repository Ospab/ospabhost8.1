
import React, { useEffect, useState } from 'react';
import ServerConsole from '../../components/ServerConsole';
import { useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

// Типы
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

interface ServerStats {
  data?: {
    cpu?: number;
    memory?: { usage?: number };
  };
}

// ...existing code...

// ConsoleSection больше не нужен

const TABS = [
  { key: 'overview', label: 'Обзор' },
  { key: 'console', label: 'Консоль' },
  { key: 'stats', label: 'Статистика' },
  { key: 'manage', label: 'Управление' },
  { key: 'security', label: 'Безопасность' },
  { key: 'network', label: 'Сеть' },
  { key: 'backups', label: 'Бэкапы' },
  { key: 'monitoring', label: 'Мониторинг' },
  { key: 'logs', label: 'Логи' },
];

const ServerPanel: React.FC = () => {
  const { id } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeAction, setActiveAction] = useState<null | 'start' | 'stop' | 'restart'>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newRoot, setNewRoot] = useState<string | null>(null);
  const [showRoot, setShowRoot] = useState(false);
  // overlay больше не нужен
  const [stats, setStats] = useState<ServerStats | null>(null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`https://ospab.host:5000/api/server/${id}`, { headers });
        setServer(res.data);
        // Получаем статистику
  const statsRes = await axios.get(`https://ospab.host:5000/api/server/${id}/status`, { headers });
        setStats(statsRes.data.stats);
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

  // Смена root-пароля через backend
  const handleGenerateRoot = async () => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`https://ospab.host:5000/api/server/${id}/password`, {}, { headers });
      if (res.data?.status === 'success' && res.data.password) {
        setNewRoot(res.data.password);
        setShowRoot(true);
        setSuccess('Root-пароль успешно изменён!');
      } else {
        setError('Ошибка смены root-пароля');
        console.error('Ошибка смены root-пароля:', res.data);
      }
    } catch (err) {
      setError('Ошибка смены root-пароля');
      console.error('Ошибка смены root-пароля:', err);
      const axiosErr = err as AxiosError;
      if (axiosErr && axiosErr.response) {
        console.error('Ответ сервера:', axiosErr.response.data);
      }
    }
  };

  // Реальные действия управления сервером
  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    try {
      setLoading(true);
      setActiveAction(action);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`https://ospab.host:5000/api/server/${id}/${action}`, {}, { headers });
      if (res.data?.status === 'success' || res.data?.message === 'Статус сервера изменён успешно') {
        // Обновить статус сервера и статистику после действия
  const updated = await axios.get(`https://ospab.host:5000/api/server/${id}`, { headers });
        setServer(updated.data);
  const statsRes = await axios.get(`https://ospab.host:5000/api/server/${id}/status`, { headers });
        setStats(statsRes.data.stats);
        setSuccess('Действие выполнено успешно!');
      } else {
        setError(`Ошибка: ${res.data?.message || 'Не удалось выполнить действие'}`);
      }
    } catch (err) {
      setError('Ошибка управления сервером');
      console.error('Ошибка управления сервером:', err);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-7xl mt-10 flex flex-row min-h-[700px]">
        <aside className="w-64 pr-8 border-r border-gray-200 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Сервер #{server?.id}</h1>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-5 py-3 rounded-xl font-semibold transition-colors duration-200 mb-1 ${activeTab === tab.key ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </aside>
        <main className="flex-1 pl-8">
          {activeTab === 'overview' && server && (
            <div className="bg-gradient-to-br from-ospab-primary/80 to-ospab-primary-dark/80 rounded-2xl shadow-lg p-8 flex flex-col items-start w-full max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700">Статус</span>
                  <span className={`text-base font-semibold px-3 py-1 rounded-xl ${server.status === 'running' ? 'bg-green-100 text-green-800' : server.status === 'stopped' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'} shadow w-fit`}>{server.status === 'running' ? 'Работает' : server.status === 'stopped' ? 'Остановлен' : server.status}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700">IP-адрес</span>
                  <span className="font-mono text-base text-gray-900">{server.ip || '—'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700">Операционная система</span>
                  <span className="text-gray-900">{server.os.name} <span className="text-xs text-gray-500">({server.os.type})</span></span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700">Тариф</span>
                  <span className="text-base font-semibold px-3 py-1 rounded-xl bg-ospab-primary/10 text-ospab-primary shadow w-fit">{server.tariff.name}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700">Цена</span>
                  <span className="font-mono text-base text-gray-900">{server.tariff.price}₽</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700">Root-пароль</span>
                  {(() => {
                    const created = new Date(server.createdAt);
                    const now = new Date();
                    const diffMin = (now.getTime() - created.getTime()) / 1000 / 60;
                    if (server.rootPassword && diffMin <= 30) {
                      return (
                        <div className="flex items-center gap-2 relative">
                          <span
                            className="font-mono text-base bg-gray-100 text-gray-900 px-3 py-1 rounded"
                            style={{ userSelect: showRoot ? 'text' : 'none', WebkitUserSelect: showRoot ? 'text' : 'none' }}
                          >{showRoot ? server.rootPassword : '************'}</span>
                          {!showRoot ? (
                            <button
                              className="bg-ospab-primary text-white px-2 py-1 rounded text-xs font-bold hover:bg-ospab-primary-dark transition"
                              onClick={() => setShowRoot(true)}
                            >Показать</button>
                          ) : (
                            <button
                              className="bg-ospab-primary text-white px-2 py-1 rounded text-xs font-bold hover:bg-ospab-primary-dark transition"
                              onClick={() => { navigator.clipboard.writeText(server.rootPassword || ''); setShowRoot(false); }}
                            >Скопировать</button>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <span className="font-mono text-base text-gray-900">—</span>
                      );
                    }
                  })()}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 w-full mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span className="text-sm text-gray-700">Создан:</span>
                  <span className="font-semibold text-gray-900">{new Date(server.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  <span className="text-sm text-gray-700">Обновлён:</span>
                  <span className="font-semibold text-gray-900">{new Date(server.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'console' && server && (
            <ServerConsole />
          )}

          {activeTab === 'stats' && (
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="mb-2 font-bold">Графики нагрузки</div>
              <div className="flex gap-6">
                <div className="w-1/2 h-32 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center">
                  <div className="font-bold text-gray-700">CPU</div>
                  <div className="text-2xl text-ospab-primary">{stats?.data?.cpu ? (stats.data.cpu * 100).toFixed(1) : '—'}%</div>
                </div>
                <div className="w-1/2 h-32 bg-white rounded-lg shadow-inner flex flex-col items-center justify-center">
                  <div className="font-bold text-gray-700">RAM</div>
                  <div className="text-2xl text-ospab-primary">{stats?.data?.memory?.usage ? stats.data.memory.usage.toFixed(1) : '—'}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && server && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-6">
                <button
                  className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold flex items-center justify-center ${server.status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleAction('start')}
                  disabled={server.status === 'running' || loading}
                >
                  {loading && activeAction === 'start' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Выполняется...
                    </span>
                  ) : 'Запустить'}
                </button>
                <button
                  className={`bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-bold flex items-center justify-center ${server.status !== 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleAction('restart')}
                  disabled={server.status !== 'running' || loading}
                >
                  {loading && activeAction === 'restart' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Выполняется...
                    </span>
                  ) : 'Перезагрузить'}
                </button>
                <button
                  className={`bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center justify-center ${server.status === 'stopped' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleAction('stop')}
                  disabled={server.status === 'stopped' || loading}
                >
                  {loading && activeAction === 'stop' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Выполняется...
                    </span>
                  ) : 'Остановить'}
                </button>
              </div>
              {success && (
                <div className="text-green-600 text-base font-semibold mt-2">{success}</div>
              )}
              {error && (
                <div className="text-red-500 text-base font-semibold mt-2">{error}</div>
              )}
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">Сеть: здесь будет управление сетевыми настройками</div>
          )}
          {activeTab === 'backups' && (
            <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">Бэкапы: здесь будет управление резервными копиями</div>
          )}
          {activeTab === 'monitoring' && (
            <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">Мониторинг: здесь будет расширенный мониторинг</div>
          )}
          {activeTab === 'logs' && (
            <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-500">Логи: здесь будут логи сервера</div>
          )}
          {activeTab === 'security' && server && (
            <div className="space-y-4">
              <button className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold" onClick={handleGenerateRoot}>Сгенерировать новый root-пароль</button>
              {showRoot && newRoot && (
                <div className="bg-gray-100 rounded-xl p-6 flex flex-col items-center">
                  <div className="mb-2 font-bold text-lg">Ваш новый root-пароль:</div>
                  <div
                    className="font-mono text-xl bg-white px-6 py-3 rounded-lg shadow-inner"
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >{newRoot.replace(/./g, '*')}</div>
                  <button
                    className="bg-ospab-primary text-white px-2 py-1 rounded text-xs font-bold hover:bg-ospab-primary-dark transition mt-2"
                    onClick={() => setShowRoot(false)}
                  >Скрыть</button>
                </div>
              )}
              {success && (
                <div className="text-green-600 text-base font-semibold mt-2">{success}</div>
              )}
              {error && (
                <div className="text-red-500 text-base font-semibold mt-2">{error}</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ServerPanel;