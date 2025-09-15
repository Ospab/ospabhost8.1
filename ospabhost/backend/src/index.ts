import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';

// Загружаем переменные окружения из .env файла
dotenv.config();

// Инициализируем приложение Express
const app = express();

// Middleware для CORS
// Это позволяет фронтенду (на другом порту) отправлять запросы на бэкенд
app.use(cors());

// Middleware для парсинга JSON
// Это позволяет Express читать данные, которые приходят в теле запроса в формате JSON
app.use(express.json());

// Основной маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Сервер ospab.host запущен!');
});

// Подключаем наши маршруты для аутентификации
// Все маршруты в authRoutes будут доступны по адресу /api/auth/...
app.use('/api/auth', authRoutes);

// Получаем порт из переменных окружения или используем 5000 по умолчанию
const PORT = process.env.PORT || 5000;

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`);
});