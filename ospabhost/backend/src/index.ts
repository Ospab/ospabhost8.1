import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import ticketRoutes from './modules/ticket/ticket.routes';
import checkRoutes from './modules/check/check.routes';
import proxmoxRoutes from '../proxmox/proxmox.routes';
import tariffRoutes from './modules/tariff';
import osRoutes from './modules/os';
import serverRoutes from './modules/server';

dotenv.config();

const app = express();

// ИСПРАВЛЕНО: более точная настройка CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite обычно использует 5173
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Добавим логирование для отладки
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

import { checkProxmoxConnection } from './modules/server/proxmoxApi';

app.get('/', async (req, res) => {
  // Проверка соединения с Proxmox
  let proxmoxStatus;
  try {
    proxmoxStatus = await checkProxmoxConnection();
  } catch (err) {
    proxmoxStatus = { status: 'fail', message: 'Ошибка проверки Proxmox', error: err };
  }

  res.json({
    message: 'Сервер ospab.host запущен!',
    timestamp: new Date().toISOString(),
    port: PORT,
    database: process.env.DATABASE_URL ? 'подключена' : 'НЕ НАСТРОЕНА',
    proxmox: proxmoxStatus
  });
});



// Статические файлы чеков
import path from 'path';
app.use('/uploads/checks', express.static(path.join(__dirname, '../uploads/checks')));

app.use('/api/auth', authRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/check', checkRoutes);
app.use('/api/proxmox', proxmoxRoutes);
app.use('/api/tariff', tariffRoutes);
app.use('/api/os', osRoutes);
app.use('/api/server', serverRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 База данных: ${process.env.DATABASE_URL ? 'подключена' : 'НЕ НАСТРОЕНА'}`);
});