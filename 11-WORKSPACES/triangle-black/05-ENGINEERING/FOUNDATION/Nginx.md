# Nginx Configuration

## Overview

Nginx serves as the single entry point for all HTTP/HTTPS traffic. It handles SSL termination, reverse proxying to frontend and backend containers, static file serving, rate limiting, and security headers.

## File Structure

```
nginx/
├── nginx.conf          # Main configuration
├── sites/
│   ├── triangleblack.com   # Main site (marketing website)
│   ├── app.triangleblack.com   # Application SPA
│   └── api.triangleblack.com   # API proxy
└── snippets/
    ├── security-headers.conf
    ├── rate-limiting.conf
    ├── ssl.conf
    └── gzip.conf
```

## Main Configuration

### nginx.conf

```nginx
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /var/run/nginx.pid;

events {
    multi_accept on;
    worker_connections 1024;
    use epoll;
}

http {
    charset utf-8;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    server_tokens off;
    log_not_found off;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log combined buffer=512k flush=1m;
    error_log /var/log/nginx/error.log warn;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/octet-stream
        image/svg+xml;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=static:10m rate=100r/s;

    # SSL
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Upstreams
    upstream frontend {
        server frontend:3000 max_fails=3 fail_timeout=10s;
    }

    upstream backend {
        server backend:4000 max_fails=3 fail_timeout=10s;
    }

    # Include site configurations
    include /etc/nginx/sites/*.conf;
}
```

## Site Configurations

### triangleblack.com (Marketing Website)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name triangleblack.com www.triangleblack.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name triangleblack.com www.triangleblack.com;

    include snippets/ssl.conf;
    include snippets/security-headers.conf;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Route to frontend container for marketing pages
    location / {
        proxy_pass http://frontend;
        include snippets/proxy-params.conf;
    }
}
```

### app.triangleblack.com (Application SPA)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.triangleblack.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.triangleblack.com;

    include snippets/ssl.conf;
    include snippets/security-headers.conf;
    add_header Strict-Transport-Security "max-age=63072000" always;

    # SPA with client-side routing
    location / {
        proxy_pass http://frontend;
        include snippets/proxy-params.conf;
    }
}
```

### api.triangleblack.com (Backend API)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.triangleblack.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.triangleblack.com;

    include snippets/ssl.conf;
    include snippets/security-headers.conf;
    include snippets/rate-limiting.conf;
    include snippets/cors.conf;
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://backend;
        include snippets/proxy-params.conf;
        access_log off;
    }

    # API routes
    location /api/ {
        proxy_pass http://backend;
        include snippets/proxy-params.conf;
    }

    # WebSocket support (V2)
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Block all other requests
    location / {
        return 404;
    }
}
```

## Snippets

### ssl.conf

```nginx
ssl_certificate /etc/letsencrypt/live/triangleblack.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/triangleblack.com/privkey.pem;
ssl_trusted_certificate /etc/letsencrypt/live/triangleblack.com/chain.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_ecdh_curve secp384r1;
ssl_stapling on;
ssl_stapling_verify on;

resolver 1.1.1.1 8.8.8.8 valid=300s;
resolver_timeout 5s;
```

### security-headers.conf

```nginx
# Security headers (Mozilla Observatory recommendation)
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options SAMEORIGIN;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy strict-origin-when-cross-origin;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self' data:;
    connect-src 'self' https://api.triangleblack.com wss://api.triangleblack.com;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
" always;
```

### rate-limiting.conf

```nginx
# API rate limits
location /api/auth/ {
    limit_req zone=auth burst=5 nodelay;
    proxy_pass http://backend;
}

location /api/ {
    limit_req zone=api burst=10 nodelay;
    proxy_pass http://backend;
}
```

### proxy-params.conf

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;

proxy_connect_timeout 30s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 8k;
proxy_busy_buffers_size 16k;
```

### cors.conf

```nginx
if ($request_method ~* "(GET|POST|PUT|DELETE|PATCH|OPTIONS)") {
    set $cors_method $request_method;
}

if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin "https://app.triangleblack.com";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
    add_header Access-Control-Allow-Credentials "true";
    add_header Access-Control-Max-Age 1728000;
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 204;
}

add_header Access-Control-Allow-Origin "https://app.triangleblack.com" always;
add_header Access-Control-Allow-Credentials "true" always;
```

### gzip.conf

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_min_length 256;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/octet-stream
    image/svg+xml;
```

## Verification

```bash
# Test configuration
docker exec tb-nginx nginx -t

# Check SSL configuration
docker exec tb-nginx openssl s_client -connect localhost:443 -servername triangleblack.com

# Verify security headers
curl -sI https://triangleblack.com | grep -i "strict-transport-security\|x-content-type-options\|x-frame-options"

# Check rate limiting (should get 503 after burst)
for i in $(seq 1 50); do curl -s -o /dev/null -w "%{http_code}\n" https://api.triangleblack.com/api/health; done | sort | uniq -c
```

## Logging

```bash
# Access logs
docker logs tb-nginx --tail 100

# Error logs
docker exec tb-nginx tail -f /var/log/nginx/error.log

# Check for 4xx/5xx
docker exec tb-nginx awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```
