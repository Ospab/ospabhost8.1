#!/bin/bash
# Deploy script для обновления ospab-host на сервере
# Использование: ./deploy.sh

set -e  # Выход при первой ошибке

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       DEPLOYMENT: VPS Sync + Logging Optimization          ║"
echo "╚════════════════════════════════════════════════════════════╝"

BACKEND_DIR="/var/www/ospab-host/backend"

# 1. Git update
echo ""
echo "📥 [1/6] Загружаю обновления из GitHub..."
cd /var/www/ospab-host
git pull origin main || {
    echo "❌ Ошибка: не удалось обновить git"
    exit 1
}

# 2. Clean node_modules (на случай если были проблемы с prisma)
echo ""
echo "🧹 [2/6] Очищаю node_modules..."
cd $BACKEND_DIR
rm -rf node_modules package-lock.json
echo "✅ Удалено"

# 3. Install dependencies
echo ""
echo "📚 [3/6] Переустанавливаю зависимости..."
npm cache clean --force
npm install || {
    echo "❌ Ошибка: не удалось установить зависимости"
    exit 1
}
echo "✅ Установлено"

# 4. Build
echo ""
echo "🔨 [4/6] Собираю backend..."
npm run build || {
    echo "❌ Ошибка: не удалось собрать backend"
    exit 1
}
echo "✅ Собрано"

# 5. Restart backend
echo ""
echo "🔄 [5/6] Перезагружаю backend..."
pm2 restart ospab-backend || {
    echo "❌ Ошибка: не удалось перезагрузить backend"
    echo "   Убедитесь что PM2 установлен: npm install -g pm2"
    exit 1
}
sleep 2
echo "✅ Перезагружено"

# 6. Health check
echo ""
echo "✅ [6/6] Проверяю статус..."
echo ""

# Check health endpoint
HEALTH=$(curl -s https://ospab.host:5000/health | grep -o '"status":"ok"' || echo "failed")
if [[ $HEALTH == *"ok"* ]]; then
    echo "✅ Health check: OK"
else
    echo "❌ Health check: FAILED"
fi

# Check VPS Sync
SYNC=$(curl -s https://ospab.host:5000/api/vps/sync/status | grep -o '"status":"connected"' || echo "failed")
if [[ $SYNC == *"connected"* ]]; then
    echo "✅ VPS Sync: CONNECTED"
else
    echo "⚠️  VPS Sync: DISABLED (check .env)"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✨ DEPLOYMENT COMPLETE                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Backend logs:"
echo "   pm2 logs ospab-backend | grep VPS"
echo ""
echo "🔍 Проверить VPS Sync:"
echo "   curl https://ospab.host:5000/api/vps/sync/status"
echo ""
echo "✅ Готово!"
