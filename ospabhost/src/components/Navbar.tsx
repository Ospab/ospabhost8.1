import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md px-8 py-4 fixed w-full z-50 rounded-b-3xl">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-700 hover:text-pink-500 transition">
          ospab.host
        </Link>
        <div className="space-x-6">
          <Link to="/" className="hover:text-pink-500 transition">Главная</Link>
          <Link to="/pricing" className="hover:text-pink-500 transition">Цены</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-pink-500 transition">Личный кабинет</Link>
              <span className="text-gray-700 font-semibold">Привет, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-pink-500 transition-all"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-indigo-700 text-white px-4 py-2 rounded-full hover:bg-pink-500 transition-all"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-4 py-2 rounded-full border border-indigo-700 hover:bg-pink-500 hover:text-white transition-all"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
