#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Triangle Black — Production Startup Script
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "🔺 Triangle Black — Starting Production Stack"

# Check .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found. Copy .env.production.example and fill in values."
  exit 1
fi

# Load env
export $(grep -v "^#" .env.production | xargs)

echo "📦 Pulling latest images..."
docker compose -f docker-compose.production.yml pull

echo "🚀 Starting services..."
docker compose -f docker-compose.production.yml up -d

echo "⏳ Waiting for API health..."
sleep 5
for i in {1..12}; do
  if curl -sf http://localhost/health > /dev/null 2>&1; then
    echo "✅ API is healthy"
    break
  fi
  echo "  Waiting... ($i/12)"
  sleep 5
done

echo ""
echo "🔺 Triangle Black is running:"
echo "   Ops Portal:    http://app.triangleblack.com"
echo "   Client Portal: http://client.triangleblack.com"
echo "   API Health:    http://localhost/health"
echo ""
docker compose -f docker-compose.production.yml ps
