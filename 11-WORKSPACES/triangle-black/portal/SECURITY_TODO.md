# Security TODO — Triangle Black
Generated: 2026-07-19 18:01:15.819259

## CRITICAL — Fix Before Production

### 1. Change PostgreSQL Password
Run: docker exec -it ai-postgres psql -U postgres
SQL: ALTER USER postgres PASSWORD 'YOUR_STRONG_PASSWORD';
Then update DATABASE_URL in all .env files

### 2. DEV BYPASS Auth — FIXED by task_02
File: src/core/auth.py
ENVIRONMENT now reads from env var (not hardcoded)

### 3. Real SSL Certificate (when you have domain)
sudo certbot --nginx -d yourdomain.com
Free, auto-renews, trusted by all browsers

### 4. CSRF Protection
Install: npm install csrf-csrf
Add CSRF middleware to portal API client

### 5. Secrets in .env.local
NEVER commit .env files (already in .gitignore)
Use .env.local for local dev secrets

### 6. TypeScript Strict Mode
Remove ignoreBuildErrors from next.config.ts
Fix all TypeScript errors properly

## Medium Priority
- Add rate limiting per IP (Nginx done: 30r/m)
- Add audit logging for all data access
- Rotate API keys every 90 days
- Add 2FA for admin accounts

## Current Status
- Nginx HTTPS: DONE (self-signed)
- Rate limiting: DONE (30r/m API, 10r/m chat)
- .gitignore: DONE
- DEV BYPASS: FIXED