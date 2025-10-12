// frontend/src/pages/dashboard/mainpage.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/authcontext';
import { useContext } from 'react';

// Импортируем компоненты для вкладок
import Summary from './summary';
import Servers from './servers';
import ServerPanel from './serverpanel';
import ServerManagement from './ServerManagement';
import TicketsPage from './tickets';
import Billing from './billing';
import Settings from './settings';
import Notifications from './notificatons';
import CheckVerification from './checkverification';
import TicketResponse from './ticketresponse';
import Checkout from './checkout';
import TariffsPage from '../tariffs';

const Dashboard = () => {
  const [userData, setUserData] = useState<import('./types').UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  // Определяем активную вкладку из URL
  const getActiveTab = () => {
    const path = location.pathname.split('/dashboard/')[1] || '';
    return path === '' ? 'summary' : path;
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Обновляем активную вкладку при изменении URL
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('Токен не найден, перенаправляем на логин');
          logout();
          navigate('/login');
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
        setUserData({
          user: userRes.data.user,
          balance: userRes.data.user.balance ?? 0,
          servers: userRes.data.user.servers ?? [],
          tickets: userRes.data.user.tickets ?? [],
        });
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [logout, navigate]);

  // Функция для обновления userData из API
  const updateUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
      setUserData({
        user: userRes.data.user,
        balance: userRes.data.user.balance ?? 0,
        servers: userRes.data.user.servers ?? [],
        tickets: userRes.data.user.tickets ?? [],
      });
    } catch (err) {
      console.error('Ошибка обновления userData:', err);
    }
  };

  useEffect(() => {
    const handleUserDataUpdate = () => {
      try {
        updateUserData();
      } catch (err) {
        console.error('Ошибка в обработчике userDataUpdate:', err);
      }
    };
    window.addEventListener('userDataUpdate', handleUserDataUpdate);
    return () => {
      window.removeEventListener('userDataUpdate', handleUserDataUpdate);
    };
  }, []);

  const isOperator = userData?.user?.operator === 1;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-500 text-lg">Загрузка...</span>
      </div>
    );
  }

  // Вкладки для сайдбара
  const tabs = [
    { key: 'summary', label: 'Сводка', to: '/dashboard' },
    { key: 'servers', label: 'Серверы', to: '/dashboard/servers' },
    { key: 'manage', label: 'Управление', to: '/dashboard/manage' },
    { key: 'tickets', label: 'Тикеты', to: '/dashboard/tickets' },
    { key: 'billing', label: 'Баланс', to: '/dashboard/billing' },
    { key: 'settings', label: 'Настройки', to: '/dashboard/settings' },
    { key: 'notifications', label: 'Уведомления', to: '/dashboard/notifications' },
  ];
  const adminTabs = [
    { key: 'checkverification', label: 'Проверка чеков', to: '/dashboard/checkverification' },
    { key: 'ticketresponse', label: 'Ответы на тикеты', to: '/dashboard/ticketresponse' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Привет, {userData?.user?.username || 'Гость'}!
          </h2>
          {isOperator && (
            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full mt-1">
              Оператор
            </span>
          )}
          <div className="mt-2 text-sm text-gray-600">
            Баланс: <span className="font-semibold text-ospab-primary">₽{userData?.balance ?? 0}</span>
          </div>
        </div>
        <nav className="flex-1 p-6">
          <div className="space-y-1">
            {tabs.map(tab => (
              <Link
                key={tab.key}
                to={tab.to}
                className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                  activeTab === tab.key ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {isOperator && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                Админ панель
              </p>
              <div className="space-y-1">
                {adminTabs.map(tab => (
                  <Link
                    key={tab.key}
                    to={tab.to}
                    className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                      activeTab === tab.key ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
        <div className="p-6 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>&copy; 2025 ospab.host</p>
          <p className="mt-1">Версия 1.0.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {tabs.concat(adminTabs).find(t => t.key === activeTab)?.label || 'Панель управления'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Summary userData={userData ?? { user: { username: '', operator: 0 }, balance: 0, servers: [], tickets: [] }} />} />
            <Route path="servers" element={<Servers />} />
            <Route path="server/:id" element={<ServerPanel />} />
            <Route path="manage" element={<ServerManagement />} />
            <Route path="checkout" element={<Checkout onSuccess={() => navigate('/dashboard/servers')} />} />
            <Route path="tariffs" element={<TariffsPage />} />
            {userData && (
              <Route path="tickets" element={<TicketsPage setUserData={setUserData} />} />
            )}
            {userData && (
              <Route path="billing" element={<Billing />} />
            )}
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            {isOperator && (
              <>
                <Route path="checkverification" element={<CheckVerification />} />
                <Route path="ticketresponse" element={<TicketResponse />} />
              </>
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;