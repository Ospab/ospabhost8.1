
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface IUser {
  id: number;
  username: string;
  email: string;
}

interface ICheck {
  id: number;
  userId: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl: string;
  createdAt: string;
  user?: IUser;
}

const API_URL = 'http://localhost:5000/api/check';

const CheckVerification: React.FC = () => {
  const [checks, setChecks] = useState<ICheck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchChecks = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<ICheck[]>(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setChecks(res.data);
      } catch {
        setError('Ошибка загрузки чеков');
        setChecks([]);
      }
      setLoading(false);
    };
    fetchChecks();
  }, []);

  const handleAction = async (checkId: number, action: 'approve' | 'reject'): Promise<void> => {
    setActionLoading(checkId);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/${action}`, { checkId }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setChecks((prevChecks: ICheck[]) => prevChecks.map((c: ICheck) => c.id === checkId ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c));
      // Если подтверждение — обновить баланс пользователя
      if (action === 'approve') {
        try {
          const userToken = localStorage.getItem('access_token') || token;
          const headers = { Authorization: `Bearer ${userToken}` };
          const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
          // Глобально обновить userData через типизированное событие (для Dashboard)
          window.dispatchEvent(new CustomEvent<import('./types').UserData>('userDataUpdate', {
            detail: {
              user: userRes.data.user,
              balance: userRes.data.user.balance ?? 0,
              servers: userRes.data.user.servers ?? [],
              tickets: userRes.data.user.tickets ?? [],
            }
          }));
        } catch (error) {
          console.error('Ошибка обновления userData:', error);
        }
      }
    } catch {
      setError('Ошибка действия');
    }
    setActionLoading(null);
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Проверка чеков</h2>
      {loading ? (
        <p className="text-lg text-gray-500">Загрузка чеков...</p>
      ) : error ? (
        <p className="text-lg text-red-500">{error}</p>
      ) : checks.length === 0 ? (
        <p className="text-lg text-gray-500">Нет чеков для проверки.</p>
      ) : (
        <div className="space-y-6">
          {checks.map((check: ICheck) => (
            <div key={check.id} className="border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="font-bold text-gray-800">Пользователь:</span> <span className="text-gray-700">{check.user?.username || check.user?.email}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-gray-800">Сумма:</span> <span className="text-gray-700">₽{check.amount}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-gray-800">Статус:</span> <span className={`font-bold ${check.status === 'pending' ? 'text-yellow-600' : check.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{check.status === 'pending' ? 'На проверке' : check.status === 'approved' ? 'Подтверждён' : 'Отклонён'}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-gray-800">Дата:</span> <span className="text-gray-700">{new Date(check.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 md:ml-8">
                <a href={`http://localhost:5000${check.fileUrl}`} target="_blank" rel="noopener noreferrer" className="block mb-2">
                  <img src={`http://localhost:5000${check.fileUrl}`} alt="Чек" className="w-32 h-32 object-contain rounded-xl border" />
                </a>
                {check.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(check.id, 'approve')}
                      disabled={actionLoading === check.id}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold mb-2"
                    >
                      {actionLoading === check.id ? 'Подтверждение...' : 'Подтвердить'}
                    </button>
                    <button
                      onClick={() => handleAction(check.id, 'reject')}
                      disabled={actionLoading === check.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold"
                    >
                      {actionLoading === check.id ? 'Отклонение...' : 'Отклонить'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckVerification;