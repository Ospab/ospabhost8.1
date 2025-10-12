# Архитектура системы управления серверами

## Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ServerPanel Component                   │   │
│  │  ┌─────────┬─────────┬─────────┬──────────────┐    │   │
│  │  │ Обзор   │ Консоль │ Статис- │ Управление   │    │   │
│  │  │         │         │ тика    │              │    │   │
│  │  └─────────┴─────────┴─────────┴──────────────┘    │   │
│  │  ┌─────────┬─────────┬─────────┐                   │   │
│  │  │ Снэп-   │ Конфигу-│ Безопас-│                   │   │
│  │  │ шоты    │ рация   │ ность   │                   │   │
│  │  └─────────┴─────────┴─────────┘                   │   │
│  │                                                      │   │
│  │  Components:                                        │   │
│  │  • ConsoleSection (noVNC)                          │   │
│  │  • ResizeModal (CPU/RAM/Disk)                      │   │
│  │  • SnapshotsSection (Create/Restore/Delete)        │   │
│  │  • Stats Charts (Recharts LineChart)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           WebSocket Hook (useSocket)                 │   │
│  │  • Real-time stats updates                          │   │
│  │  • Alert notifications                              │   │
│  │  • Connection status                                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP REST API + WebSocket
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                      BACKEND SERVER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Express.js + Socket.IO Server              │   │
│  │  • CORS: localhost:3000, localhost:5173             │   │
│  │  • Port: 5000                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes (/api/server)                │   │
│  │  • GET /                    - List servers          │   │
│  │  • GET /:id                 - Get server            │   │
│  │  • GET /:id/status          - Get stats             │   │
│  │  • POST /create             - Create server         │   │
│  │  • POST /:id/start          - Start                 │   │
│  │  • POST /:id/stop           - Stop                  │   │
│  │  • POST /:id/restart        - Restart               │   │
│  │  • DELETE /:id              - Delete                │   │
│  │  • POST /:id/password       - Change password       │   │
│  │  • PUT /:id/resize          - Resize config         │   │
│  │  • POST /:id/snapshots      - Create snapshot       │   │
│  │  • GET /:id/snapshots       - List snapshots        │   │
│  │  • POST /:id/snapshots/rollback - Restore           │   │
│  │  • DELETE /:id/snapshots    - Delete snapshot       │   │
│  │  • POST /console            - Get console URL       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MonitoringService (WebSocket)                │   │
│  │  • Interval: 30 seconds                             │   │
│  │  • Check all active servers                         │   │
│  │  • Update database metrics                          │   │
│  │  • Broadcast to subscribed clients                  │   │
│  │  • Check resource limits (>90%)                     │   │
│  │  • Send alerts via WebSocket                        │   │
│  │  • Send email notifications                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Email Service (Nodemailer)              │   │
│  │  • SMTP configuration                               │   │
│  │  • Resource alerts                                  │   │
│  │  • Server created notifications                     │   │
│  │  • Payment reminders                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Proxmox API Integration                   │   │
│  │  • createLXContainer()                              │   │
│  │  • controlContainer() - start/stop/restart          │   │
│  │  • getContainerStats() - CPU/RAM/Disk/Network       │   │
│  │  • getContainerIP()                                 │   │
│  │  • resizeContainer() - CPU/RAM/Disk                 │   │
│  │  • createSnapshot()                                 │   │
│  │  • listSnapshots()                                  │   │
│  │  • rollbackSnapshot()                               │   │
│  │  • deleteSnapshot()                                 │   │
│  │  • changeRootPassword()                             │   │
│  │  • getConsoleURL()                                  │   │
│  │  • deleteContainer()                                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Proxmox API
                       │ Token: PROXMOX_TOKEN_ID + SECRET
┌──────────────────────┴──────────────────────────────────────┐
│                    PROXMOX VE SERVER                         │
│  • LXC Containers                                            │
│  • VNC Console Access                                        │
│  • Resource Management                                       │
│  • Snapshot Management                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   MYSQL/MARIADB DATABASE                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Prisma Schema                       │   │
│  │  • User (auth, balance)                             │   │
│  │  • Server (status, metrics, proxmoxId)              │   │
│  │  • Tariff (price, resources)                        │   │
│  │  • OperatingSystem (template, type)                 │   │
│  │  • Ticket (support system)                          │   │
│  │  • Check (payment verification)                     │   │
│  │  • Notification (user alerts)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Поток данных Real-Time мониторинга

```
┌──────────────┐      30s interval      ┌──────────────┐
│  Monitoring  │ ───────────────────────>│   Proxmox    │
│   Service    │<───────────────────────│   VE API     │
└──────┬───────┘   getContainerStats()  └──────────────┘
       │
       │ Update metrics
       │
       ▼
┌──────────────┐
│   Database   │
│  (Server     │
│   metrics)   │
└──────┬───────┘
       │
       │ Broadcast via WebSocket
       │
       ▼
┌──────────────┐      socket.emit()     ┌──────────────┐
│  Socket.IO   │ ───────────────────────>│   Frontend   │
│   Server     │   'server-stats'        │   Clients    │
│              │   'server-alerts'       │              │
└──────────────┘                         └──────────────┘
```

## Структура компонентов Frontend

```
ServerPanel (Main Component)
├── State Management
│   ├── server: Server | null
│   ├── stats: ServerStats | null
│   ├── activeTab: string
│   ├── showResizeModal: boolean
│   └── WebSocket hook: useServerStats(serverId)
│       ├── stats (real-time)
│       ├── alerts (real-time)
│       └── connected (status)
│
├── Tabs Navigation
│   ├── overview
│   ├── console
│   ├── stats
│   ├── manage
│   ├── snapshots
│   ├── resize
│   └── security
│
└── Tab Content
    ├── Overview Tab
    │   └── Server info (status, tariff, OS, IP, dates)
    │
    ├── Console Tab
    │   └── ConsoleSection
    │       ├── Open console button
    │       └── Embedded iframe (noVNC)
    │
    ├── Stats Tab
    │   ├── WebSocket connection indicator
    │   ├── Alerts display (if any)
    │   ├── Stats cards (CPU, RAM, Disk)
    │   ├── LineChart (history)
    │   └── Detailed stats grid
    │
    ├── Manage Tab
    │   └── Action buttons (start, restart, stop)
    │
    ├── Snapshots Tab
    │   └── SnapshotsSection
    │       ├── Create snapshot form
    │       └── Snapshots list
    │           ├── Restore button
    │           └── Delete button
    │
    ├── Resize Tab
    │   └── Open modal button
    │       └── ResizeModal (CPU, RAM, Disk inputs)
    │
    └── Security Tab
        ├── Generate password button
        └── New password display
```

## Технологический стек

### Backend Dependencies
```
express: ^4.21.2           - HTTP сервер
socket.io: ^4.8.1          - WebSocket
@prisma/client: ^6.16.2    - ORM
axios: ^1.12.2             - HTTP клиент
nodemailer: ^6.9.16        - Email
bcrypt: ^6.0.0             - Хеширование
jsonwebtoken: ^9.0.2       - JWT
multer: ^2.0.2             - Загрузка файлов
cors: ^2.8.5               - CORS
dotenv: ^16.4.5            - Env vars
```

### Frontend Dependencies
```
react: ^19.1.1             - UI библиотека
socket.io-client: ^4.8.1   - WebSocket клиент
recharts: ^2.15.0          - Графики
axios: ^1.12.2             - HTTP клиент
react-router-dom: ^7.9.1   - Роутинг
tailwindcss: ^3.3.3        - CSS фреймворк
vite: ^7.1.2               - Build tool
typescript: ^5.8.3         - Type safety
```

## Конфигурация окружения (.env)

```env
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/ospabhost"

# Proxmox
PROXMOX_API_URL="https://proxmox.example.com:8006/api2/json"
PROXMOX_TOKEN_ID="user@pam!token-id"
PROXMOX_TOKEN_SECRET="secret"
PROXMOX_NODE="proxmox"
PROXMOX_WEB_URL="https://proxmox.example.com:8006"

# Server
PORT=5000
JWT_SECRET="secret-key"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="email@gmail.com"
SMTP_PASS="app-password"
```

## Основные метрики производительности

- **Мониторинг интервал**: 30 секунд
- **WebSocket latency**: < 100ms
- **API response time**: < 500ms
- **Database queries**: Optimized with Prisma
- **Concurrent connections**: Поддержка множества клиентов

## Безопасность

1. **Аутентификация**: JWT tokens
2. **API доступ**: Bearer tokens
3. **Proxmox**: API tokens (не пароли)
4. **Пароли**: Bcrypt хеширование
5. **CORS**: Ограниченные origins
6. **WebSocket**: Authenticated connections
7. **SQL injection**: Prisma ORM защита

## Масштабируемость

- **Горизонтальное**: Можно запустить несколько инстансов backend
- **Database**: MySQL поддерживает репликацию
- **WebSocket**: Socket.IO поддерживает Redis adapter
- **Кэширование**: Можно добавить Redis для кэша
- **Load balancing**: Nginx/HAProxy совместимы

## Мониторинг и логирование

- Console.log для всех критических событий
- Error tracking для ошибок Proxmox API
- Database логи метрик каждые 30 секунд
- Email алерты для критических событий
- WebSocket connection/disconnection логи
