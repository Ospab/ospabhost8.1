import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  return (
    <nav className="bg-white shadow-lg fixed w-full z-10 top-0">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">
            <Link to="/" className="font-mono text-2xl">ospab.host</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/tariffs" className="text-gray-600 hover:text-ospab-primary transition-colors">Тарифы</Link>
            <Link to="/about" className="text-gray-600 hover:text-ospab-primary transition-colors">О нас</Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-ospab-primary transition-colors">Личный кабинет</Link>
                <Link
                  to="/logout"
                  className="px-4 py-2 rounded-full text-white font-bold transition-colors transform hover:scale-105 bg-gray-500 hover:bg-red-500"
                >
                  Выйти
                </Link>
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
      </div>
    </nav>
  );
};

export default Header;