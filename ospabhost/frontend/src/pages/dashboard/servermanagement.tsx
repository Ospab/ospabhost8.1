import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';

interface Server {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  tariff: { name: string; price: number };
  os: { name: string; type: string };
}

const ServerManagementPage = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    const fetchServers = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://localhost:5000/api/server', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServers(res.data);
      } catch {
        setError('Ошибка загрузки серверов');
        setServers([]);
      }
      setLoading(false);
    };
    fetchServers();
  }, [isLoggedIn, navigate]);

  // TODO: добавить управление сервером (включить, выключить, перезагрузить, переустановить ОС)

  try {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">Управление серверами</h1>
          {loading ? (
            <p className="text-lg text-gray-500 text-center">Загрузка...</p>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-lg text-red-500">{error}</p>
              <button className="mt-4 px-4 py-2 rounded bg-ospab-primary text-white font-bold" onClick={() => window.location.reload()}>Перезагрузить</button>
            </div>
          ) : servers.length === 0 ? (
            <p className="text-lg text-gray-500 text-center">У вас нет серверов.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {servers.map(server => (
                <div key={server.id} className="bg-white p-8 rounded-2xl shadow-xl flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{server.tariff.name}</h2>
                    <p className="text-lg text-gray-600">ОС: {server.os.name} ({server.os.type})</p>
                    <p className="text-lg text-gray-600">Статус: <span className="font-bold">{server.status}</span></p>
                    <p className="text-sm text-gray-400">Создан: {new Date(server.createdAt).toLocaleString()}</p>
                  </div>
                  {/* TODO: Кнопки управления сервером */}
                  <div className="flex gap-3 mt-4">
                    <button className="px-4 py-2 rounded bg-ospab-primary text-white font-bold hover:bg-ospab-accent">Включить</button>
                    <button className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300">Выключить</button>
                    <button className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300">Перезагрузить</button>
                    <button className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-bold hover:bg-gray-300">Переустановить ОС</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка отображения страницы</h2>
          <p className="text-gray-700 mb-4">Произошла критическая ошибка. Попробуйте перезагрузить страницу.</p>
          <button className="px-4 py-2 rounded bg-ospab-primary text-white font-bold" onClick={() => window.location.reload()}>Перезагрузить</button>
        </div>
      </div>
    );
  }
};

export default ServerManagementPage;
