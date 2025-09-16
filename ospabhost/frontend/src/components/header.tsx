import { Link } from 'react-router-dom';
import useAuth from '../context/useAuth';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">
          <Link to="/" className="font-mono text-2xl">ospab.host</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/tariffs" className="text-gray-600 hover:text-ospab-primary transition-colors">Тарифы</Link>
          <Link to="/about" className="text-gray-600 hover:text-ospab-primary transition-colors">О нас</Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-ospab-primary transition-colors">Личный кабинет</Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-gray-500 hover:bg-red-500"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-ospab-primary transition-colors">Войти</Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-ospab-primary hover:bg-ospab-accent"
              >
                Зарегистрироваться
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;