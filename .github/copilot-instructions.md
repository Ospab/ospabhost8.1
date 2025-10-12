# Copilot Instructions for Ospabhost 8.1


## Архитектура и основные компоненты
- **Монорепозиторий**: две части — `backend` (Express, TypeScript, Prisma) и `frontend` (React, Vite, TypeScript).
- **Backend**:
  - Точка входа: `backend/src/index.ts` (Express, маршруты `/api/*`, CORS, логирование).
  - Модули: `backend/src/modules/*` — домены (auth, ticket, check, os, server, tariff), каждый экспортирует маршруты и сервисы.
  - Интеграция с Proxmox: через API, см. `backend/src/modules/server/proxmoxApi.ts` (создание/управление контейнерами, смена пароля root, статистика).
  - ORM: Prisma, схема — `backend/prisma/schema.prisma`, миграции и seed-скрипты — в `backend/prisma/`.
  - Статические файлы чеков: `backend/uploads/checks` (доступны по `/uploads/checks`).
- **Frontend**:
  - SPA на React + Vite, точка входа: `frontend/src/main.tsx`.
  - Страницы: `frontend/src/pages/*`, компоненты: `frontend/src/components/*`.
  - Авторизация: `frontend/src/context/authcontext.tsx`, `useAuth.ts` (контекст, хуки).
  - Дашборд: `frontend/src/pages/dashboard/mainpage.tsx` — реализует сайдбар, вкладки, загрузку данных пользователя, обработку токена, обновление данных через кастомное событие `userDataUpdate`.

## Ключевые паттерны и конвенции
- **API**: все маршруты backend — с префиксом `/api/`.
- **Модули backend**: каждый домен — отдельная папка, экспортирует маршруты и сервисы (см. пример: `server/proxmoxApi.ts`).
- **Работа с Proxmox**: все операции через функции из `proxmoxApi.ts`, параметры берутся из `.env`.
- **Статусные поля**: для Server, Check, Ticket — строковые статусы (`creating`, `running`, `pending`, `open` и др.).
- **Пароли**: генерируются через `generateSecurePassword` (см. `proxmoxApi.ts`).
- **Описание тарифа**: парсится для выделения ресурсов (ядра, RAM, SSD) при создании контейнера.
- **Frontend**: авторизация через контекст, проверка токена, автоматический logout при ошибке 401.
- **Дашборд**: вкладки и права оператора определяются по полю `operator` в userData, обновление данных через событие `userDataUpdate`.

## Сборка, запуск и workflow
- **Backend**:
  - `npm run dev` — запуск с hot-reload (ts-node-dev).
  - `npm run build` — компиляция TypeScript.
  - `npm start` — запуск собранного кода.
- **Frontend**:
  - `npm run dev` — запуск Vite dev server.
  - `npm run build` — сборка.
  - `npm run preview` — предпросмотр production-сборки.
  - `npm run lint` — проверка ESLint.

## Интеграции и взаимодействие
- **Frontend ↔ Backend**: через REST API (`/api/*`), авторизация через JWT-токен в localStorage.
- **Backend ↔ Proxmox**: через HTTP API, параметры из `.env`.
- **Prisma**: миграции и seed-скрипты — в `backend/prisma/`.

## Внешние зависимости
- **Backend**: express, prisma, axios, bcrypt, jsonwebtoken, multer, dotenv.
- **Frontend**: react, react-dom, react-router-dom, tailwindcss, axios.

## Примеры ключевых файлов
- `backend/src/index.ts` — точка входа, маршрутизация.
- `backend/src/modules/server/proxmoxApi.ts` — интеграция с Proxmox.
- `backend/prisma/schema.prisma` — схема данных.
- `frontend/src/pages/dashboard/mainpage.tsx` — дашборд, обработка токена, сайдбар, вкладки.
- `frontend/src/context/authcontext.tsx` — авторизация.

## Особенности и conventions
- **CORS**: разрешены только локальные адреса для разработки.
- **Логирование**: каждый запрос логируется с датой и методом.
- **Статические файлы**: чеки доступны по `/uploads/checks`.
- **Пароли root**: генерируются и меняются через API Proxmox.
- **Frontend**: сайдбар и вкладки строятся динамически, права оператора определяются по userData.

---

_Обновляйте этот файл при изменении архитектуры, workflow или паттернов. Для уточнения разделов — дайте обратную связь!_