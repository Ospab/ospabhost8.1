# 🚀 Ospabhost 8.1 - VPS Hosting Platform# 📚 OSPABHOST 8.1 - ПОЛНАЯ ДОКУМЕНТАЦИЯ



**Монорепозиторий** для главного сайта ospab.host с интеграцией Panel API и SSO авторизации.**Последнее обновление:** 27 Октября 2025  

**Статус:** ✅ Production Ready  

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)**Язык:** Русский / Russian

[![Node.js](https://img.shields.io/badge/Node.js-24.x-green)](https://nodejs.org/)

[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)---

[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748)](https://www.prisma.io/)

[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)## 📖 ОГЛАВЛЕНИЕ



---1. [Архитектура системы](#архитектура-системы)

2. [Текущее состояние](#текущее-состояние)

## 📋 Table of Contents3. [Решение Proxmox Storage](#решение-proxmox-storage)

4. [Новая архитектура VPS](#новая-архитектура-vps)

- [Архитектура](#архитектура)5. [Быстрый старт](#быстрый-старт)

- [Технологии](#технологии)6. [Полная документация](#полная-документация)

- [Быстрый старт](#быстрый-старт)7. [Backend API](#backend-api)

- [Panel API](#panel-api)8. [Безопасность](#безопасность)

- [SSO Integration](#sso-integration)9. [Troubleshooting](#troubleshooting)

- [Deployment](#deployment)

- [Testing](#testing)---

- [Documentation](#documentation)

- [Contributing](#contributing)## 🏗️ АРХИТЕКТУРА СИСТЕМЫ



---### Стек технологий



## 🏗️ Архитектура```

Frontend:

### Структура проекта  ├─ React + Vite + TypeScript

  ├─ Tailwind CSS

```  ├─ React Router v6

ospabhost8.1/  └─ Axios для API

├── backend/              # Node.js + TypeScript + Express

│   ├── src/Backend:

│   │   ├── index.ts     # HTTPS Server Entry Point  ├─ Express.js + TypeScript

│   │   ├── modules/     # Feature Modules  ├─ Prisma ORM + MySQL

│   │   │   ├── auth/    # JWT, OAuth2 (Google, GitHub, Yandex)  ├─ Proxmox API интеграция

│   │   │   ├── sso/     # ⭐ SSO with Panel  ├─ JWT + OAuth2 (Google, GitHub, Yandex)

│   │   │   ├── panel-api/ # ⭐ External Panel API  └─ PM2 для развёртывания

│   │   │   ├── server/  # VPS Management (Proxmox)

│   │   │   ├── ticket/  # Support TicketsInfrastructure:

│   │   │   ├── check/   # Payment Verification  ├─ Proxmox VE (LXC контейнеры)

│   │   │   └── ...  ├─ HTTPS с SSL сертификатами

│   │   └── prisma/      # Prisma Client  ├─ SSH для управления

│   ├── prisma/          # DB Schema & Migrations  └─ MySQL БД

│   ├── test-sso.js      # ⭐ SSO Link Generator CLI

│   └── uploads/         # User-uploaded filesИнтеграции:

│  ├─ Panel Management (panel.ospab.host)

├── frontend/            # React + Vite + TypeScript  ├─ SSO система

│   ├── src/  └─ OAuth провайдеры

│   │   ├── pages/       # React Pages (dashboard, login, etc.)```

│   │   ├── components/  # Reusable Components

│   │   ├── context/     # React Context (Auth)### Основные папки

│   │   └── config/      # API Configuration

│   └── dist/            # Production Build```

│ospabhost/

└── docs/                # Documentation (this file + detailed guides)├── backend/              - Express server (TypeScript)

```│   ├── src/

│   │   ├── modules/     - Функциональные модули

### System Components│   │   ├── prisma/      - ORM client

│   │   └── index.ts     - Точка входа

```mermaid│   ├── prisma/

graph TB│   │   ├── schema.prisma - БД схема

    User[User Browser] -->|HTTPS 443| Nginx[Nginx Reverse Proxy]│   │   └── migrations/  - Миграции

    Nginx -->|Proxy| Backend[Node.js Backend :5000]│   ├── dist/            - Собранный код

    Backend -->|ORM| MySQL[(MySQL 8.0)]│   └── package.json

    Backend -->|API| Proxmox[Proxmox VE]│

    Backend -->|WebSocket| Terminal[VPS Terminal]├── frontend/            - React SPA (TypeScript)

    │   ├── src/

    Panel[External Panel] -->|HTTPS + X-API-Key| PanelAPI[Panel API Endpoint]│   │   ├── components/  - Компоненты React

    PanelAPI -->|Query| Backend│   │   ├── pages/       - Страницы

    │   │   └── main.tsx     - Точка входа

    User -->|SSO Login| Panel│   ├── dist/            - Собранный код

    Backend -->|Generate SSO Link| Panel│   └── package.json

```│

└── README.md            - Этот файл

**Key Features:**```

- 🔐 **Multi-auth:** JWT, OAuth2, SSO

- 🖥️ **VPS Management:** Proxmox integration (LXC/QEMU)---

- 📊 **Real-time stats:** CPU, RAM, Disk, Network

- 🎫 **Ticketing System:** Support tickets with responses## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ

- 💳 **Payment Verification:** Manual check upload & approval

- 🔌 **Panel API:** External access for management panel### ✅ Что работает

- 🔄 **SSO:** Seamless login between main site and panel

| Компонент | Статус | Примечание |

---|-----------|--------|-----------|

| **Backend** | ✅ Production | Express на Node.js v24.10.0 |

## 💻 Технологии| **Frontend** | ✅ Production | React SPA запущена |

| **Proxmox** | ✅ Configured | LXC контейнеры, Storage: local |

### Backend Stack| **БД MySQL** | ✅ Connected | Все таблицы созданы |

| Technology | Version | Purpose || **SSL/HTTPS** | ✅ Active | Apache SSL сертификаты |

|-----------|---------|---------|| **Авторизация** | ✅ JWT + OAuth2 | Google, GitHub, Yandex |

| Node.js | 24.10.0 | Runtime || **SSO** | ✅ Работает | Для panel.ospab.host |

| TypeScript | 5.4 | Language || **Тарифы** | ✅ Динамичные | С параметрами CPU/RAM/Disk |

| Express.js | 4.21 | Web Framework || **Серверы (VPS)** | ✅ Создаются | На Proxmox LXC |

| Prisma | 6.16.2 | ORM || **Tickets** | ✅ Support система | Создание и ответы |

| MySQL | 8.0 | Database || **Checks** | ✅ Пополнение | Загрузка чеков, статусы |

| Proxmox API | 1.1.1 | Virtualization |

| JWT | 9.0 | Authentication |### ⚠️ В разработке

| Passport.js | 0.7 | OAuth2 |

| ws | 8.18 | WebSocket || Компонент | Статус | План |

|-----------|--------|------|

### Frontend Stack| **Panel API** | 🚧 Planning | GET endpoints для VPS данных |

| Technology | Version | Purpose || **Webhooks** | 🚧 Future | Panel → Main site notifications |

|-----------|---------|---------|| **Monitoring** | 🚧 Future | Метрики и алерты |

| React | 18 | UI Framework || **Backup** | 🚧 Future | Автоматические снэпшоты |

| Vite | 7.1 | Build Tool |

| TypeScript | 5 | Language |### ❌ Удалено (версия 8.1)

| Tailwind CSS | - | Styling |

| React Router | - | Routing |- ❌ VPS Sync Service (ospab → panel push) - заменён на pull архитектуру

| Axios | 1.12 | HTTP Client |- ❌ `backend/src/modules/vps-sync/` - полностью удалена папка

- ❌ Поля `panelVpsId` и `panelSyncStatus` из Server модели

### Infrastructure- ❌ Вся старая документация про синхронизацию

- **Web Server:** Nginx 1.24 (reverse proxy, SSL termination)

- **Process Manager:** PM2 (backend process management)---

- **SSL/TLS:** Let's Encrypt / Self-signed

- **OS:** Ubuntu Server## 🔧 РЕШЕНИЕ PROXMOX STORAGE



---### Проблема



## 🚀 Быстрый стартПри создании LXC контейнеров могла возникнуть ошибка:

```

### PrerequisitesError: socket hang up

Error: ECONNRESET

```bashError: ETIMEDOUT

node --version  # v24.x or higher```

npm --version   # v10.x or higher

mysql --version # 8.0 or higher**Причина:** Storage pool (например, `vm-storage`) не существовал или был недоступен.

```

### Решение (ВЫПОЛНЕНО)

### Installation

#### Шаг 1: Проверка на Proxmox

```bash

# Clone repository```bash

git clone https://github.com/Ospab/ospabhost8.1.gitssh root@sv1.ospab.host

cd ospabhost8.1/ospabhostpvesm status

```

# Backend setup

cd backend**Результат должен показать:**

npm install```

cp .env.example .envName             Type     Content              Active

# Edit .env with your configurationlocal            dir      images,rootdir       1       ✅

npx prisma generatelocal-lvm        lvmthin  images,rootdir       1

npx prisma migrate deploynfs-storage      nfs      images               0       (если настроено)

npm run build```



# Frontend setup#### Шаг 2: Конфигурация Backend

cd ../frontend

npm install**Файл:** `backend/.env`

npm run build

``````env

# Storage pools for VM disks

### Environment VariablesPROXMOX_VM_STORAGE=local                # ✅ Storage для корневой FS

PROXMOX_BACKUP_STORAGE=local            # ✅ Storage для бэкапов

Create `backend/.env`:PROXMOX_ISO_STORAGE=local               # ✅ Storage для ISO

```env```

# Database

DATABASE_URL="mysql://user:password@localhost:3306/ospab"**Это позволяет:**

- ✅ Гибко менять storage без перекомпиляции

# Server- ✅ Использовать разные storage для разных целей

PORT=5000- ✅ Быстро тестировать конфигурацию

NODE_ENV=production

#### Шаг 3: Проверка работы

# JWT Secret (min 32 chars)

JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"**Логирование в proxmoxApi.ts:**

```typescript

# OAuth2 Providersconsole.log(`Storage для VM: ${vmStorage}`);

GOOGLE_CLIENT_ID="..."console.log(`Создание контейнера с параметрами:`, containerConfig);

GOOGLE_CLIENT_SECRET="..."console.log(`Ответ от Proxmox:`, response.status, response.data);

GITHUB_CLIENT_ID="..."```

GITHUB_CLIENT_SECRET="..."

YANDEX_CLIENT_ID="..."### Диагностика

YANDEX_CLIENT_SECRET="..."

**Если ошибка остаётся:**

# Proxmox Configuration

PROXMOX_HOST="sv1.ospab.host"```bash

PROXMOX_USER="root@pam"# 1. На Proxmox проверить права API токена

PROXMOX_PASSWORD="secure-password"ssh root@sv1.ospab.host

PROXMOX_NODE="gvoprgrg"pveum token list

PROXMOX_VM_STORAGE="local"

# 2. На backend проверить конфигурацию

# Panel API Key (must match panel's MAIN_SITE_API_KEY)grep PROXMOX_VM_STORAGE backend/.env

PANEL_API_KEY="P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5"

# 3. В логах искать детали ошибки

# SSO Configuration (must match panel's SSO_SECRET_KEY)tail -100 backend-logs.txt | grep -i "storage\|error"

SSO_SECRET_KEY="vjy23VmeLi*hZQxb4TO3ihWf&y$QzcMNU$*!77#S$b5#kS4iPwESPlk1MzC$OCaovgF$yzAHTiZkQS^mTT#5l18A41vY7t@HzA$yn2H8kv8X$m32v^y6moxHS$jPEKUS"```

PANEL_URL="https://panel.ospab.host"

---

# CORS Whitelist

CORS_WHITELIST="http://localhost:3000,http://localhost:5173,https://ospab.host"## 🔄 НОВАЯ АРХИТЕКТУРА VPS

```

### Переход на Pull-модель

Create `frontend/.env`:

```env#### ❌ Старая архитектура (удалена)

VITE_API_URL=https://ospab.host:5000

VITE_SOCKET_URL=wss://ospab.host:5000```

VITE_TURNSTILE_SITE_KEY=0x4AAAAAAB7306voAK0Pjx8OГлавный сайт (ospab.host) PUSH → Panel (panel.ospab.host)

``````



### Development**Проблемы:**

- ❌ Panel зависит от главного сайта

```bash- ❌ Нет возможности Panel проверить состояние самостоятельно

# Terminal 1: Backend- ❌ При ошибке синхронизации - данные не обновляются

cd backend

npm run dev  # Starts on localhost:5000#### ✅ Новая архитектура (в разработке)



# Terminal 2: Frontend```

cd frontendPanel (panel.ospab.host) PULL ← API (ospab.host:5000)

npm run dev  # Starts on localhost:5173```

```

**Преимущества:**

### Production Build- ✅ Panel полностью независим

- ✅ Может запрашивать данные когда угодно

```bash- ✅ Откровенная обработка ошибок

# Backend- ✅ Масштабируется лучше

cd backend

npm run build### Требуемые API endpoints

pm2 start dist/src/index.js --name ospab-backend

**Должны быть реализованы на главном сайте (ospab.host:5000):**

# Frontend

cd frontend#### 1. GET /api/vps/users/:userId

npm run build

# Deploy dist/ to web serverПолучить все VPS пользователя.

```

**Запрос:**

---```bash

curl -H "X-API-Key: SECRET_KEY" \

## 🔌 Panel API  https://ospab.host:5000/api/vps/users/1

```

External REST API for management panel to access VPS data.

**Ответ:**

### Base URL```json

```{

https://api.ospab.host/api/panel  "status": "success",

```  "data": [

    {

### Authentication      "id": 1,

All endpoints (except `/health`) require API key header:      "userId": 1,

```http      "name": "server-1",

X-API-Key: P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5      "status": "running",

```      "cpu": 2,

      "ram": 2048,

### Endpoints      "disk": 40,

      "os": "Ubuntu 22.04",

| Method | Endpoint | Auth | Description |      "ipAddress": "192.168.1.100",

|--------|----------|------|-------------|      "proxmoxId": 107,

| GET | `/health` | ❌ | Health check |      "createdAt": "2025-10-27T11:00:00Z"

| GET | `/users` | ✅ | List all users |    }

| GET | `/users/:userId/vps` | ✅ | Get user's VPS list |  ]

| GET | `/vps/:serverId` | ✅ | Get VPS details + monitoring |}

| GET | `/vps/:serverId/status` | ✅ | Real-time VPS stats (Proxmox) |```



### Example Requests#### 2. GET /api/vps/:serverId



```bashПолучить детали конкретного VPS.

# Health check (no auth)

curl https://api.ospab.host/api/panel/health#### 3. GET /api/vps/:serverId/status



# List all usersПолучить текущий статус VPS.

curl https://api.ospab.host/api/panel/users \

  -H "X-API-Key: P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5"### Аутентификация



# Get user's VPS**Все API endpoints требуют:**

curl https://api.ospab.host/api/panel/users/1/vps \

  -H "X-API-Key: P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5"```

Header: X-API-Key: <32+ символа>

# Get VPS details```

curl https://api.ospab.host/api/panel/vps/123 \

  -H "X-API-Key: P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5"---



# Get real-time status## 🚀 БЫСТРЫЙ СТАРТ

curl https://api.ospab.host/api/panel/vps/123/status \

  -H "X-API-Key: P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5"### Для разработки

```

```bash

### Response Example# Backend

cd backend

```jsonnpm install

{npm run dev              # ts-node-dev с hot reload

  "status": "success",

  "data": {# Frontend (отдельный терминал)

    "user": {cd frontend

      "id": 1,npm install

      "username": "john",npm run dev              # Vite dev server

      "email": "john@example.com",```

      "balance": 500.50

    },### Для production

    "servers": [

      {```bash

        "id": 123,# 1. Сборка

        "name": "server-123",npm run build

        "status": "running",

        "ipAddress": "185.123.45.67",# 2. Запуск через PM2

        "rootPassword": "SecurePass123!",pm2 start ecosystem.config.js

        "proxmoxId": 100,

        "tariff": {# 3. Проверка

          "id": 1,pm2 monit

          "name": "VPS Start",pm2 logs

          "description": "2 CPU, 4GB RAM, 50GB SSD",```

          "price": 500

        },---

        "os": {

          "id": 1,## 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ

          "name": "Ubuntu 22.04 LTS"

        },### Backend модули

        "createdAt": "2025-01-15T10:30:00.000Z"

      }#### auth/ - Авторизация

    ],- JWT tokens (24 часа)

    "count": 1- OAuth2 (Google, GitHub, Yandex)

  }- SSO для Panel

}- Refresh tokens (30 дней)

```

#### server/ - Управление VPS

📖 **Full Documentation:** [PANEL_API_DOCUMENTATION.md](./PANEL_API_DOCUMENTATION.md)- Создание LXC контейнеров в Proxmox

- Start/Stop/Restart операции

---- Статистика (CPU, Memory, Disk)

- SSH доступ для управления

## 🔐 SSO Integration

#### tariff/ - Тарифы

Single Sign-On allows users to seamlessly login from main site to management panel.- Динамические параметры (CPU, RAM, SSD)

- Цены и скидки

### How it Works- Привязка к ОС



```#### ticket/ - Support система

1. User clicks "Panel" on main site- Создание tickets

2. Main site generates SSO link with HMAC signature- Ответы операторов

3. User redirected to panel with signed parameters- Статусы (open, in_progress, closed)

4. Panel validates signature and creates session

5. User logged in to panel automatically#### check/ - Пополнение баланса

```- Загрузка фото чека

- Проверка операторами

### SSO URL Format- Автоматическое пополнение



```#### notification/ - Уведомления

https://panel.ospab.host/sso?- Email уведомления

  userId=1&- Внутренние сообщения

  username=john&- Webhook'и (future)

  email=john@example.com&

  password=temporary-password&### Proxmox интеграция

  signature=abc123...&

  timestamp=1698765432**Основные операции:**

```

```typescript

### Security// Создание контейнера

createLXContainer({

- **HMAC-SHA256** signature: `SHA256(userId + username + email + timestamp)`  os: { template, type },

- **Timestamp validation:** Link expires after 5 minutes  tariff: { name, price, description },

- **Unique passwords:** Generated per-session  user: { id, username },

- **Secret key:** Shared between main site and panel (64+ chars recommended)  hostname: string

})

### Generate SSO Link (CLI)

// Управление контейнером

```bashcontrolContainer(vmid, action)  // start, stop, restart

cd backendgetContainerStats(vmid)         // CPU, Memory, Disk, Network

node test-sso.js <userId> <username> <email> [password]deleteContainer(vmid)           // Удаление

```

# Example:

node test-sso.js 1 john john@example.com---

# Output: https://panel.ospab.host/sso?userId=1&username=john&...

```## 🔐 БЕЗОПАСНОСТЬ



### User ID Mapping### JWT токены



**Problem:** Panel and main site have different auto-increment IDs.- Access token: 24 часа

- Refresh token: 30 дней

**Solution:** Panel stores `main_site_user_id` for mapping:- Хранение: localStorage (access), httpOnly cookie (refresh)



| Panel ID | Username | Email | main_site_user_id |### Пароли

|----------|----------|-------|-------------------|

| 5 | john | john@example.com | 1 |- Алгоритм: bcrypt (rounds: 10)

| 6 | jane | jane@example.com | 2 |- Корневые пароли: crypto.randomBytes(16)



When fetching VPS data, panel uses `main_site_user_id`:### API ключи

```go

// Panel code (Go)- Минимум 32 символа

localUserID := 5 // From JWT- X-API-Key в заголовке

user := getUserByID(localUserID)- Логирование всех использований

mainSiteUserID := user.MainSiteUserID // 1- Ротация каждые 90 дней



// Request to main site API### SSL/HTTPS

vpsList := getVPS(mainSiteUserID) // Uses ID=1

```- TLS 1.3

- Let's Encrypt (автоматическое обновление)

📖 **Full Documentation:** [SSO_FINAL_SETUP.md](./SSO_FINAL_SETUP.md)- HSTS включён



------



## 📦 Deployment## 🆘 TROUBLESHOOTING



### Backend Deployment### Socket hang up при создании сервера



```bash**Решение:**

ssh root@sv1.ospab.host1. `pvesm status` на Proxmox → проверить storage

2. Обновить `PROXMOX_VM_STORAGE` в `.env`

# Navigate to project3. `npm run build` → пересобрать backend

cd /var/www/ospab-host4. `pm2 logs backend` → проверить логи



# Update code### 401 Unauthorized на API

git fetch

git checkout api-for-panel**Решение:**

git pull origin api-for-panel1. Проверить JWT token в localStorage

2. Refresh token (24 часа срок)

# Rebuild3. Авторизоваться заново

cd backend

npm install### Frontend не грузится

npm run build

**Решение:**

# Restart with PM21. Проверить CORS в `backend/src/index.ts`

pm2 restart ospab-backend2. Проверить `FRONTEND_URL` в `.env`

pm2 logs ospab-backend --lines 303. Ctrl+Shift+Del → очистить кэш

pm2 save

```### Контейнер не создаётся



### Frontend Deployment**Решение:**

1. `pvesm status` → проверить диск

```bash2. `pveum token list` → проверить права

# On local machine3. `/var/log/pve/api2-access.log` → логи Proxmox

cd frontend

npm run build---



# Copy to server## 📈 МЕТРИКИ

scp -r dist/* root@sv1.ospab.host:/var/www/ospab-host/frontend/dist/

| Параметр | Значение |

# Nginx will serve new files automatically|----------|----------|

```| **Backend** | Node.js v24.10.0, Express 4.x |

| **Frontend** | React 18, Vite 5, TypeScript 5 |

### Nginx Configuration| **БД** | MySQL 8.0, Prisma 6.16 |

| **Proxmox** | VE 8.x |

**Main Site (ospab.host):**| **SSL** | TLS 1.3 |

```nginx| **Performance** | ~1000 req/sec на 4-ядерном сервере |

server {

    listen 443 ssl http2;---

    server_name ospab.host;

## ✅ ЧЕКЛИСТ ДЛЯ НОВЫХ РАЗРАБОТЧИКОВ

    ssl_certificate /etc/apache2/ssl/ospab.host.crt;

    ssl_certificate_key /etc/apache2/ssl/ospab.host.key;- [ ] Установил Node.js v24+, MySQL 8+

- [ ] Клонировал репозиторий

    # API Proxy- [ ] Установил зависимости (npm install)

    location /api/ {- [ ] Отредактировал `.env` файлы

        proxy_pass https://localhost:5000;- [ ] Запустил миграции БД

        proxy_ssl_verify off;- [ ] Запустил backend и frontend

        proxy_set_header Host $host;- [ ] Протестировал авторизацию

        proxy_set_header X-Real-IP $remote_addr;- [ ] Протестировал создание сервера

    }- [ ] Прочитал этот README



    # Uploads---

    location /uploads/ {

        proxy_pass https://localhost:5000;**🎉 Система готова к разработке и production использованию!**

        proxy_ssl_verify off;

    }**Дата:** 27 Октября 2025



    # Frontend
    location / {
        root /var/www/ospab-host/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

**Panel API (api.ospab.host):**
```nginx
server {
    listen 443 ssl http2;
    server_name api.ospab.host;

    ssl_certificate /etc/letsencrypt/live/api.ospab.host/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ospab.host/privkey.pem;

    location /api/panel {
        proxy_pass https://localhost:5000/api/panel;
        proxy_ssl_verify off;
        proxy_set_header X-API-Key $http_x_api_key;
    }
}
```

📖 **Full Documentation:** [DEPLOY_BACKEND.md](./DEPLOY_BACKEND.md)

---

## 🧪 Testing

### Quick API Test

```bash
# Panel API Health
curl https://api.ospab.host/api/panel/health

# Panel API with Auth
curl https://api.ospab.host/api/panel/users \
  -H "X-API-Key: P4n3l_AP1_K3y_8675309_S3cur3_R4nd0m_32ch4r5"
```

### SSO Test

```bash
cd backend
node test-sso.js 1 testuser test@ospab.com
# Open generated link in browser
```

### Manual Testing Workflow

1. Register user: `https://ospab.host/register`
2. Login: `https://ospab.host/login`
3. Create VPS: Dashboard → "Order Server"
4. Test SSO: Dashboard → "Control Panel" button
5. Verify Panel API: Check network tab for `/api/panel/users/X/vps` requests

---

## 📚 Documentation

### Core Documentation
- **Main README:** You're here! 📍
- **Contributing Guide:** [CONTRIBUTIONS.md](./CONTRIBUTIONS.md)
- **Architecture:** [Architecture Overview](#архитектура)

### API Documentation
- **Panel API Reference:** [PANEL_API_DOCUMENTATION.md](./PANEL_API_DOCUMENTATION.md)
- **Panel API Examples:** [PANEL_API_USAGE_EXAMPLES.md](./PANEL_API_USAGE_EXAMPLES.md)
- **Panel API Testing:** [PANEL_API_TESTING.md](./PANEL_API_TESTING.md)
- **API Requirements:** [MAIN_SITE_API_REQUIREMENTS.md](./MAIN_SITE_API_REQUIREMENTS.md)
- **Implementation Status:** [API_IMPLEMENTATION_STATUS.md](./API_IMPLEMENTATION_STATUS.md)

### SSO Documentation
- **SSO Complete Setup:** [SSO_FINAL_SETUP.md](./SSO_FINAL_SETUP.md)
- **SSO Integration Guide:** [SSO_INTEGRATION_GUIDE.md](./SSO_INTEGRATION_GUIDE.md)
- **SSO UserID Update:** [SSO_USERID_UPDATE.md](./SSO_USERID_UPDATE.md)

### Deployment Guides
- **Backend Deploy:** [DEPLOY_BACKEND.md](./DEPLOY_BACKEND.md)
- **Nginx Setup:** [DEPLOY_NGINX_FIX.md](./DEPLOY_NGINX_FIX.md)

### Database
- **Prisma Schema:** [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)
- **Migrations:** [backend/prisma/migrations/](./backend/prisma/migrations/)

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTIONS.md) before submitting PRs.

### Quick Start for Contributors

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test
4. Commit: `git commit -m "feat: Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 📄 License

**Proprietary License**  
© 2025 Ospab Hosting. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

---

## 👥 Team

- **Lead Developer:** [@Ospab](https://github.com/Ospab)
- **Backend:** Node.js + TypeScript + Prisma
- **Frontend:** React + Vite + Tailwind
- **DevOps:** Nginx + PM2 + Ubuntu

---

## 📞 Support

- **Email:** support@ospab.host
- **Telegram:** @ospab_support
- **Documentation:** All guides in this repository
- **Issues:** [GitHub Issues](https://github.com/Ospab/ospabhost8.1/issues)

---

## 🎯 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Ready | All endpoints functional |
| Frontend | ✅ Ready | React SPA deployed |
| Panel API | ✅ Ready | 5 endpoints, HMAC auth |
| SSO Integration | ✅ Ready | userId mapping implemented |
| Proxmox Integration | ✅ Ready | VPS create/manage/stats |
| Database | ✅ Ready | MySQL 8.0 + Prisma ORM |
| Deployment | ✅ Ready | Nginx + PM2 + SSL |

**Current Branch:** `api-for-panel`  
**Last Updated:** October 28, 2025  
**Version:** 8.1

---

## ⭐ Roadmap

- [ ] Unit tests (Jest + Supertest)
- [ ] Integration tests (Playwright)
- [ ] API rate limiting
- [ ] WebSocket notifications
- [ ] Automated backups
- [ ] Monitoring dashboard (Grafana)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🙏 Acknowledgments

- **Proxmox VE** - Virtualization platform
- **Prisma** - Modern ORM for Node.js
- **React** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework

---

**⚡ Built with speed, security, and scalability in mind.**

If you find this project useful, give it a ⭐!
