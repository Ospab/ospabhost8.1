import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/authcontext';
import { useContext } from 'react';

// Импортируем компоненты для вкладок
import Summary from './summary';
import Servers from './servers';
import Tickets from './tickets';
import Billing from './billing';
import Settings from './settings';
import CheckVerification from './checkverification.tsx';
import TicketResponse from './ticketresponse.tsx';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [userData, setUserData] = useState<import('./types').UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          logout();
          navigate('/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
        
        // Моделируем остальные данные
        const serversRes = { data: { servers: [] } }; 
        const ticketsRes = { data: { tickets: [] } };
        
        setUserData({
          user: userRes.data.user,
          balance: 1500, // Пример
          servers: serversRes.data.servers,
          tickets: ticketsRes.data.tickets,
        });
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <h1 className="text-2xl text-gray-800">Загрузка...</h1>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return null;
  }

  const isOperator = userData.user.operator === 1;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      <div className="w-64 bg-white shadow-xl p-6 rounded-r-3xl h-full fixed">
        <nav className="mt-8">
          <Link to="/dashboard" onClick={() => setActiveTab('summary')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${activeTab === 'summary' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Сводка</Link>
          <Link to="/dashboard/servers" onClick={() => setActiveTab('servers')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mt-2 ${activeTab === 'servers' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Серверы</Link>
          <Link to="/dashboard/tickets" onClick={() => setActiveTab('tickets')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mt-2 ${activeTab === 'tickets' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Тикеты</Link>
          <Link to="/dashboard/billing" onClick={() => setActiveTab('billing')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mt-2 ${activeTab === 'billing' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Баланс</Link>
          <Link to="/dashboard/settings" onClick={() => setActiveTab('settings')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mt-2 ${activeTab === 'settings' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Настройки</Link>
          
          {isOperator && (
            <>
              <div className="border-t border-gray-200 my-4"></div>
              <Link to="/dashboard/checkverification" onClick={() => setActiveTab('checkverification')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mt-2 ${activeTab === 'checkverification' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Проверка чеков</Link>
              <Link to="/dashboard/ticketresponse" onClick={() => setActiveTab('ticketresponse')} className={`block py-3 px-4 rounded-xl font-semibold transition-colors duration-200 mt-2 ${activeTab === 'ticketresponse' ? 'bg-ospab-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Ответы на тикеты</Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex-1 ml-64 p-8">
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
  );
};

export default Dashboard;