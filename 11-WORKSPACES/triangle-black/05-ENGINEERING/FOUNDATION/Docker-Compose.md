# INF-001 — Docker Compose

## `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: tb-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: triangle_black
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
      target: development
    container_name: tb-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD:-devpassword}@postgres:5432/triangle_black
      JWT_SECRET: ${JWT_SECRET:-dev-jwt-secret}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-dev-jwt-refresh-secret}
      PORT: 4000
      CORS_ORIGIN: http://localhost:3000,http://localhost:3001
      UPLOAD_DIR: /data/uploads
    ports:
      - "4000:4000"
    volumes:
      - ./apps/api/src:/app/apps/api/src
      - ./packages:/app/packages
      - uploads:/data/uploads

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: development
    container_name: tb-web
    restart: unless-stopped
    depends_on:
      - api
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:4000/api/v1
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web/src:/app/apps/web/src
      - ./packages:/app/packages

  admin:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      target: development
    container_name: tb-admin
    restart: unless-stopped
    depends_on:
      - api
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:4000/api/v1
    ports:
      - "3001:3000"
    volumes:
      - ./apps/web/src:/app/apps/web/src
      - ./packages:/app/packages

  worker:
    build:
      context: .
      dockerfile: apps/worker/Dockerfile
      target: development
    container_name: tb-worker
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD:-devpassword}@postgres:5432/triangle_black
    volumes:
      - ./apps/worker/src:/app/apps/worker/src
      - ./packages:/app/packages

  nginx:
    image: nginx:alpine
    container_name: tb-nginx
    restart: unless-stopped
    depends_on:
      - api
      - web
      - admin
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/sites:/etc/nginx/conf.d
      - certbot-data:/etc/letsencrypt

volumes:
  pgdata:
  uploads:
  certbot-data:
```

## `.env.example`

```env
# Database
DATABASE_URL=postgresql://postgres:devpassword@localhost:5432/triangle_black
DB_PASSWORD=devpassword

# JWT
JWT_SECRET=change-this-in-production-32-chars-min
JWT_REFRESH_SECRET=change-this-too-32-chars-min
JWT_ISSUER=triangle-black-platform
JWT_AUDIENCE=triangle-black-app

# Application
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Sentry (optional — leave blank for development)
SENTRY_DSN=
```

## Nginx Config

### `docker/nginx/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    include /etc/nginx/conf.d/*.conf;
}
```

### `docker/nginx/sites/default.conf`

```nginx
server {
    listen 80;
    server_name localhost;

    # API
    location /api/ {
        proxy_pass http://api:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Portal
    location /admin/ {
        proxy_pass http://admin:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Web App
    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl;
    server_name app.triangleblack.tech;

    ssl_certificate /etc/letsencrypt/live/app.triangleblack.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.triangleblack.tech/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
    add_header Permissions-Policy camera=(), microphone=(), geolocation=();

    location /api/ {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
    }
}
```
