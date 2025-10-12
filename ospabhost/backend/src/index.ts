import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './modules/auth/auth.routes';
import ticketRoutes from './modules/ticket/ticket.routes';
import checkRoutes from './modules/check/check.routes';
import proxmoxRoutes from '../proxmox/proxmox.routes';
import tariffRoutes from './modules/tariff';
import osRoutes from './modules/os';
import serverRoutes from './modules/server';
import { MonitoringService } from './modules/server/monitoring.service';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Настройка Socket.IO с CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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

// Инициализация сервиса мониторинга
const monitoringService = new MonitoringService(io);
monitoringService.startMonitoring();

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 База данных: ${process.env.DATABASE_URL ? 'подключена' : 'НЕ НАСТРОЕНА'}`);
  console.log(`🔌 WebSocket сервер запущен`);
  console.log(`📡 Мониторинг серверов активен`);
});