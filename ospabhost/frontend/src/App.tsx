import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/index';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard/index';

const App = () => {
  return (
    <Router>
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">ospab.host</Link>
          <div>
            <Link to="/login" className="px-4 py-2 hover:bg-gray-700 rounded-md">Вход</Link>
            <Link to="/register" className="px-4 py-2 ml-2 hover:bg-gray-700 rounded-md">Регистрация</Link>
            <Link to="/dashboard" className="px-4 py-2 ml-2 hover:bg-gray-700 rounded-md">Дашборд</Link>
          </div>
        </nav>
      </header>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;