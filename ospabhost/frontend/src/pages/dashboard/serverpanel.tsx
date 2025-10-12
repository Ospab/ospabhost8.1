
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useServerStats } from '../../hooks/useSocket';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Встроенная секция консоли
function ConsoleSection({ serverId }: { serverId: number }) {
  const [consoleUrl, setConsoleUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenConsole = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`http://localhost:5000/api/proxmox/console`, { vmid: serverId }, { headers });
      if (res.data?.status === 'success' && res.data.url) {
        setConsoleUrl(res.data.url);
      } else {
        setError('Ошибка открытия консоли');
      }
    } catch {
      setError('Ошибка открытия консоли');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-xl p-6 text-gray-700 font-mono text-sm flex flex-col items-center">
      <div className="mb-2 font-bold">Консоль сервера</div>
      {!consoleUrl ? (
        <button
          className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold mb-4"
          onClick={handleOpenConsole}
          disabled={loading}
        >{loading ? 'Открытие...' : 'Открыть noVNC консоль'}</button>
      ) : (
        <iframe
          src={consoleUrl}
          title="noVNC Console"
          className="w-full h-[600px] rounded-lg border"
          allowFullScreen
        />
      )}
      {error && <div className="text-red-500 text-base font-semibold text-center mt-2">{error}</div>}
    </div>
  );
}

// Модальное окно для изменения конфигурации
function ResizeModal({ serverId, onClose, onSuccess }: { serverId: number; onClose: () => void; onSuccess: () => void }) {
  const [cores, setCores] = useState('');
  const [memory, setMemory] = useState('');
  const [disk, setDisk] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResize = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const data: any = {};
      if (cores) data.cores = Number(cores);
      if (memory) data.memory = Number(memory);
      if (disk) data.disk = Number(disk);

      const res = await axios.put(`http://localhost:5000/api/server/${serverId}/resize`, data, { headers });
      if (res.data?.status === 'success') {
        onSuccess();
        onClose();
      } else {
        setError('Ошибка изменения конфигурации');
      }
    } catch (err) {
      setError('Ошибка изменения конфигурации');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Изменить конфигурацию</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Количество ядер CPU</label>
            <input
              type="number"
              value={cores}
              onChange={(e) => setCores(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Оставьте пустым, чтобы не менять"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">RAM (МБ)</label>
            <input
              type="number"
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Например: 2048"
              min="512"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Диск (ГБ)</label>
            <input
              type="number"
              value={disk}
              onChange={(e) => setDisk(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Например: 40"
              min="10"
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex gap-4">
            <button
              onClick={handleResize}
              disabled={loading}
              className="flex-1 bg-ospab-primary text-white px-6 py-3 rounded-full font-bold disabled:opacity-50"
            >
              {loading ? 'Изменение...' : 'Применить'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-full font-bold"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для управления снэпшотами
function SnapshotsSection({ serverId }: { serverId: number }) {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snapName, setSnapName] = useState('');
  const [snapDesc, setSnapDesc] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSnapshots();
  }, [serverId]);

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`http://localhost:5000/api/server/${serverId}/snapshots`, { headers });
      if (res.data?.status === 'success') {
        setSnapshots(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading snapshots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!snapName) {
      setError('Введите имя снэпшота');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `http://localhost:5000/api/server/${serverId}/snapshots`,
        { snapname: snapName, description: snapDesc },
        { headers }
      );
      if (res.data?.status === 'success') {
        setSnapName('');
        setSnapDesc('');
        loadSnapshots();
      } else {
        setError('Ошибка создания снэпшота');
      }
    } catch (err) {
      setError('Ошибка создания снэпшота');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (snapname: string) => {
    if (!confirm(`Восстановить из снэпшота ${snapname}? Текущее состояние будет потеряно.`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `http://localhost:5000/api/server/${serverId}/snapshots/rollback`,
        { snapname },
        { headers }
      );
      alert('Снэпшот восстановлен');
    } catch (err) {
      alert('Ошибка восстановления снэпшота');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (snapname: string) => {
    if (!confirm(`Удалить снэпшот ${snapname}?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(
        `http://localhost:5000/api/server/${serverId}/snapshots`,
        { data: { snapname }, headers }
      );
      loadSnapshots();
    } catch (err) {
      alert('Ошибка удаления снэпшота');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">Управление снэпшотами</h3>
      
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-3">Создать новый снэпшот</h4>
        <div className="space-y-3">
          <input
            type="text"
            value={snapName}
            onChange={(e) => setSnapName(e.target.value)}
            placeholder="Имя снэпшота (например: backup-2024)"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={snapDesc}
            onChange={(e) => setSnapDesc(e.target.value)}
            placeholder="Описание (опционально)"
            className="w-full px-4 py-2 border rounded-lg"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            onClick={handleCreateSnapshot}
            disabled={loading}
            className="bg-ospab-primary text-white px-6 py-2 rounded-full font-bold disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать снэпшот'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold mb-3">Существующие снэпшоты</h4>
        {snapshots.length === 0 ? (
          <p className="text-gray-500">Снэпшотов пока нет</p>
        ) : (
          <div className="space-y-2">
            {snapshots.map((snap) => (
              <div key={snap.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold">{snap.name}</div>
                  <div className="text-sm text-gray-600">{snap.description || 'Без описания'}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRollback(snap.name)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-600"
                  >
                    Восстановить
                  </button>
                  <button
                    onClick={() => handleDelete(snap.name)}
                    className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-red-600"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

const TABS = [
  { key: 'overview', label: 'Обзор' },
  { key: 'console', label: 'Консоль' },
  { key: 'stats', label: 'Статистика' },
  { key: 'manage', label: 'Управление' },
  { key: 'snapshots', label: 'Снэпшоты' },
  { key: 'resize', label: 'Конфигурация' },
  { key: 'security', label: 'Безопасность' },
];


const ServerPanel: React.FC = () => {
  const { id } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [newRoot, setNewRoot] = useState<string | null>(null);
  const [showRoot, setShowRoot] = useState(false);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [showResizeModal, setShowResizeModal] = useState(false);
  
  // Real-time WebSocket stats
  const { stats: realtimeStats, alerts, connected } = useServerStats(server?.id || null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`http://localhost:5000/api/server/${id}`, { headers });
        setServer(res.data);
        // Получаем статистику
        const statsRes = await axios.get(`http://localhost:5000/api/server/${id}/status`, { headers });
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
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`http://localhost:5000/api/server/${id}/password`, {}, { headers });
      if (res.data?.status === 'success' && res.data.password) {
        setNewRoot(res.data.password);
        setShowRoot(true);
      } else {
        setError('Ошибка смены root-пароля');
      }
    } catch (err) {
      setError('Ошибка смены root-пароля');
      console.error('Ошибка смены root-пароля:', err);
    }
  };

  // Реальные действия управления сервером
  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`http://localhost:5000/api/server/${id}/${action}`, {}, { headers });
      if (res.data?.status === 'success') {
        // Обновить статус сервера и статистику после действия
        const updated = await axios.get(`http://localhost:5000/api/server/${id}`, { headers });
        setServer(updated.data);
        const statsRes = await axios.get(`http://localhost:5000/api/server/${id}/status`, { headers });
        setStats(statsRes.data.stats);
      } else {
        setError(`Ошибка: ${res.data?.message || 'Не удалось выполнить действие'}`);
      }
    } catch (err) {
      setError('Ошибка управления сервером');
      console.error('Ошибка управления сервером:', err);
    } finally {
      setLoading(false);
    }
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
          <ConsoleSection serverId={server.id} />
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* WebSocket connection status */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Подключено к live-мониторингу' : 'Нет подключения к мониторингу'}
              </span>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ Предупреждения</h3>
                <div className="space-y-1">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="text-yellow-700 text-sm">
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time stats cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="font-bold text-gray-700 mb-2">CPU</div>
                <div className="text-3xl text-ospab-primary font-bold">
                  {realtimeStats?.data?.cpu ? (realtimeStats.data.cpu * 100).toFixed(1) : stats?.data?.cpu ? (stats.data.cpu * 100).toFixed(1) : '—'}%
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="font-bold text-gray-700 mb-2">RAM</div>
                <div className="text-3xl text-ospab-primary font-bold">
                  {realtimeStats?.data?.memory?.usage?.toFixed(1) || stats?.data?.memory?.usage?.toFixed(1) || '—'}%
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="font-bold text-gray-700 mb-2">Disk</div>
                <div className="text-3xl text-ospab-primary font-bold">
                  {realtimeStats?.data?.disk?.usage?.toFixed(1) || '—'}%
                </div>
              </div>
            </div>

            {/* Charts */}
            {realtimeStats?.data?.rrdData && realtimeStats.data.rrdData.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">История использования (последний час)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtimeStats.data.rrdData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#8b5cf6" name="CPU %" />
                    <Line type="monotone" dataKey="mem" stroke="#3b82f6" name="Memory (bytes)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Detailed stats */}
            <div className="bg-gray-100 rounded-xl p-6">
              <div className="mb-2 font-bold">Детальная статистика</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Memory Used</div>
                  <div className="text-lg font-semibold">
                    {realtimeStats?.data?.memory?.used 
                      ? `${(realtimeStats.data.memory.used / (1024 * 1024 * 1024)).toFixed(2)} GB`
                      : '—'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Memory Max</div>
                  <div className="text-lg font-semibold">
                    {realtimeStats?.data?.memory?.max
                      ? `${(realtimeStats.data.memory.max / (1024 * 1024 * 1024)).toFixed(2)} GB`
                      : '—'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Network In</div>
                  <div className="text-lg font-semibold">
                    {realtimeStats?.data?.network?.in
                      ? `${(realtimeStats.data.network.in / (1024 * 1024)).toFixed(2)} MB`
                      : '—'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600">Network Out</div>
                  <div className="text-lg font-semibold">
                    {realtimeStats?.data?.network?.out
                      ? `${(realtimeStats.data.network.out / (1024 * 1024)).toFixed(2)} MB`
                      : '—'}
                  </div>
                </div>
              </div>
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

        {activeTab === 'snapshots' && (
          <SnapshotsSection serverId={server.id} />
        )}

        {activeTab === 'resize' && (
          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Изменение конфигурации сервера</h3>
            <p className="text-gray-600 mb-4">
              Вы можете увеличить или уменьшить ресурсы вашего сервера (CPU, RAM, диск).
              Изменения вступят в силу после перезапуска сервера.
            </p>
            <button
              onClick={() => setShowResizeModal(true)}
              className="bg-ospab-primary text-white px-6 py-3 rounded-full font-bold hover:bg-opacity-90"
            >
              Изменить конфигурацию
            </button>
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

      {/* Resize Modal */}
      {showResizeModal && (
        <ResizeModal
          serverId={server.id}
          onClose={() => setShowResizeModal(false)}
          onSuccess={() => {
            // Reload server data after resize
            const fetchServer = async () => {
              const token = localStorage.getItem('access_token');
              const headers = token ? { Authorization: `Bearer ${token}` } : {};
              const res = await axios.get(`http://localhost:5000/api/server/${id}`, { headers });
              setServer(res.data);
            };
            fetchServer();
          }}
        />
      )}
    </div>
  );
};

export default ServerPanel;
