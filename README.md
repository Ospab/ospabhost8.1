# Ospabhost 8.1 - Server Management Platform

Полнофункциональная платформа управления серверами на базе Proxmox VE с поддержкой LXC контейнеров.

## Бета версия уже доступна:
## https://ospab.host

## Возможности

### Управление серверами
- ✅ Создание LXC контейнеров
- ✅ Управление состоянием (запуск, остановка, перезагрузка)
- ✅ Изменение конфигурации (CPU, RAM, диск)
- ✅ Управление снэпшотами (создание, восстановление, удаление)
- ✅ Доступ к консоли через noVNC
- ✅ Смена root-пароля

### Мониторинг
- ✅ Real-time статистика серверов через WebSocket
- ✅ Графики использования ресурсов (CPU, RAM, диск, сеть)
- ✅ Автоматические алерты при превышении лимитов (>90%)
- ✅ Email уведомления о проблемах
- ✅ Периодическая проверка состояния (каждые 30 секунд)

### Пользовательский интерфейс
- ✅ Панель управления серверами
- ✅ Real-time обновления статуса
- ✅ Интерактивные графики
- ✅ Модальные окна для настроек
- ✅ Управление снэпшотами
- ✅ Встроенная консоль

## Технологический стек

### Backend
- TypeScript
- Express.js
- Prisma ORM
- Socket.IO (WebSocket)
- Nodemailer (Email)
- Axios (Proxmox API)
- MySQL/MariaDB

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- Socket.IO Client
- Recharts (графики)
- React Router DOM

## Установка и настройка

### Требования
- Node.js 18+
- MySQL/MariaDB
- Proxmox VE 7+ с настроенными API токенами
- SMTP сервер (опционально, для email уведомлений)

### Backend

1. Перейдите в директорию backend:
```bash
cd ospabhost/backend
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` с конфигурацией:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ospabhost"

# Proxmox Configuration
PROXMOX_API_URL="https://your-proxmox.example.com:8006/api2/json"
PROXMOX_TOKEN_ID="user@pam!token-id"
PROXMOX_TOKEN_SECRET="your-secret-token"
PROXMOX_NODE="proxmox"
PROXMOX_WEB_URL="https://your-proxmox.example.com:8006"

# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET="your-jwt-secret-key-change-this"

# SMTP Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

4. Создайте базу данных и примените миграции:
```bash
npx prisma migrate dev
npx prisma db seed
```

5. Соберите проект:
```bash
npm run build
```

6. Запустите сервер:
```bash
# Development режим с hot-reload
npm run dev

# Production режим
npm start
```

### Frontend

1. Перейдите в директорию frontend:
```bash
cd ospabhost/frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev-сервер:
```bash
npm run dev
```

4. Или соберите для production:
```bash
npm run build
npm run preview
```

## Структура проекта

```
ospabhost/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Авторизация и аутентификация
│   │   │   ├── server/        # Управление серверами
│   │   │   │   ├── proxmoxApi.ts      # Интеграция с Proxmox
│   │   │   │   ├── server.controller.ts
│   │   │   │   ├── server.routes.ts
│   │   │   │   └── monitoring.service.ts  # WebSocket мониторинг
│   │   │   ├── notification/  # Email уведомления
│   │   │   ├── tariff/        # Тарифные планы
│   │   │   ├── os/            # Операционные системы
│   │   │   ├── ticket/        # Система тикетов
│   │   │   └── check/         # Проверка платежей
│   │   ├── index.ts           # Точка входа, Socket.IO сервер
│   │   └── prisma/
│   │       ├── schema.prisma  # Схема БД
│   │       └── seed.ts        # Начальные данные
│   ├── API_DOCUMENTATION.md   # Документация API
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   └── dashboard/
    │   │       └── serverpanel.tsx  # Главная панель управления
    │   ├── hooks/
    │   │   └── useSocket.ts    # WebSocket хуки
    │   ├── components/         # Переиспользуемые компоненты
    │   └── context/            # React контексты
    └── package.json
```

## API Endpoints

Полная документация API доступна в файле [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md).

Основные эндпоинты:
- `GET /api/server` - Список серверов
- `GET /api/server/:id/status` - Статус и статистика
- `POST /api/server/create` - Создание сервера
- `POST /api/server/:id/start` - Запуск
- `POST /api/server/:id/stop` - Остановка
- `POST /api/server/:id/restart` - Перезагрузка
- `PUT /api/server/:id/resize` - Изменение конфигурации
- `POST /api/server/:id/snapshots` - Создание снэпшота
- `GET /api/server/:id/snapshots` - Список снэпшотов
- `POST /api/server/:id/snapshots/rollback` - Восстановление
- `DELETE /api/server/:id/snapshots` - Удаление снэпшота

## WebSocket Events

Подключение к `http://localhost:5000`:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Подписка на обновления сервера
socket.emit('subscribe-server', serverId);

// Получение статистики
socket.on('server-stats', (data) => {
  console.log('Stats:', data);
});

// Получение алертов
socket.on('server-alerts', (data) => {
  console.log('Alerts:', data);
});
```

## Система мониторинга

Мониторинг работает автоматически после запуска сервера:

1. **Периодическая проверка** - каждые 30 секунд проверяет все активные серверы
2. **Обновление БД** - сохраняет метрики (CPU, RAM, диск, сеть) в базу данных
3. **WebSocket broadcast** - отправляет обновления подключенным клиентам
4. **Алерты** - генерирует предупреждения при превышении 90% использования ресурсов
5. **Email уведомления** - отправляет письма при критических событиях

## Email уведомления

Система отправляет уведомления о:
- Создании нового сервера
- Превышении лимитов ресурсов (CPU/RAM/Disk > 90%)
- Приближении срока оплаты
- Ответах в тикетах поддержки

Для работы email требуется настройка SMTP в `.env`.

## Безопасность

- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- CORS настроен для локальной разработки
- Proxmox API токены вместо паролей
- Автоматическая генерация безопасных паролей

## Разработка

### Запуск в dev режиме

Backend:
```bash
cd ospabhost/backend
npm run dev
```

Frontend:
```bash
cd ospabhost/frontend
npm run dev
```

### Сборка

Backend:
```bash
cd ospabhost/backend
npm run build
```

Frontend:
```bash
cd ospabhost/frontend
npm run build
```

### Линтинг

Frontend:
```bash
cd ospabhost/frontend
npm run lint
```

## Примеры использования

### Создание сервера

```javascript
const createServer = async () => {
  const response = await fetch('http://localhost:5000/api/server/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      osId: 1,
      tariffId: 2
    })
  });
  const server = await response.json();
  console.log('Server created:', server);
};
```

### Создание снэпшота

```javascript
const createSnapshot = async (serverId) => {
  const response = await fetch(`http://localhost:5000/api/server/${serverId}/snapshots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      snapname: 'backup-before-update',
      description: 'Before major system update'
    })
  });
  const result = await response.json();
  console.log('Snapshot created:', result);
};
```

### Real-time мониторинг

```javascript
import { useServerStats } from './hooks/useSocket';

function ServerMonitor({ serverId }) {
  const { stats, alerts, connected } = useServerStats(serverId);
  
  return (
    <div>
      <div>Status: {connected ? 'Connected' : 'Disconnected'}</div>
      <div>CPU: {stats?.data?.cpu * 100}%</div>
      <div>RAM: {stats?.data?.memory?.usage}%</div>
      {alerts.map(alert => (
        <div key={alert.type}>Alert: {alert.message}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Backend не подключается к Proxmox
- Проверьте PROXMOX_API_URL в .env
- Убедитесь, что API токен действителен
- Проверьте сетевую доступность Proxmox сервера

### WebSocket не подключается
- Убедитесь, что backend запущен
- Проверьте CORS настройки в backend/src/index.ts
- Проверьте firewall rules

### Email уведомления не отправляются
- Проверьте SMTP настройки в .env
- Для Gmail используйте App Password, не обычный пароль
- Проверьте логи сервера на ошибки

## Лицензия

MIT

## Поддержка

Для вопросов и поддержки создайте issue в репозитории или свяжитесь с командой разработки.
