#!/bin/bash
# Запустить на Proxmox: ssh root@sv1.ospab.host < find-storage.sh

echo "════════════════════════════════════════════════════════════"
echo "🔍 ПОИСК ВСЕХ STORAGE И ДИСКОВ НА PROXMOX"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "1️⃣ ВСЕ storage (включая отключённые):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pvesm status
echo ""

echo "2️⃣ ВСЕ физические диски и разделы:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE
echo ""

echo "3️⃣ Использование дискового пространства:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h | grep -E "Filesystem|local|vm-storage|root|dev"
echo ""

echo "4️⃣ LVM volumes (если используется):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
lvs 2>/dev/null || echo "LVM не используется"
echo ""

echo "5️⃣ Конфигурация storage в Proxmox:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat /etc/pve/storage.cfg
echo ""

echo "6️⃣ Права на storage директориях:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh /mnt/pve/ 2>/dev/null || echo "Нет /mnt/pve"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "✅ Анализ завершен"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📝 ИНСТРУКЦИЯ:"
echo "1. Найдите в выводе выше ваш EXTRA диск (не local)"
echo "2. Проверьте строку 'NAME' в pvesm status - это точное имя storage"
echo "3. Обновите в backend/.env: PROXMOX_VM_STORAGE=<НАЙДЕННОЕ_ИМЯ>"
echo "4. Перезагрузите backend"
echo ""
