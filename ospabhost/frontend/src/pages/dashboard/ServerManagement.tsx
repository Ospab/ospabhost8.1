import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { FaPlay, FaStop, FaRedo, FaTrash, FaKey, FaTerminal, FaCamera } from 'react-icons/fa';

interface Server {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  proxmoxId: number;
  ipAddress?: string;
  rootPassword?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  os: { name: string; type: string };
  tariff: { name: string; price: number; description: string };
}

interface ServerStats {
  vmid: number;
  status: string;
  uptime: number;
  cpu: number;
  memory: {
    used: number;
    max: number;
    usage: number;
  };
  disk: {
    used: number;
    max: number;
    usage: number;
  };
  network: {
    in: number;
    out: number;
  };
}

const ServerManagement: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [stats, setStats] = useState<Record<number, ServerStats>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ serverId: number; password: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [snapshotModal, setSnapshotModal] = useState<number | null>(null);
  const [snapshotName, setSnapshotName] = useState('');

  useEffect(() => {
    fetchServers();
    initializeWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('server:update', (data: any) => {
      console.log('Server update:', data);
      if (data.stats) {
        setStats(prev => ({
          ...prev,
          [data.serverId]: data.stats
        }));
      }
      if (data.server) {
        setServers(prev =>
          prev.map(s => s.id === data.serverId ? { ...s, ...data.server } : s)
        );
      }
    });

    newSocket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);
  };

  const fetchServers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('http://localhost:5000/api/server/my-servers', { headers });
      setServers(res.data);

      // Subscribe to server updates via WebSocket
      if (socket) {
        res.data.forEach((server: Server) => {
          socket.emit('subscribe:server', server.id);
        });
      }
    } catch (err) {
      setError('Ошибка загрузки серверов');
      console.error('Ошибка загрузки серверов:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket && servers.length > 0) {
      servers.forEach(server => {
        socket.emit('subscribe:server', server.id);
      });
    }
  }, [socket, servers]);

  const handleAction = async (serverId: number, action: 'start' | 'stop' | 'restart') => {
    setActionLoading(prev => ({ ...prev, [serverId]: true }));
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `http://localhost:5000/api/server/${serverId}/control`,
        { action },
        { headers }
      );
      
      // Refresh server list
      await fetchServers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка выполнения действия');
    } finally {
      setActionLoading(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const handleChangePassword = async (serverId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `http://localhost:5000/api/server/${serverId}/change-password`,
        {},
        { headers }
      );
      
      if (res.data.status === 'success' && res.data.password) {
        setPasswordModal({ serverId, password: res.data.password });
      } else {
        setError('Ошибка смены пароля');
      }
    } catch (err) {
      setError('Ошибка смены пароля');
    }
  };

  const handleOpenConsole = async (serverId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `http://localhost:5000/api/server/${serverId}/console`,
        { headers }
      );
      
      if (res.data.status === 'success' && res.data.url) {
        window.open(res.data.url, '_blank');
      } else {
        setError('Ошибка открытия консоли');
      }
    } catch (err) {
      setError('Ошибка открытия консоли');
    }
  };

  const handleCreateSnapshot = async (serverId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `http://localhost:5000/api/server/${serverId}/snapshot`,
        { name: snapshotName || undefined },
        { headers }
      );
      
      setSnapshotModal(null);
      setSnapshotName('');
      alert('Снэпшот создан успешно');
    } catch (err) {
      setError('Ошибка создания снэпшота');
    }
  };

  const handleDeleteServer = async (serverId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`http://localhost:5000/api/server/${serverId}`, { headers });
      
      setDeleteModal(null);
      await fetchServers();
    } catch (err) {
      setError('Ошибка удаления сервера');
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}д ${hours}ч ${minutes}м`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-500 text-lg">Загрузка серверов...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Управление серверами</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map(server => {
            const serverStats = stats[server.id];
            const isLoading = actionLoading[server.id];

            return (
              <div key={server.id} className="bg-white rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{server.tariff.name}</h2>
                    <p className="text-sm text-gray-500">ID: {server.id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      server.status === 'running'
                        ? 'bg-green-100 text-green-800'
                        : server.status === 'stopped'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {server.status}
                  </span>
                </div>

                {/* Server Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <p><strong>ОС:</strong> {server.os.name}</p>
                  <p><strong>IP:</strong> {server.ipAddress || 'Получение...'}</p>
                  {serverStats && (
                    <>
                      <p><strong>Uptime:</strong> {formatUptime(serverStats.uptime)}</p>
                    </>
                  )}
                </div>

                {/* Stats */}
                {serverStats && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">CPU</p>
                      <p className="text-lg font-bold text-blue-600">
                        {(serverStats.cpu * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">RAM</p>
                      <p className="text-lg font-bold text-green-600">
                        {serverStats.memory.usage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600">Disk</p>
                      <p className="text-lg font-bold text-purple-600">
                        {serverStats.disk.usage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(server.id, 'start')}
                      disabled={isLoading || server.status === 'running'}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FaPlay /> Start
                    </button>
                    <button
                      onClick={() => handleAction(server.id, 'stop')}
                      disabled={isLoading || server.status === 'stopped'}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FaStop /> Stop
                    </button>
                    <button
                      onClick={() => handleAction(server.id, 'restart')}
                      disabled={isLoading}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <FaRedo /> Restart
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenConsole(server.id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <FaTerminal /> Console
                    </button>
                    <button
                      onClick={() => handleChangePassword(server.id)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <FaKey /> Password
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSnapshotModal(server.id)}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <FaCamera /> Snapshot
                    </button>
                    <button
                      onClick={() => setDeleteModal(server.id)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {servers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">У вас пока нет серверов</p>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Новый root пароль</h3>
            <p className="text-gray-600 mb-4">
              Сохраните этот пароль в безопасном месте. Он больше не будет показан.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <code className="text-lg font-mono break-all">{passwordModal.password}</code>
            </div>
            <button
              onClick={() => setPasswordModal(null)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4 text-red-600">Подтвердите удаление</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот сервер? Это действие необратимо!
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDeleteServer(deleteModal)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Modal */}
      {snapshotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Создать снэпшот</h3>
            <input
              type="text"
              placeholder="Имя снэпшота (опционально)"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-6"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSnapshotModal(null);
                  setSnapshotName('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={() => handleCreateSnapshot(snapshotModal)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerManagement;
