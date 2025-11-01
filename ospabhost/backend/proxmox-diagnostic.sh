#!/bin/bash
# Скрипт диагностики для Proxmox - запустить на сервере Proxmox

echo "════════════════════════════════════════════════════════════"
echo "        ДИАГНОСТИКА PROXMOX ДЛЯ OSPABHOST"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "1️⃣ Версия Proxmox:"
pveversion
echo ""

echo "2️⃣ Доступные storage pools:"
pvesm status --enabled 1
echo ""

echo "3️⃣ Существующие контейнеры LXC:"
pct list
echo ""

echo "4️⃣ API пользователи и токены:"
echo "Users:"
pveum user list | grep -E "api-user|ospab"
echo ""
echo "Tokens:"
pveum token list
echo ""

echo "5️⃣ Права API пользователя:"
pveum acl list | grep api-user
echo ""

echo "6️⃣ Сетевые интерфейсы:"
ip -br address
echo ""

echo "7️⃣ Логи Proxmox (последние 20 строк):"
tail -20 /var/log/pve/api2-access.log
echo ""

echo "════════════════════════════════════════════════════════════"
echo "✅ Диагностика завершена"
echo "════════════════════════════════════════════════════════════"
