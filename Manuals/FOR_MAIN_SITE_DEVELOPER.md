# Инструкция для разработчика главного сайта

## 📌 Контекст

**Главный сайт** (ospab.host):
- Каталог тарифов VPS
- Система оплаты
- Создание/удаление VPS на хостинге (Proxmox, VMware и т.д.)

**Панель управления** (ospab-panel):
- Клиентская зона для управления своими VPS
- Получает данные о VPS с главного сайта через API
- Пользователи видят актуальный статус своих серверов

## 🔗 Как они соединяются?

```
Главный сайт                    Панель управления
    │                                    │
    ├─ Пользователь платит           ←──┤
    ├─ Создается VPS на Proxmox     
    │                                    │
    └─ POST /api/vps/sync ──────────────→ Сохраняет в БД
       (отправляет данные)               │
                                    Клиент видит VPS
```

## 🚀 Что нужно сделать на главном сайте

### Шаг 1: Установить переменные окружения

Добавить в `.env`:

```bash
# URL Панели управления OSPAB
OSPAB_PANEL_URL=https://panel.ospab.host
# При локальной разработке:
# OSPAB_PANEL_URL=http://localhost:5050

# API ключ для синхронизации VPS
# ⚠️ ДОЛЖЕН СОВПАДАТЬ с VPS_SYNC_API_KEY на Панели!
VPS_SYNC_API_KEY=your_secret_api_key_here_min_32_chars_change_this
```

### Шаг 2: Получить значение VPS_SYNC_API_KEY

**Вариант 1: Сгенерировать свой ключ**
```bash
# Linux/Mac
openssl rand -hex 16
# Результат: 6c8a4f2e9b1d3c5a7f9e2b4c6a8d0f1e
# Добавить prefix и получится: 6c8a4f2e9b1d3c5a7f9e2b4c6a8d0f1e6c8a4f2e
```

**Вариант 2: Использовать готовый ключ**
- Свяжитесь с администратором панели
- Он установит ключ на своей стороне в `.env`

### Шаг 3: Создать сервис для синхронизации VPS

Создайте файл `services/ospab-vps-sync.ts`:

```typescript
/**
 * VPS Sync Service - синхронизация с Панелью управления OSPAB
 * Отправляет информацию о VPS через REST API
 */

interface VPSSyncData {
  user_id: number;      // ID пользователя в системе OSPAB
  name: string;         // Имя VPS (например: web-server-01)
  cpu: number;          // Количество ядер (1, 2, 4, 8, etc)
  ram: number;          // ОЗУ в GB (1, 2, 4, 8, 16, 32, etc)
  disk: number;         // Диск в GB (10, 50, 100, 500, 1000, etc)
  os: string;           // Операционная система (Ubuntu 22.04 LTS, CentOS 7, Debian 11, etc)
  hypervisor?: string;  // Тип гипервизора (proxmox по умолчанию, может быть vmware, hyperv, kvm, xen)
}

class VPSSyncService {
  private panelUrl: string;
  private apiKey: string;

  constructor() {
    this.panelUrl = process.env.OSPAB_PANEL_URL || '';
    this.apiKey = process.env.VPS_SYNC_API_KEY || '';

    if (!this.panelUrl || !this.apiKey) {
      throw new Error('Missing OSPAB_PANEL_URL or VPS_SYNC_API_KEY environment variables');
    }
  }

  /**
   * Создать новый VPS на Панели управления
   * Вызывается сразу после создания VPS на хостинге
   */
  async createVPS(data: VPSSyncData) {
    console.log(`[VPS Sync] Creating VPS: ${data.name} for user ${data.user_id}`);

    const response = await fetch(`${this.panelUrl}/api/vps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        action: 'create',
        vps: {
          user_id: data.user_id,
          name: data.name,
          status: 'creating',
          cpu: data.cpu,
          ram: data.ram * 1024, // 🔴 ВАЖНО: конвертируем GB в MB!
          disk: data.disk,
          os: data.os,
          hypervisor: data.hypervisor || 'proxmox',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`[VPS Sync] Create failed: ${error.message}`);
    }

    const result = await response.json();
    console.log(`[VPS Sync] VPS created successfully, ID: ${result.vps.id}`);
    return result.vps;
  }

  /**
   * Обновить статус VPS
   * Вызывается после изменения статуса (например, VPS запущен, остановлен, и т.д.)
   */
  async updateVPSStatus(vpsId: number, status: string) {
    console.log(`[VPS Sync] Updating VPS ${vpsId} status to: ${status}`);

    const response = await fetch(`${this.panelUrl}/api/vps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        action: 'update',
        vps: {
          id: vpsId,
          status: status,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`[VPS Sync] Update failed: ${error.message}`);
    }

    const result = await response.json();
    console.log(`[VPS Sync] VPS ${vpsId} status updated to: ${status}`);
    return result.vps;
  }

  /**
   * Удалить VPS
   * Вызывается когда клиент отменил услугу
   */
  async deleteVPS(vpsId: number) {
    console.log(`[VPS Sync] Deleting VPS ${vpsId}`);

    const response = await fetch(`${this.panelUrl}/api/vps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        action: 'delete',
        vps: {
          id: vpsId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`[VPS Sync] Delete failed: ${error.message}`);
    }

    console.log(`[VPS Sync] VPS ${vpsId} deleted successfully`);
    return true;
  }
}

export default new VPSSyncService();
```

### Шаг 4: Использовать сервис в основном коде

**Пример в Express маршруте (создание VPS):**

```typescript
import vpsSync from './services/ospab-vps-sync';

router.post('/api/vps/create', async (req, res) => {
  try {
    const { user_id, name, cpu, ram, disk, os } = req.body;

    // 1️⃣ Создать VPS на хостинге (Proxmox, VMware, etc)
    console.log('Creating VPS on Proxmox...');
    const proxmoxVPS = await createVPSOnProxmox({
      name,
      cpu,
      ram: ram * 1024, // GB to MB for Proxmox
      disk,
      os,
    });

    console.log('VPS created on Proxmox:', proxmoxVPS.id);

    // 2️⃣ Синхронизировать с Панелью управления
    console.log('Syncing with OSPAB Panel...');
    const panelVPS = await vpsSync.createVPS({
      user_id,
      name,
      cpu,
      ram,
      disk,
      os,
    });

    console.log('VPS synced with panel, ID:', panelVPS.id);

    // 3️⃣ Обновить статус когда VPS готов (через несколько минут)
    // Рекомендуется использовать job queue (bull, rsmq, etc)
    setTimeout(async () => {
      try {
        await vpsSync.updateVPSStatus(panelVPS.id, 'running');
        console.log('VPS status updated to running');
      } catch (err) {
        console.error('Failed to update VPS status:', err);
      }
    }, 60000); // 1 минута

    res.json({
      success: true,
      vps_id: panelVPS.id,
      message: 'VPS created successfully',
    });
  } catch (error) {
    console.error('Error creating VPS:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

**Пример для удаления VPS:**

```typescript
router.post('/api/vps/delete', async (req, res) => {
  try {
    const { vps_id, proxmox_id } = req.body;

    // 1️⃣ Удалить с хостинга
    await deleteVPSFromProxmox(proxmox_id);
    console.log('VPS deleted from Proxmox');

    // 2️⃣ Удалить из Панели
    await vpsSync.deleteVPS(vps_id);
    console.log('VPS deleted from panel');

    res.json({
      success: true,
      message: 'VPS deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting VPS:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

## ⚠️ Важные моменты

### 1. Конвертация единиц

| Параметр | Главный сайт | Панель | Конвертация |
|----------|--------------|-------|-------------|
| RAM | GB | MB | ×1024 |
| Disk | GB | GB | ×1 |
| CPU | cores | cores | ×1 |

```typescript
// ❌ НЕПРАВИЛЬНО (забыли конвертировать)
vpsSync.createVPS({ ram: 8 }); // Панель получит 8 MB вместо 8 GB

// ✅ ПРАВИЛЬНО
vpsSync.createVPS({ ram: 8 * 1024 }); // Панель получит 8192 MB = 8 GB
```

### 2. User ID

`user_id` должен быть **ID из SSO системы** Панели управления:

```typescript
// ❌ НЕПРАВИЛЬНО (локальный ID главного сайта)
const userId = req.user.id; // 123 в БД главного сайта

// ✅ ПРАВИЛЬНО (ID из SSO)
const userId = req.user.sso_id; // 5 в системе OSPAB Panel
```

### 3. Обработка ошибок

```typescript
try {
  await vpsSync.createVPS(vpsData);
} catch (error) {
  // Важно логировать ошибку!
  console.error('Failed to sync VPS:', error.message);
  
  // Но НЕ прерывать создание VPS на хостинге
  // VPS может быть создан, даже если панель недоступна
  
  // Вариант: сохранить попытку синхронизации в БД
  // и повторить попытку позже через job queue
}
```

### 4. Статусы VPS

```typescript
// Возможные статусы
'creating'    // VPS создается
'running'     // VPS запущен и готов
'stopped'     // VPS остановлен
'suspended'   // VPS приостановлен (например, за неоплату)
```

## 🧪 Тестирование

### Локальное тестирование

1. Запустить Панель управления локально:
```bash
go run ./cmd/server/main.go
# Будет доступна на http://localhost:5050
```

2. В `.env` главного сайта:
```env
OSPAB_PANEL_URL=http://localhost:5050
VPS_SYNC_API_KEY=your_secret_api_key_here_min_32_chars_change_this
```

3. Тестировать создание VPS через API главного сайта

### Тест через curl

```bash
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
```

Ожидаемый ответ:
```json
{
  "status": "success",
  "message": "VPS synced successfully",
  "vps": {
    "id": 1,
    "name": "test-vps",
    "status": "creating",
    "created_at": "2025-10-27T10:30:00Z"
  }
}
```

## 📚 Дополнительно

- Полная документация: `CLIENT_VPS_INTEGRATION.md`
- Примеры кода: `VPS_SYNC_EXAMPLES.md`
- Быстрый старт: `VPS_SYNC_QUICK_START.md`

## ❓ Часто задаваемые вопросы

**Q: Что если панель недоступна?**  
A: VPS все равно создастся на хостинге. Добавьте retry logic и job queue (bull/rsmq) для повторных попыток синхронизации.

**Q: Может ли быть несовпадение данных?**  
A: Да, если синхронизация сорвалась. Рекомендуется периодически проверять консистентность и добавить маршрут для ручной синхронизации.

**Q: Как обновлять IP адрес VPS?**  
A: Текущий API синхронизирует только основные параметры. IP адрес может быть добавлен позже через расширение API.

**Q: Нужна ли двусторонняя синхронизация?**  
A: Нет, панель только получает данные. Главный сайт - источник истины.

---

**Вопросы?** Смотрите документацию выше или свяжитесь с разработчиком панели.
