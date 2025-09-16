import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageTmpl from './components/pagetempl';
import HomePage from './pages/index';
import MainPage from './pages/dashboard/mainpage';
import LogoutPage from './pages/dashboard/logout';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import TariffsPage from './pages/tariffs';
import AboutPage from './pages/about';
import PrivateRoute from './components/privateroute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PageTmpl><HomePage /></PageTmpl>} />
        <Route path="/tariffs" element={<PageTmpl><TariffsPage /></PageTmpl>} />
        <Route path="/about" element={<PageTmpl><AboutPage /></PageTmpl>} />
        <Route path="/dashboard" element={<PageTmpl><PrivateRoute><MainPage /></PrivateRoute></PageTmpl>} />
        <Route path="/login" element={<PageTmpl><LoginPage /></PageTmpl>} />
        <Route path="/register" element={<PageTmpl><RegisterPage /></PageTmpl>} />
        <Route path="/logout" element={<PageTmpl><LogoutPage /></PageTmpl>} />
      </Routes>
    </Router>
  );
}

export default App;