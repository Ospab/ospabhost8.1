import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Очищаем предыдущие ошибки
    
    try {
  await axios.post('https://ospab.host:5000/api/auth/register', {
        username: username,
        email: email,
        password: password
      });
      
      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login');
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMsg = err.response.data.message || 'Неизвестная ошибка регистрации.';
        setError(errorMsg);
      } else {
        setError('Произошла ошибка сети. Пожалуйста, попробуйте позже.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Регистрация</h1>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Имя пользователя"
            className="w-full px-5 py-3 mb-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-ospab-primary"
          />
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
            Зарегистрироваться
          </button>
        </form>
        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
        <p className="mt-6 text-gray-600">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-ospab-primary font-bold hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;