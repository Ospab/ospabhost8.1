import { Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import logo from '../assets/logo.svg';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="static bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Логотип" className="h-14 w-auto mr-2" />
            <span className="font-mono text-2xl text-gray-800 font-bold">ospab.host</span>
          </Link>
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