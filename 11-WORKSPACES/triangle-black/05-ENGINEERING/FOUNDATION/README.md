# 10 — Infrastructure

## Stack (Frozen)

| Layer | Technology | Cost |
|-------|-----------|------|
| VPS | DigitalOcean Basic Droplet ($6/mo) | $6/mo |
| Database | PostgreSQL 16 on same VPS | Included |
| Reverse proxy | Nginx | Free |
| SSL | Let's Encrypt (certbot) | Free |
| DNS | Cloudflare Free | Free |
| CDN | Cloudflare Free | Free |
| Containerization | Docker Compose | Free |
| CI/CD | GitHub Free + Actions | Free |
| Monitoring | Uptime Kuma (self-hosted) | Free |
| Error tracking | Sentry Free (5K events/mo) | Free |
| Total | — | ~$6/mo + domain |

## VPS Spec

| Spec | Value |
|------|-------|
| Provider | DigitalOcean |
| Plan | Basic / $6/mo |
| CPU | 1 vCPU |
| RAM | 512 MB (1 GB recommended for V1 launch) |
| Storage | 25 GB SSD |
| Transfer | 1 TB |
| OS | Ubuntu 24.04 LTS |

## Docker Compose Architecture

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: triangle_black
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always

  api:
    build: ./apps/api
    depends_on: [postgres]
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/triangle_black
    restart: always

  web:
    build: ./apps/web
    depends_on: [api]
    restart: always

  admin:
    build: ./apps/admin
    depends_on: [api]
    restart: always

  nginx:
    image: nginx:alpine
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/sites:/etc/nginx/sites-enabled
      - certbot-data:/etc/letsencrypt
    ports:
      - "80:80"
      - "443:443"
    depends_on: [api, web, admin]

volumes:
  pgdata:
  certbot-data:
```

## Backup Strategy

| Schedule | Contents | Method |
|----------|----------|--------|
| Daily | PostgreSQL dump | `pg_dump` → compressed → local disk |
| Weekly | Full database + uploads | Same + rsync to backup dir |
| Monthly | Off-site copy | `scp` to secondary provider |

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/triangleblack
server {
    listen 443 ssl;
    server_name app.triangleblack.tech;

    ssl_certificate /etc/letsencrypt/live/app.triangleblack.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.triangleblack.tech/privkey.pem;

    location /api/ {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://web:3000;
    }
}
```
