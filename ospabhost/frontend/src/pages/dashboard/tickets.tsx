import type { UserData, Ticket } from './types';
import React, { useEffect, useState } from 'react';
import useAuth from '../../context/useAuth';
import axios from 'axios';

// Глобальный логгер ошибок для axios
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Ошибка ответа:', error.response.data);
    } else if (error.request) {
      console.error('Нет ответа от сервера:', error.request);
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    return Promise.reject(error);
  }
);

type TicketsPageProps = {
  setUserData: (data: UserData) => void;
};

const TicketsPage: React.FC<TicketsPageProps> = ({ setUserData }) => {
  const { user } = useAuth() as { user?: { username: string; operator?: number } };
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');

  useEffect(() => {
  fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
  const token = localStorage.getItem('access_token');
  const res = await axios.get('https://ospab.host:5000/api/ticket', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      } else {
        setTickets([]);
      }
    } catch {
      setTickets([]);
    }
  };

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
      console.error('Ошибка обновления userData после тикета:', err);
    }
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!title.trim() || !message.trim()) {
      setFormError('Заполните тему и сообщение');
      return;
    }
    setLoading(true);
    try {
  const token = localStorage.getItem('access_token');
  await axios.post('https://ospab.host:5000/api/ticket/create', { title, message }, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTitle('');
      setMessage('');
      setFormSuccess('Тикет успешно создан!');
      fetchTickets();
      await updateUserData();
    } catch {
      setFormError('Ошибка создания тикета');
    } finally {
      setLoading(false);
    }
  };

  const respondTicket = async (ticketId: number) => {
  const token = localStorage.getItem('access_token');
  await axios.post('https://ospab.host:5000/api/ticket/respond', { ticketId, message: responseMsg }, {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    setResponseMsg('');
    fetchTickets();
    await updateUserData();
  };

  const closeTicket = async (ticketId: number) => {
  const token = localStorage.getItem('access_token');
  await axios.post('https://ospab.host:5000/api/ticket/close', { ticketId }, {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    fetchTickets();
    await updateUserData();
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Мои тикеты</h2>
      <form onSubmit={createTicket} className="mb-8 max-w-xl bg-gray-50 rounded-2xl shadow p-6 flex flex-col gap-4">
        <label className="font-semibold text-lg">Тема тикета</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Введите тему..."
          className="border rounded-xl p-3 focus:outline-blue-400 text-base"
        />
        <label className="font-semibold text-lg">Сообщение</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Опишите проблему или вопрос..."
          className="border rounded-xl p-3 min-h-[80px] resize-y focus:outline-blue-400 text-base"
        />
        {formError && <div className="text-red-500 text-sm">{formError}</div>}
        {formSuccess && <div className="text-green-600 text-sm">{formSuccess}</div>}
        <button
          type="submit"
          className={`bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition text-lg font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Создать тикет'}
        </button>
      </form>
      <div className="space-y-8">
        {tickets.map(ticket => (
          <div key={ticket.id} className="border rounded-2xl p-6 shadow flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <div className="font-bold text-xl text-blue-900">{ticket.title}</div>
              <div className="text-sm text-gray-500">Статус: <span className={ticket.status === 'closed' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{ticket.status === 'closed' ? 'Закрыт' : 'Открыт'}</span></div>
            </div>
            <div className="text-sm text-gray-400 mb-2">Автор: {ticket.user?.username} | {new Date(ticket.createdAt).toLocaleString()}</div>
            {/* Чат сообщений */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded-xl max-w-xl">
                  <span className="font-semibold">{ticket.user?.username || 'Клиент'}:</span> {ticket.message}
                </div>
              </div>
              {((Array.isArray(ticket.responses) ? ticket.responses : []) as {
                id: number;
                operator?: { username?: string };
                message: string;
                createdAt: string;
              }[]).map((r) => (
                <div key={r.id} className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-900 px-3 py-2 rounded-xl max-w-xl ml-8">
                    <span className="font-semibold">{r.operator?.username || 'Оператор'}:</span> {r.message}
                    <span className="text-gray-400 ml-2 text-xs">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Форма ответа и кнопка закрытия */}
            {ticket.status !== 'closed' && (
              <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
                {user?.operator === 1 && (
                  <>
                    <input
                      value={responseMsg}
                      onChange={e => setResponseMsg(e.target.value)}
                      placeholder="Ваш ответ..."
                      className="border rounded-xl p-2 flex-1"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => respondTicket(ticket.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                      disabled={loading || !(responseMsg && responseMsg.trim())}
                    >
                      {loading ? 'Отправка...' : 'Ответить'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => closeTicket(ticket.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                  disabled={loading}
                >
                  Закрыть тикет
                </button>
              </div>
            )}
            {ticket.status === 'closed' && (
              <div className="text-red-600 font-bold mt-2">Тикет закрыт</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketsPage;
