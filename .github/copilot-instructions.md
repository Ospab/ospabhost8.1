# Copilot Instructions for Ospabhost 8.1

## Архитектура проекта
- **Монорепозиторий**: две основные части — `backend` (Express, TypeScript, Prisma) и `frontend` (React, Vite, TypeScript).
- **Backend**:
  - Основной сервер: `backend/src/index.ts` — точка входа, маршрутизация, CORS, логирование.
  - Модули: `backend/src/modules/*` — бизнес-логика по доменам (auth, ticket, check, os, server, tariff).
  - Интеграция с Proxmox: через API, см. `backend/src/modules/server/proxmoxApi.ts`.
  - ORM: Prisma, схема — `backend/prisma/schema.prisma`.
  - Статические файлы чеков: `backend/uploads/checks`.
- **Frontend**:
  - SPA на React + Vite, точка входа: `frontend/src/main.tsx`.
  - Страницы: `frontend/src/pages/*`, компоненты: `frontend/src/components/*`.
  - Контекст авторизации: `frontend/src/context/authcontext.tsx`, `useAuth.ts`.

## Важные паттерны и конвенции
- **Маршруты API**: начинаются с `/api/`, см. `backend/src/index.ts`.
- **Модули backend**: каждый домен — отдельная папка, экспортирует маршруты и сервисы.
- **Работа с Proxmox**: все операции (создание контейнера, управление, статистика) через функции из `proxmoxApi.ts`.
- **Статусные поля**: для сущностей (Server, Check, Ticket) используются строковые статусы (`creating`, `running`, `pending`, `open` и т.д.).
- **Пароли**: генерируются через `generateSecurePassword` (см. `proxmoxApi.ts`).
- **Описание тарифа**: парсится для выделения ресурсов (ядра, RAM, SSD) при создании контейнера.

## Сборка и запуск
- **Backend**:
  - `npm run dev` — запуск с hot-reload (ts-node-dev).
  - `npm run build` — компиляция TypeScript.
  - `npm start` — запуск собранного кода.
- **Frontend**:
  - `npm run dev` — запуск Vite dev server.
  - `npm run build` — сборка.
  - `npm run preview` — предпросмотр production-сборки.
  - `npm run lint` — проверка ESLint.

## Взаимодействие компонентов
- **Frontend ↔ Backend**: через REST API, адреса `/api/*`.
- **Backend ↔ Proxmox**: через HTTP API, параметры берутся из `.env`.
- **Prisma**: миграции и seed-скрипты — в `backend/prisma/`.

## Внешние зависимости
- **Backend**: express, prisma, axios, bcrypt, jsonwebtoken, multer, dotenv.
- **Frontend**: react, react-dom, react-router-dom, tailwindcss, axios.

## Примеры ключевых файлов
- `backend/src/index.ts` — точка входа, маршрутизация.
- `backend/src/modules/server/proxmoxApi.ts` — интеграция с Proxmox.
- `backend/prisma/schema.prisma` — схема данных.
- `frontend/src/pages/*` — страницы SPA.
- `frontend/src/context/authcontext.tsx` — авторизация.

## Особенности
- **CORS**: разрешены только локальные адреса для разработки.
- **Логирование**: каждый запрос логируется с датой и методом.
- **Статические файлы**: чеки доступны по `/uploads/checks`.
- **Пароли root**: генерируются и меняются через API Proxmox.

---

_Обновите этот файл при изменении архитектуры или ключевых паттернов. Для уточнения разделов — дайте обратную связь!_