# Примеры интеграции главного сайта с Панелью управления

## Как главному сайту передать данные о новом VPS?

### Шаг 1: Настройка переменных окружения на Панели

Убедитесь что в `.env` установлен `VPS_SYNC_API_KEY`:

```env
VPS_SYNC_API_KEY="ваш_секретный_ключ_минимум_32_символа"
```

### Шаг 2: Отправить данные о новом VPS

После того как пользователь оплатил тариф на главном сайте и был создан VPS:

#### Пример на Node.js/TypeScript

```typescript
// services/vps-sync.ts

interface VPSData {
  user_id: number;      // ID из SSO (от Панели)
  name: string;         // Имя VPS
  cpu: number;          // Количество ядер
  ram: number;          // ОЗУ в GB (будет конвертировано в MB)
  disk: number;         // Диск в GB
  os: string;           // ОС (Ubuntu 22.04, CentOS 7, etc)
  hypervisor?: string;  // proxmox (по умолчанию)
}

export async function syncVPSToPanel(vpsData: VPSData) {
  const panelApiUrl = process.env.OSPAB_PANEL_URL;
  const syncApiKey = process.env.VPS_SYNC_API_KEY;

  if (!panelApiUrl || !syncApiKey) {
    throw new Error('Missing OSPAB_PANEL_URL or VPS_SYNC_API_KEY');
  }

  try {
    const response = await fetch(`${panelApiUrl}/api/vps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': syncApiKey,
      },
      body: JSON.stringify({
        action: 'create',
        vps: {
          user_id: vpsData.user_id,
          name: vpsData.name,
          status: 'creating',
          cpu: vpsData.cpu,
          ram: vpsData.ram * 1024, // GB → MB
          disk: vpsData.disk,
          os: vpsData.os,
          hypervisor: vpsData.hypervisor || 'proxmox',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sync failed: ${error.message}`);
    }

    const result = await response.json();
    console.log('VPS synced successfully:', result.vps);
    return result.vps;
  } catch (error) {
    console.error('Failed to sync VPS:', error);
    throw error;
  }
}
```

#### Пример использования в Express

```typescript
// routes/orders.ts
import { syncVPSToPanel } from '../services/vps-sync';

router.post('/orders/complete', async (req, res) => {
  const { order_id, user_id, vps_config } = req.body;

  try {
    // Создаем VPS на хостинге (Proxmox, etc)
    const proxmoxResponse = await createVPSOnProxmox(vps_config);
    
    // Синхронизируем с Панелью управления
    const vpsSynced = await syncVPSToPanel({
      user_id: user_id,
      name: vps_config.name,
      cpu: vps_config.cpu,
      ram: vps_config.ram,
      disk: vps_config.disk,
      os: vps_config.os,
    });

    // Обновляем статус заказа
    await updateOrderStatus(order_id, 'completed', vpsSynced.id);

    res.json({
      success: true,
      vps_id: vpsSynced.id,
      message: 'VPS created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

### Шаг 3: После создания VPS - обновить статус

Когда VPS полностью готов и запущен:

```typescript
export async function updateVPSStatus(vpsId: number, status: string) {
  const panelApiUrl = process.env.OSPAB_PANEL_URL;
  const syncApiKey = process.env.VPS_SYNC_API_KEY;

  const response = await fetch(`${panelApiUrl}/api/vps/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': syncApiKey,
    },
    body: JSON.stringify({
      action: 'update',
      vps: {
        id: vpsId,
        status: status, // 'running', 'stopped', 'creating', etc
      },
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.vps;
}
```

### Шаг 4: Удаление VPS

Если клиент отменил услугу:

```typescript
export async function deleteVPSFromPanel(vpsId: number) {
  const panelApiUrl = process.env.OSPAB_PANEL_URL;
  const syncApiKey = process.env.VPS_SYNC_API_KEY;

  const response = await fetch(`${panelApiUrl}/api/vps/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': syncApiKey,
    },
    body: JSON.stringify({
      action: 'delete',
      vps: {
        id: vpsId,
      },
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}
```

## Переменные окружения

### На главном сайте добавить:

```env
# URL Панели управления OSPAB
OSPAB_PANEL_URL=https://panel.ospab.host
# или при тестировании: http://localhost:5050

# API ключ для синхронизации (ДОЛЖЕН СОВПАДАТЬ с VPS_SYNC_API_KEY на Панели)
VPS_SYNC_API_KEY=ваш_секретный_ключ_минимум_32_символа
```

### На Панели управления (уже добавлено):

```env
VPS_SYNC_API_KEY=ваш_секретный_ключ_минимум_32_символа
```

## Тестирование

### 1. Создание VPS через curl

```bash
curl -X POST http://localhost:5050/api/vps/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here_min_32_chars_change_this" \
  -d '{
    "action": "create",
    "vps": {
      "user_id": 5,
      "name": "test-vps-01",
      "status": "creating",
      "cpu": 4,
      "ram": 8192,
      "disk": 100,
      "os": "Ubuntu 22.04 LTS",
      "hypervisor": "proxmox"
    }
  }'
```

### 2. Обновление статуса VPS

```bash
curl -X POST http://localhost:5050/api/vps/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here_min_32_chars_change_this" \
  -d '{
    "action": "update",
    "vps": {
      "id": 1,
      "status": "running"
    }
  }'
```

### 3. Удаление VPS

```bash
curl -X POST http://localhost:5050/api/vps/sync \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_api_key_here_min_32_chars_change_this" \
  -d '{
    "action": "delete",
    "vps": {
      "id": 1
    }
  }'
```

### 4. Получение всех VPS клиента (в Панели - с клиентским токеном)

```bash
curl -X GET http://localhost:5050/api/vps \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Workflow

```
┌─────────────────────────────┐
│   Главный сайт (ospab.host) │
│                             │
│  1. Пользователь выбирает   │
│     тариф и оплачивает      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Создание VPS на хостинге       │
│  (Proxmox API call)             │
│  - Выделяю CPU                  │
│  - Выделяю RAM                  │
│  - Выделяю Storage              │
│  - Устанавливаю ОС              │
└──────────────┬──────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  POST /api/vps/sync (action: create) │
│  X-API-Key: secret_key               │
│                                      │
│  {                                   │
│    user_id: 5,                       │
│    name: "web-server-01",            │
│    cpu: 4,                           │
│    ram: 8192,                        │
│    disk: 100,                        │
│    os: "Ubuntu 22.04",               │
│    hypervisor: "proxmox"             │
│  }                                   │
└──────────────┬───────────────────────┘
               │
               ▼
┌───────────────────────────────┐
│  Панель управления (ospab)    │
│  INSERT VPS в БД              │
│  - Сохранить все параметры    │
│  - Связать с user_id          │
│  - Установить status:creating │
└──────────────┬────────────────┘
               │
               ▼
┌─────────────────────────────┐
│  VPS готов и запущен        │
│  Главный сайт отправляет:   │
│  POST /api/vps/sync         │
│  action: "update"           │
│  status: "running"          │
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Панель управления UPDATE    │
│  VPS status = "running"      │
│                              │
│  Клиент видит VPS в  панели  │
│  и может им управлять        │
└──────────────────────────────┘
```

## Проверка безопасности

✅ **API ключ в заголовке** - используется для синхронизации  
✅ **JWT токен** - используется для доступа клиентов  
✅ **User ID фильтр** - каждый пользователь видит только свои VPS  
✅ **HTTPS в production** - все данные зашифрованы  
✅ **Изоляция данных** - нет утечек между пользователями  

## Решение проблем

### Ошибка: "Invalid or missing API key"

- Проверьте что `VPS_SYNC_API_KEY` установлен на Панели
- Убедитесь что API ключ одинаковый на обоих сайтах
- Проверьте заголовок `X-API-Key` в запросе

### Ошибка: "Missing required fields"

- Убедитесь что в JSON присутствуют: `action`, `vps`
- Для `create`: нужны все поля VPS
- Для `update`: минимум `id` и `status`
- Для `delete`: нужен `id`

### VPS не появляется в панели

- Проверьте что `user_id` правильный
- Убедитесь что пользователь существует в БД
- Проверьте логи панели на ошибки
