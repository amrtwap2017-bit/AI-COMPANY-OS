#!/bin/bash
# Triangle Black — Production Deployment Script
# Run from project root after setting up .env.production

set -e
echo "=== Triangle Black Production Deploy ==="
echo "Date: $(date)"

# 1. Load environment
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found — copy from .env.production.example and fill values"
    exit 1
fi
export $(grep -v '^#' .env.production | xargs)

# 2. Pre-deployment check
echo "--- Pre-deployment check ---"
bash scripts/deploy_check.sh
if [ $? -ne 0 ]; then
    echo "❌ Pre-deployment check failed — do not deploy"
    exit 1
fi

# 3. Pull latest
echo "--- Pulling latest ---"
git pull origin main

# 4. Run migrations
echo "--- Running migrations ---"
.venv/bin/alembic upgrade head

# 5. Build portal
echo "--- Building portal ---"
cd portal && npm run build && cd ..

# 6. Restart services
echo "--- Restarting services ---"
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# 7. Wait for health
echo "--- Waiting for health check ---"
sleep 30
curl -f http://localhost:8030/api/v1/health/ready || {
    echo "❌ Health check failed — check logs"
    docker-compose -f docker-compose.production.yml logs --tail=50
    exit 1
}

echo ""
echo "✅ Deployment complete"
echo "=== $(date) ==="
