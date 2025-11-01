# Чек-лист интеграции для главного сайта (ospab.host)

## 📋 Подготовка к интеграции

### Фаза 1: Координация (1 день)

- [ ] **Получить API ключ** от администратора панели управления
  - Контакт: Свяжитесь с разработчиком панели
  - Ключ должен быть минимум 32 символа
  - Пример: `your_secret_api_key_here_min_32_chars_change_this`

- [ ] **Запросить URL панели управления**
  - Production: `https://panel.ospab.host`
  - Development/Testing: `http://localhost:5050`

- [ ] **Получить таблицу соответствия user ID**
  - Как мап ID пользователей главного сайта на ID в OSPAB Panel
  - Возможно используется SSO система

### Фаза 2: Подготовка кода (1-2 дня)

- [ ] **1. Создать файл с переменными окружения**

```bash
# .env файл добавить:
OSPAB_PANEL_URL=https://panel.ospab.host
VPS_SYNC_API_KEY=your_secret_api_key_here_min_32_chars_change_this
```

- [ ] **2. Создать сервис синхронизации**

Файл: `services/ospab-vps-sync.ts` (или аналогичный)

Использовать пример из `FOR_MAIN_SITE_DEVELOPER.md`

```typescript
// Методы:
// - createVPS(data)        // Создать VPS
// - updateVPSStatus(id, status) // Обновить статус
// - deleteVPS(id)          // Удалить VPS
```

- [ ] **3. Интегрировать в маршруты**

В файлах где обрабатывается создание/удаление VPS:

```typescript
// После успешного создания на хостинге:
await vpsSync.createVPS({ user_id, name, cpu, ram, disk, os });

// Когда VPS готов:
await vpsSync.updateVPSStatus(vpsId, 'running');

// При удалении:
await vpsSync.deleteVPS(vpsId);
```

- [ ] **4. Обработка ошибок**

```typescript
try {
  await vpsSync.createVPS(data);
} catch (error) {
  // Логировать ошибку
  console.error('VPS sync failed:', error);
  
  // НЕ прерывать создание VPS на хостинге
  // Добавить в очередь для повторной попытки (bull, rsmq, etc)
}
```

### Фаза 3: Тестирование локально (1-2 дня)

- [ ] **1. Запустить панель управления локально**

```bash
# На компьютере разработчика панели:
go run ./cmd/server/main.go
# API доступен на: http://localhost:5050
# Web доступен на: http://localhost:3000
```

- [ ] **2. Обновить .env в главном сайте**

```env
OSPAB_PANEL_URL=http://localhost:5050
VPS_SYNC_API_KEY=your_secret_api_key_here_min_32_chars_change_this
```

- [ ] **3. Тестовый запрос через curl**

```bash
# Создание VPS
curl -X POST http://localhost:5050/api/vps/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here_min_32_chars_change_this" \
  -d '{
    "action": "create",
    "vps": {
      "user_id": 5,
      "name": "test-vps",
      "cpu": 2,
      "ram": 2048,
      "disk": 50,
      "os": "Ubuntu 22.04 LTS",
      "status": "creating",
      "hypervisor": "proxmox"
    }
  }'

# Ожидаемый ответ: HTTP 200, JSON с ID VPS
```

- [ ] **4. Проверить что VPS появился в панели**

1. Откройте http://localhost:3000 в браузере
2. Зайдите под пользователем с user_id = 5
3. Перейдите в "Мои серверы"
4. Должен быть VPS "test-vps"

- [ ] **5. Тесты с разными операциями**

```bash
# Обновление статуса
curl -X POST http://localhost:5050/api/vps/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here_min_32_chars_change_this" \
  -d '{"action":"update","vps":{"id":1,"status":"running"}}'

# Удаление
curl -X POST http://localhost:5050/api/vps/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here_min_32_chars_change_this" \
  -d '{"action":"delete","vps":{"id":1}}'
```

- [ ] **6. Интегрировать в процесс создания заказа**

Вставить вызовы `vpsSync` в основной workflow:

```typescript
// В файле обработки заказов:

1. Пользователь платит
2. createOrderInDB()
3. createVPSOnHypervisor()        ← Создать на хостинге
4. vpsSync.createVPS()            ← НОВОЕ: Синхронизировать с панелью
5. updateOrderStatus('completed') ← Помечить заказ как выполненный
```

### Фаза 4: Staging тестирование (1-2 дня)

- [ ] **1. Обновить .env на staging сервере**

```env
OSPAB_PANEL_URL=https://panel-staging.ospab.host
# или
OSPAB_PANEL_URL=https://panel.ospab.host (если production панель)
VPS_SYNC_API_KEY=production_api_key_from_admin
```

- [ ] **2. Развернуть новый код главного сайта на staging**

```bash
git push
# Deploy на staging сервер
```

- [ ] **3. Создать тестовый VPS через staging**

1. Откройте staging главного сайта
2. Создайте тестовый заказ на VPS
3. Оплатите
4. Проверьте что VPS появился в панели управления

- [ ] **4. Проверить все операции**

- [ ] Создание VPS
- [ ] Обновление статуса
- [ ] Удаление VPS
- [ ] Обработка ошибок (отключить панель, проверить retry logic)

- [ ] **5. Нагрузочное тестирование**

Создать 10-100 VPS одновременно, проверить стабильность

### Фаза 5: Production (1 день)

- [ ] **1. Финальная проверка перед production**

- [ ] Обновить .env на production
- [ ] Все переменные установлены правильно
- [ ] Логирование настроено
- [ ] Мониторинг настроен
- [ ] Бэкапы БД на месте

- [ ] **2. Развернуть на production**

```bash
# Merge в main
git merge develop
git push

# Deploy на production сервер
./deploy.sh
```

- [ ] **3. Мониторить первые часы**

- [ ] Проверять логи на ошибки
- [ ] Проверять что новые VPS создаются корректно
- [ ] Быть готовым к rollback если что-то пойдет не так

- [ ] **4. Уведомить клиентов**

Если нужно, отправить уведомление что интеграция с панелью завершена

### Фаза 6: После deployment (ongoing)

- [ ] **1. Мониторинг**

- [ ] Проверять что все VPS синхронизируются
- [ ] Отслеживать ошибки синхронизации
- [ ] Проверять производительность

- [ ] **2. Документация**

- [ ] Обновить README проекта
- [ ] Задокументировать процесс синхронизации
- [ ] Создать runbook для операций

- [ ] **3. Обучение команды**

- [ ] Объяснить команде как работает интеграция
- [ ] Показать как отладить проблемы
- [ ] Показать как мониторить синхронизацию

---

## 🔧 Инструменты и зависимости

### Необходимые пакеты (Node.js)

```bash
npm install
# Уже должны быть установлены:
# - express
# - dotenv (для загрузки .env)
# - typescript (если используется)
```

### Необходимы знания

- REST API
- TypeScript или JavaScript
- Environment variables
- Error handling
- Async/await

## ⏱️ Примерный график

```
Неделя 1:
  Пн: Фаза 1 (координация)
  Вт-Чт: Фаза 2 (подготовка кода)
  Пт: Фаза 3 (локальное тестирование)

Неделя 2:
  Пн-Ср: Фаза 4 (staging)
  Чт: Финальная проверка
  Пт: Фаза 5 (production)

Неделя 3+:
  Мониторинг и поддержка
```

## 🚨 Критичные моменты

⚠️ **ОБЯЗАТЕЛЬНО проверить:**

1. **RAM конвертация** - `ram * 1024` (GB → MB)
2. **User ID** - должен совпадать с ID в системе OSPAB Panel
3. **API Key** - должен быть правильный и минимум 32 символа
4. **Error handling** - панель может быть недоступна, не прерывать создание VPS
5. **Retry logic** - добавить повторные попытки при сбое синхронизации

## 📞 Поддержка

Если что-то не работает:

1. Проверьте переменные окружения
2. Проверьте логи панели управления
3. Попробуйте curl запрос (как в чек-листе)
4. Свяжитесь с разработчиком панели

Документация:
- `FOR_MAIN_SITE_DEVELOPER.md` - подробная инструкция
- `CLIENT_VPS_INTEGRATION.md` - описание API
- `VPS_SYNC_EXAMPLES.md` - примеры кода

---

**Статус:** Готово к интеграции ✅  
**Дата:** 27 октября 2025  
**Версия:** 1.0
