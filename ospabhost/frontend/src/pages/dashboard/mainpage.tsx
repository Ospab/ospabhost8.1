// frontend/src/pages/dashboard/mainpage.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/authcontext';
import { useContext } from 'react';

// Импортируем компоненты для вкладок
import Summary from './summary';
import Servers from './servers';
import Tickets from './tickets';
import Billing from './billing';
import Settings from './settings';
import CheckVerification from './checkverification';
import TicketResponse from './ticketresponse';

const Dashboard = () => {
  const [userData, setUserData] = useState<import('./types').UserData | null>(null);
  const [loading, setLoading] = useState(true);
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
          balance: 1500,
          servers: [],
          tickets: [],
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ospab-primary mx-auto mb-4"></div>
          <h1 className="text-2xl text-gray-800">Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-gray-800 mb-4">Ошибка загрузки данных</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-ospab-primary text-white rounded-lg"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  const isOperator = userData.user.operator === 1;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - фиксированный слева */}
      <div className="w-64 bg-white shadow-xl flex flex-col">
        {/* Заголовок сайдбара */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Привет, {userData.user.username}!
          </h2>
          {isOperator && (
            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full mt-1">
              Оператор
            </span>
          )}
          <div className="mt-2 text-sm text-gray-600">
            Баланс: <span className="font-semibold text-ospab-primary">₽{userData.balance}</span>
          </div>
        </div>
        
        {/* Навигация */}
        <nav className="flex-1 p-6">
          <div className="space-y-1">
            <Link 
              to="/dashboard" 
              className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                activeTab === 'summary' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">📊</span>
              Сводка
            </Link>
            <Link 
              to="/dashboard/servers" 
              className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                activeTab === 'servers' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">🖥️</span>
              Серверы
            </Link>
            <Link 
              to="/dashboard/tickets" 
              className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                activeTab === 'tickets' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">🎫</span>
              Тикеты
            </Link>
            <Link 
              to="/dashboard/billing" 
              className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                activeTab === 'billing' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">💳</span>
              Пополнить баланс
            </Link>
            <Link 
              to="/dashboard/settings" 
              className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                activeTab === 'settings' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">⚙️</span>
              Настройки
            </Link>
          </div>
          
          {isOperator && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                Админ панель
              </p>
              <div className="space-y-1">
                <Link 
                  to="/dashboard/checkverification" 
                  className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                    activeTab === 'checkverification' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">✅</span>
                  Проверка чеков
                </Link>
                <Link 
                  to="/dashboard/ticketresponse" 
                  className={`flex items-center py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                    activeTab === 'ticketresponse' ? 'bg-ospab-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">💬</span>
                  Ответы на тикеты
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Футер сайдбара */}
        <div className="p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>&copy; 2024 ospab.host</p>
            <p className="mt-1">Версия 1.0.0</p>
          </div>
        </div>
      </div>

      {/* Main Content - занимает оставшееся место */}
      <div className="flex-1 flex flex-col">
        {/* Хлебные крошки/заголовок */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'summary' ? 'Сводка' : 
                 activeTab === 'servers' ? 'Серверы' :
                 activeTab === 'tickets' ? 'Тикеты поддержки' :
                 activeTab === 'billing' ? 'Пополнение баланса' :
                 activeTab === 'settings' ? 'Настройки аккаунта' :
                 activeTab === 'checkverification' ? 'Проверка чеков' :
                 activeTab === 'ticketresponse' ? 'Ответы на тикеты' :
                 'Панель управления'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date().toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Быстрые действия */}
            <div className="flex space-x-3">
              <Link 
                to="/dashboard/billing" 
                className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
              >
                💰 Пополнить
              </Link>
              <Link 
                to="/dashboard/tickets" 
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                🆘 Поддержка
              </Link>
            </div>
          </div>
        </div>

        {/* Контент страницы */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Summary userData={userData} />} />
            <Route path="servers" element={<Servers servers={userData.servers} />} />
            <Route path="tickets" element={<Tickets tickets={userData.tickets} />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            
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