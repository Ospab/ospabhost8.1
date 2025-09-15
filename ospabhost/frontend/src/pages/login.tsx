import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        localStorage.setItem('token', data.token);
        navigate('/dashboard'); // Перенаправляем на дашборд после успешного входа
      } else {
        setMessage(data.message || 'Ошибка входа. Проверьте email и пароль.');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Не удалось подключиться к серверу.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Пароль</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Войти
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      <p className="mt-4">
        Нет аккаунта? <a href="/register" className="text-blue-500 hover:underline">Зарегистрироваться</a>
      </p>
    </div>
  );
};

export default LoginPage;