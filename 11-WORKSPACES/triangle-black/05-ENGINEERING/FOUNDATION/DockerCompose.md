# Docker Compose Architecture

## Overview

Single-host Docker Compose deployment for V1. All services communicate over internal Docker networks. Persistent data stored in named volumes.

## docker-compose.yml

```yaml
version: "3.9"

name: triangleblack

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads:
    driver: local
  certbot_www:
    driver: local
  certbot_conf:
    driver: local

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
  database:
    driver: bridge
    internal: true

services:
  # ─── Database ───────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: tb-postgres
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - database
    environment:
      POSTGRES_DB: triangleblack
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d triangleblack"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # ─── Cache & Queue (V1) ────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: tb-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - backend
    command:
      - redis-server
      - --appendonly yes
      - --save 60 1000
      - --maxmemory 256mb
      - --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # ─── Backend API ────────────────────────────────────────
  backend:
    image: triangleblack/backend:latest
    container_name: tb-backend
    restart: unless-stopped
    build:
      context: ../backend
      dockerfile: Dockerfile
    networks:
      - backend
      - database
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/triangleblack
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: 15m
      JWT_REFRESH_EXPIRATION: 7d
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      CORS_ORIGIN: https://app.triangleblack.com
      LOG_LEVEL: info
      UPLOAD_DIR: /app/uploads
    volumes:
      - uploads:/app/uploads
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # ─── Frontend ───────────────────────────────────────────
  frontend:
    image: triangleblack/frontend:latest
    container_name: tb-frontend
    restart: unless-stopped
    build:
      context: ../frontend
      dockerfile: Dockerfile
    networks:
      - frontend
      - backend
    depends_on:
      - backend
    environment:
      NODE_ENV: production
      HOSTNAME: 0.0.0.0
      PORT: 3000
      NEXT_PUBLIC_API_URL: https://api.triangleblack.com
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # ─── Reverse Proxy ──────────────────────────────────────
  nginx:
    image: nginx:1.25-alpine
    container_name: tb-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    networks:
      - frontend
    depends_on:
      - frontend
      - backend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/sites:ro
      - certbot_www:/var/www/certbot:ro
      - certbot_conf:/etc/letsencrypt:ro
      - uploads:/var/www/uploads:ro
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 60s
      timeout: 5s
      retries: 2
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # ─── SSL Certificate Management ─────────────────────────
  certbot:
    image: certbot/certbot:latest
    container_name: tb-certbot
    networks:
      - frontend
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_conf:/etc/letsencrypt
    entrypoint: |
      sh -c 'trap exit TERM; while true; do
        certbot renew --quiet --no-self-upgrade
        sleep 12h &
        wait $${!}
      done'
```

## Environment File (.env)

```
# Database
DB_USER=tb_user
DB_PASSWORD=CHANGE_ME_SECURE_PASSWORD

# Auth
JWT_SECRET=CHANGE_ME_JWT_SECRET_AT_LEAST_32_CHARS
ENCRYPTION_KEY=CHANGE_ME_32_BYTE_HEX_KEY

# Domains (Cloudflare DNS)
DOMAIN=triangleblack.com
API_DOMAIN=api.triangleblack.com
APP_DOMAIN=app.triangleblack.com
```

## Service Dependencies

```
┌──────────┐     ┌──────────┐
│   nginx   │────►│ frontend │
│ :80/443   │     │ :3000    │
└────┬─────┘     └────┬─────┘
     │                 │
     │                 ▼
     │           ┌──────────┐
     │           │  backend  │
     │           │ :4000    │
     │           └────┬─────┘
     │                 │
     │           ┌─────┴─────┐
     │           │           │
     │      ┌────┴────┐ ┌────┴────┐
     │      │ postgres│ │  redis  │
     │      │ :5432   │ │ :6379   │
     │      └─────────┘ └─────────┘
     │
     │      ┌──────────┐
     └──────│  certbot  │
            │ (renewal) │
            └──────────┘
```

## Network Security

| Network | Purpose | External Access | Services |
|---------|---------|-----------------|----------|
| `frontend` | Public-facing web traffic | nginx ports 80/443 | nginx, frontend, certbot |
| `backend` | Application logic | None | frontend, backend, redis |
| `database` | Data storage | None (DB port on 127.0.0.1 only) | backend, postgres |

## Deployment Commands

```bash
# Start all services
docker compose --env-file .env up -d

# Rebuild and restart specific service
docker compose --env-file .env up -d --build backend

# View logs
docker compose logs -f --tail=100

# Check health
docker compose ps

# Stop all
docker compose down

# Full teardown (destroys volumes)
docker compose down -v
```

## Resource Allocation (VPS with 4 GB RAM)

| Service | Limit | Reservation | % of Total |
|---------|-------|-------------|------------|
| PostgreSQL | 1024 MB | 512 MB | 25% |
| Redis | 512 MB | 256 MB | 12.5% |
| Backend | 1024 MB | 512 MB | 25% |
| Frontend | 512 MB | 256 MB | 12.5% |
| Nginx | 256 MB | 128 MB | 6% |
| OS overhead | ~512 MB | - | 12.5% |
| **Total** | **~3.3 GB** | | **~82%** |
