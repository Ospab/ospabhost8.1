import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/index';
import Pricing from './pages/pricing';
import Login from './pages/login';
import Dashboard from './pages/dashboard/index';
import './styles/tailwind.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Заглушка для функции login
const login = (email: string) => {
  // Здесь может быть логика авторизации
  console.log('Вход для:', email);
};

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login login={login} />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);
