# V8-S09 — CLOUD VM SERVER SETUP CHECKLIST
Date: 2026-09-01
Status: READY TO EXECUTE

## VM REQUIREMENTS
- Provider: DigitalOcean / Hetzner / AWS
- Spec: 4GB RAM, 2 vCPU, 50GB SSD (minimum)
- OS: Ubuntu 22.04 LTS
- Cost: ~$20-40/month

## STEP-BY-STEP SERVER SETUP

### 1. Create VM and SSH in
ssh root@YOUR_SERVER_IP

### 2. Install dependencies
apt update && apt upgrade -y apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git postgresql-client systemctl enable docker && systemctl start docker

### 3. Create app user
useradd -m -s /bin/bash triangleblack usermod -aG docker triangleblack

### 4. Clone repository
su - triangleblack git clone https://github.com/YOUR_ORG/AI-COMPANY-OS.git cd AI-COMPANY-OS/11-WORKSPACES/triangle-black

### 5. Setup Python venv
python3 -m venv .venv .venv/bin/pip install -r requirements.txt

### 6. Setup Node.js (for portal build)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - apt install -y nodejs cd portal && npm install && npm run build && cd ..

### 7. Setup PostgreSQL
apt install -y postgresql postgresql-contrib sudo -u postgres psql CREATE USER tb_user WITH PASSWORD 'STRONG_PASSWORD'; CREATE DATABASE triangle_black_prod OWNER tb_user; \q

### 8. Configure environment
cp .env.production.example .env.production nano .env.production

Fill in: TB_SECRET_KEY, DATABASE_URL, ALLOWED_ORIGINS, NEXT_PUBLIC_API_URL

### 9. Run migrations
DATABASE_URL=postgresql+psycopg2://tb_user:PASSWORD@localhost/triangle_black_prod
.venv/bin/alembic upgrade head

### 10. Start with docker-compose
docker-compose -f docker-compose.production.yml up -d

### 11. Setup nginx + SSL
Create nginx config
cat > /etc/nginx/sites-available/triangleblack << 'NGINX' server { server_name YOUR_DOMAIN.com; location /api { proxy_pass http://localhost:8030; } location / { proxy_pass http://localhost:3000; } } NGINX ln -s /etc/nginx/sites-available/triangleblack /etc/nginx/sites-enabled/ certbot --nginx -d YOUR_DOMAIN.com systemctl reload nginx

### 12. Setup backup cron
echo "0 2 * * * cd /home/triangleblack/AI-COMPANY-OS/11-WORKSPACES/triangle-black && PGPASSWORD=PASSWORD pg_dump -U tb_user triangle_black_prod | gzip > backups/triangle_black_$(date +%Y%m%d).sql.gz" | crontab -

### 13. Verify
curl https://YOUR_DOMAIN.com/api/v1/health/live

Expected: {"status": "live", ...}

## ACCEPTANCE CRITERIA
- [ ] https://YOUR_DOMAIN.com/api/v1/health/live returns 200
- [ ] SSL certificate valid (green lock)
- [ ] Portal loads at https://YOUR_DOMAIN.com
- [ ] Login works with admin credentials
- [ ] /api/v1/attention/ returns CRITICAL urgency
- [ ] Backup cron configured
- [ ] Monitoring configured

## ESTIMATED TIME: 2-3 hours for first deployment
