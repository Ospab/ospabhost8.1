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
import TicketsPage from './tickets';
import Billing from './billing';
import Settings from './settings';
import Notifications from './notificatons';
import CheckVerification from './checkverification';
import TicketResponse from './ticketresponse';
import Checkout from './checkout';
import TariffsPage from '../tariffs';
import AdminPanel from './admin';

const Dashboard = () => {
  const [userData, setUserData] = useState<import('./types').UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('summary');

  // Обновляем активную вкладку при изменении URL
  useEffect(() => {
    const path = location.pathname.split('/dashboard/')[1] || '';
    const tab = path === '' ? 'summary' : path.split('/')[0];
    setActiveTab(tab);
  }, [location.pathname]);

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
  const userRes = await axios.get('https://ospab.host:5000/api/auth/me', { headers });
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
  const userRes = await axios.get('https://ospab.host:5000/api/auth/me', { headers });
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
  const isAdmin = userData?.user?.isAdmin === true;

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
    { key: 'tickets', label: 'Тикеты', to: '/dashboard/tickets' },
    { key: 'billing', label: 'Баланс', to: '/dashboard/billing' },
    { key: 'settings', label: 'Настройки', to: '/dashboard/settings' },
    { key: 'notifications', label: 'Уведомления', to: '/dashboard/notifications' },
  ];
  const adminTabs = [
    { key: 'checkverification', label: 'Проверка чеков', to: '/dashboard/checkverification' },
    { key: 'ticketresponse', label: 'Ответы на тикеты', to: '/dashboard/ticketresponse' },
  ];
  
  const superAdminTabs = [
    { key: 'admin', label: '👑 Админ-панель', to: '/dashboard/admin' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar - теперь адаптивный */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-xl flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 break-words">
            Привет, {userData?.user?.username || 'Гость'}!
          </h2>
          <div className="flex gap-2 mt-2">
            {isOperator && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Оператор
              </span>
            )}
            {isAdmin && (
              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                👑 Супер Админ
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Баланс: <span className="font-semibold text-ospab-primary">₽{userData?.balance ?? 0}</span>
          </div>
        </div>
        <nav className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map(tab => (
              <Link
                key={tab.key}
                to={tab.to}
                onClick={() => setIsMobileMenuOpen(false)}
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
                    onClick={() => setIsMobileMenuOpen(false)}
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
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3 px-4">
                Супер Админ
              </p>
              <div className="space-y-1">
                {superAdminTabs.map(tab => (
                  <Link
                    key={tab.key}
                    to={tab.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                      activeTab === tab.key ? 'bg-red-600 text-white shadow-lg' : 'text-red-600 hover:bg-red-50'
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

      {/* Overlay для мобильного меню */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 pt-16 lg:pt-4">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize break-words">
            {tabs.concat(adminTabs).find(t => t.key === activeTab)?.label || 'Панель управления'}
          </h1>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex-1 p-4 lg:p-8 pt-6 lg:pt-12 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Summary userData={userData ?? { user: { username: '', operator: 0 }, balance: 0, servers: [], tickets: [] }} />} />
            <Route path="servers" element={<Servers />} />
            <Route path="server/:id" element={<ServerPanel />} />
            <Route path="checkout" element={<Checkout onSuccess={() => navigate('/dashboard')} />} />
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
            {isAdmin && (
              <Route path="admin" element={<AdminPanel />} />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;