import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Pagetempl from './components/pagetempl';
import DashboardTempl from './components/dashboardtempl';
import Homepage from './pages/index';
import Dashboard from './pages/dashboard/mainpage';
import Loginpage from './pages/login';
import Registerpage from './pages/register';
import TariffsPage from './pages/tariffs';
import Aboutpage from './pages/about';
import Privateroute from './components/privateroute';
import { AuthProvider } from './context/authcontext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Обычные страницы с footer */}
          <Route path="/" element={<Pagetempl><Homepage /></Pagetempl>} />
          <Route path="/tariffs" element={<Pagetempl><TariffsPage /></Pagetempl>} />
          <Route path="/about" element={<Pagetempl><Aboutpage /></Pagetempl>} />
          <Route path="/login" element={<Pagetempl><Loginpage /></Pagetempl>} />
          <Route path="/register" element={<Pagetempl><Registerpage /></Pagetempl>} />
          
          {/* Дашборд без footer */}
          <Route path="/dashboard/*" element={
            <DashboardTempl>
              <Privateroute>
                <Dashboard />
              </Privateroute>
            </DashboardTempl>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
