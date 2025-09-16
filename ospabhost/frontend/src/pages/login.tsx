import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: password,
      });
      // Сохраняем токен в localStorage
      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      console.log('Успешный вход:', response.data);
      navigate('/dashboard'); // Перенаправляем на личный кабинет
    } catch (error) {
      let errMsg = 'Ошибка входа. Проверьте правильность email и пароля.';
      if (axios.isAxiosError(error)) {
        errMsg = error.response?.data?.message || errMsg;
        console.error('Ошибка входа:', error.response?.data || error.message);
      } else {
        console.error('Ошибка входа:', error);
      }
      alert(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Вход в аккаунт</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Электронная почта"
            className="w-full px-5 py-3 mb-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-ospab-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full px-5 py-3 mb-6 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-ospab-primary"
          />
          <button
            type="submit"
            className="w-full px-5 py-3 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent"
          >
            Войти
          </button>
        </form>
        <p className="mt-6 text-gray-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-ospab-primary font-bold hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;