import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Ticket } from './types';

const TicketResponse = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  // Fetch all tickets for operators
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Нет токена авторизации');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/tickets', {
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

  // Send response to ticket
  const handleSendResponse = async (ticketId: number) => {
    if (!responseMessage.trim()) {
      setError('Сообщение не может быть пустым');
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

      await axios.post(
        `http://localhost:5000/api/tickets/${ticketId}/response`,
        { message: responseMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Ответ успешно отправлен!');
      setResponseMessage('');
      setSelectedTicket(null);
      
      // Refresh tickets list
      await fetchTickets();
    } catch (error: any) {
      console.error('Ошибка при отправке ответа:', error);
      setError(error.response?.data?.message || 'Ошибка при отправке ответа');
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
        <h2 className="text-3xl font-bold text-gray-800">Ответы на тикеты</h2>
        <button
          onClick={fetchTickets}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Обновить
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

      {/* Loading */}
      {loading && tickets.length === 0 && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-500">Загрузка тикетов...</div>
        </div>
      )}

      {/* Tickets List */}
      {!loading && tickets.length === 0 ? (
        <p className="text-lg text-gray-500">Нет доступных тикетов для ответа.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm">
                    От: {ticket.user?.username} ({ticket.user?.email})
                  </p>
                  <p className="text-gray-600 text-sm">
                    Создан: {new Date(ticket.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {getStatusText(ticket.status)}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Сообщение пользователя:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{ticket.message}</p>
              </div>

              {/* Previous Responses */}
              {ticket.responses && ticket.responses.length > 0 && (
                <div className="mb-4 border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">История ответов:</h4>
                  <div className="space-y-3">
                    {ticket.responses.map((response) => (
                      <div key={response.id} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-blue-800">
                            {response.operator.username} (Оператор)
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

              {/* Response Form */}
              <div className="border-t pt-4">
                {selectedTicket === ticket.id ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-800">Ответить на тикет:</h4>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваш ответ..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendResponse(ticket.id)}
                        disabled={loading || !responseMessage.trim()}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Отправка...' : 'Отправить ответ'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTicket(null);
                          setResponseMessage('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Отменить
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedTicket(ticket.id)}
                    className="px-4 py-2 bg-ospab-primary text-white rounded-lg hover:bg-ospab-primary-dark transition-colors"
                  >
                    Ответить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketResponse;