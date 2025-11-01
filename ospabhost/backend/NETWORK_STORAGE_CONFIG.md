# Конфигурация сети и хранилища для Proxmox

## Обзор

Теперь вы можете настроить сетевой интерфейс и диск для контейнеров/VM через переменные окружения в `.env` файле.

## Переменные окружения

### 1. Сетевой мост (Network Bridge)

```env
PROXMOX_NETWORK_BRIDGE=vmbr0
```

**Как узнать доступные мосты:**
1. Войдите в Proxmox веб-интерфейс
2. Перейдите: `Datacenter → Node (sv1) → Network`
3. Посмотрите список доступных мостов (обычно `vmbr0`, `vmbr1`, `vmbr2`)

**Изменение:**
- Просто измените значение в `.env` на нужный мост
- Например: `PROXMOX_NETWORK_BRIDGE=vmbr1`

### 2. Хранилище для дисков (Storage)

```env
PROXMOX_VM_STORAGE=local
PROXMOX_BACKUP_STORAGE=local
PROXMOX_ISO_STORAGE=local
```

**Как узнать доступные хранилища:**
1. Войдите в Proxmox веб-интерфейс
2. Перейдите: `Datacenter → Storage`
3. Посмотрите список доступных хранилищ (обычно `local`, `local-lvm`, `nfs-storage`)

**Изменение:**
- Измените значения в `.env` на нужные хранилища
- Например: `PROXMOX_VM_STORAGE=local-lvm`

## Применение изменений

После изменения `.env` файла:

### На локальной машине (разработка):

```bash
cd backend
npm run build
npm run dev
```

### На production сервере:

```bash
cd /var/www/ospab-host/ospabhost/backend

# 1. Редактируем .env файл
vim .env

# 2. Изменяем нужные переменные
# PROXMOX_NETWORK_BRIDGE=vmbr1  # например, на другой мост
# PROXMOX_VM_STORAGE=local-lvm  # например, на другое хранилище

# 3. Пересобираем и перезапускаем
npm run build
pm2 restart ospab-backend

# 4. Проверяем логи
pm2 logs ospab-backend --lines 30
```

## Проверка настроек

После создания нового контейнера проверьте его конфигурацию:

```bash
# SSH на Proxmox сервер
ssh root@sv1.ospab.host

# Посмотреть конфигурацию контейнера (замените 100 на VMID)
pct config 100

# Проверить сетевой интерфейс (должен показать ваш мост)
# net0: name=eth0,bridge=vmbr0,ip=dhcp

# Проверить хранилище (должен показать ваше хранилище)
# rootfs: local:100/vm-100-disk-0.raw,size=20G
```

## Примеры конфигураций

### Конфигурация 1: Стандартная (по умолчанию)
```env
PROXMOX_NETWORK_BRIDGE=vmbr0
PROXMOX_VM_STORAGE=local
```

### Конфигурация 2: Отдельная сеть + LVM хранилище
```env
PROXMOX_NETWORK_BRIDGE=vmbr1
PROXMOX_VM_STORAGE=local-lvm
```

### Конфигурация 3: NFS хранилище
```env
PROXMOX_NETWORK_BRIDGE=vmbr0
PROXMOX_VM_STORAGE=nfs-storage
PROXMOX_BACKUP_STORAGE=nfs-storage
```

## Решение проблем

### Ошибка: "storage 'xxx' does not exist"
- Проверьте, что хранилище существует в Proxmox (Datacenter → Storage)
- Убедитесь, что имя написано правильно (чувствительно к регистру)

### Ошибка: "bridge 'xxx' does not exist"
- Проверьте, что мост существует в Proxmox (Node → Network)
- Убедитесь, что имя написано правильно (обычно `vmbr0`, `vmbr1`)

### Контейнер создаётся, но не имеет сети
- Проверьте, что мост активен и настроен правильно
- Убедитесь, что DHCP работает в вашей сети (или используйте статический IP)

## Логирование

При создании контейнера в логах backend вы увидите:

```
Создание LXC контейнера с параметрами: {
  ...
  net0: 'name=eth0,bridge=vmbr0,ip=dhcp',
  rootfs: 'local:20',
  ...
}
```

Проверьте эти значения, чтобы убедиться, что используются правильные настройки.
