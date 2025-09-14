import { Link } from "react-router-dom";

interface NavbarProps {
  user: { email: string } | null;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, logout }) => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">ospab.host</div>
      <div className="space-x-4">
        <Link to="/">Главная</Link>
        <Link to="/pricing">Цены</Link>
        {user ? (
          <>
            <Link to="/dashboard">ЛК</Link>
            <button onClick={logout} className="bg-red-600 px-2 py-1 rounded">
              Выйти
            </button>
          </>
        ) : (
          <Link to="/login">Вход</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
