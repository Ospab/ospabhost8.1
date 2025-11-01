# VPS Sync API - Быстрый старт

## TL;DR - что нужно сделать

### На Панели управления (уже готово)

✅ Эндпоинт: `POST /api/vps/sync`  
✅ Защита: API ключ в заголовке `X-API-Key`  
✅ Таблица БД: `vps` со всеми параметрами  
✅ Методы: create, update, delete  

### На главном сайте (что нужно сделать)

1. **Добавить переменную окружения:**
```env
VPS_SYNC_API_KEY=your_secret_api_key_here_min_32_chars_change_this
OSPAB_PANEL_URL=https://panel.ospab.host
```

2. **Создать функцию для отправки данных:**
```typescript
// Минимальный пример на Node.js
async function createVPSonPanel(vpsData) {
  const res = await fetch(`${process.env.OSPAB_PANEL_URL}/api/vps/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.VPS_SYNC_API_KEY
    },
    body: JSON.stringify({
      action: 'create',
      vps: {
        user_id: vpsData.userId,
        name: vpsData.name,
        cpu: vpsData.cpu,
        ram: vpsData.ram * 1024, // GB to MB!
        disk: vpsData.disk,
        os: vpsData.os,
        status: 'creating',
        hypervisor: 'proxmox'
      }
    })
  });
  return res.json();
}
```

3. **Вызвать после создания VPS на хостинге:**
```typescript
// После успешного создания на Proxmox/VMware/и т.д.
const created = await createVPSonPanel({
  userId: 5,              // ID пользователя из SSO
  name: 'web-server-01',  // Имя VPS
  cpu: 4,                 // Ядер
  ram: 8,                 // GB (будет конвертировано в MB)
  disk: 100,              // GB
  os: 'Ubuntu 22.04 LTS'
});

console.log('VPS создан с ID:', created.vps.id);
```

4. **Обновить статус когда VPS готов:**
```typescript
async function updateVPSStatusOnPanel(vpsId, status) {
  return fetch(`${process.env.OSPAB_PANEL_URL}/api/vps/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.VPS_SYNC_API_KEY
    },
    body: JSON.stringify({
      action: 'update',
      vps: { id: vpsId, status }
    })
  }).then(r => r.json());
}

// Вызов
await updateVPSStatusOnPanel(createdVPS.id, 'running');
```

## Ключевые моменты

| Параметр | Важно помнить |
|----------|---------------|
| `user_id` | Это ID из SSO системы (от Панели управления) |
| `ram` | Отправляем в **MB**, главный сайт отправляет в **GB** (×1024) |
| `disk` | В **GB** |
| `cpu` | Количество **ядер** |
| `status` | creating, running, stopped, suspended |
| `hypervisor` | proxmox (для Proxmox VE) |
| `X-API-Key` | ДОЛЖЕН быть в заголовке, не в body! |

## Проверка что работает

1. Создайте тестовый VPS через curl (смотри VPS_SYNC_EXAMPLES.md)
2. Зайдите в Панель управления под пользователем с ID 5
3. Должен появиться VPS в списке

## Файлы для ознакомления

- `CLIENT_VPS_INTEGRATION.md` - полная документация API
- `VPS_SYNC_EXAMPLES.md` - примеры кода (Node.js, Python)
- `.env` - переменные окружения

## Что дальше?

После интеграции синхронизации:

- [ ] Добавить webhook для автоматических обновлений статуса
- [ ] Добавить batch API для синхронизации множества VPS
- [ ] Настроить мониторинг (CPU, RAM, Disk usage)
- [ ] Добавить real-time обновления через WebSocket
