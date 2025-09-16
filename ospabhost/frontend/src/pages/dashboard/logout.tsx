import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Удаляем все токены и флаг входа из localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
    console.log('Выполняется выход из системы...');
    // После выхода перенаправляем пользователя на главную страницу
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <h1 className="text-xl font-bold text-gray-800">Выполняется выход...</h1>
    </div>
  );
};

export default LogoutPage;