import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Ticket } from './types';

interface TicketsProps {
  tickets: Ticket[];
}

const Tickets: React.FC<TicketsProps> = ({ tickets: initialTickets }) => {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    message: ''
  });

  // Fetch user's tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Нет токена авторизации');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/tickets/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTickets(response.data.tickets);
    } catch (error: any) {
      console.error('Ошибка при загрузке тикетов:', error);
      setError(error.response?.data?.message || 'Ошибка при загрузке тикетов');
    } finally {
      setLoading(false);
    }
  };

  // Create new ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicket.title.trim() || !newTicket.message.trim()) {
      setError('Заголовок и сообщение обязательны');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Нет токена авторизации');
        return;
      }

      await axios.post('http://localhost:5000/api/tickets', newTicket, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess('Тикет успешно создан!');
      setNewTicket({ title: '', message: '' });
      setShowCreateForm(false);
      
      // Refresh tickets list
      await fetchTickets();
    } catch (error: any) {
      console.error('Ошибка при создании тикета:', error);
      setError(error.response?.data?.message || 'Ошибка при создании тикета');
    } finally {
      setLoading(false);
    }
  };

  // Load tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Открыт';
      case 'pending':
        return 'Ожидает ответа';
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Тикеты поддержки</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-ospab-primary text-white rounded-lg hover:bg-ospab-primary-dark transition-colors"
        >
          {showCreateForm ? 'Отменить' : 'Создать тикет'}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
          <button 
            onClick={() => setSuccess(null)}
            className="float-right text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Create Ticket Form */}
      {showCreateForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">Создать новый тикет</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок
              </label>
              <input
                type="text"
                id="title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ospab-primary focus:border-transparent"
                placeholder="Кратко опишите проблему"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение
              </label>
              <textarea
                id="message"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ospab-primary focus:border-transparent"
                placeholder="Подробно опишите проблему или вопрос"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-ospab-primary text-white rounded-lg hover:bg-ospab-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Создание...' : 'Создать тикет'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Отменить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && !showCreateForm && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-500">Загрузка тикетов...</div>
        </div>
      )}

      {/* Tickets List */}
      {!loading && tickets.length === 0 ? (
        <p className="text-lg text-gray-500">У вас пока нет открытых тикетов.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Создан: {new Date(ticket.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {getStatusText(ticket.status)}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700">{ticket.message}</p>
              </div>

              {/* Responses */}
              {ticket.responses && ticket.responses.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Ответы поддержки:</h4>
                  <div className="space-y-3">
                    {ticket.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-blue-800">
                            {response.operator.username} (Поддержка)
                          </span>
                          <span className="text-sm text-blue-600">
                            {new Date(response.createdAt).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-blue-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;