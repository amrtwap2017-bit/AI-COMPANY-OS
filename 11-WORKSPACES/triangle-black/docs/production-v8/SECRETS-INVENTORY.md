# TRIANGLE BLACK — SECRETS INVENTORY
Date: 2026-09-01
Status: V8-003 — Secrets Management Sprint

---

## SECRETS CLASSIFICATION

### CATEGORY A — ACCEPTABLE IN CODE (non-sensitive)
These are defaults/examples that reveal no real credentials:
- Default database URL pointing to localhost (dev only)
- Placeholder/example values in .env.example

### CATEGORY B — ACCEPTABLE IN GITIGNORED FILES
- .env.local — development credentials
- .env.production — production credentials (GITIGNORED)

### CATEGORY C — MUST NOT APPEAR IN CODE (FIXED)
- Real passwords
- Production API keys
- JWT secret keys
- SMTP credentials

---

## HARDCODED CREDENTIAL LOCATIONS (Found in Audit)

| File | Credential | Category | Status |
|------|-----------|----------|--------|
| src/core/database.py | localhost:ai123 fallback | A | ACCEPTABLE (dev only) |
| src/core/seed.py | Admin123 seed data | A | ACCEPTABLE (seed script) |
| src/main.py | ai123 DB references | A | ACCEPTABLE (dev default) |
| scripts/backup_db.py | ai123 fallback | FIXED | Uses os.environ now |
| portal/app/login/page.tsx | demo credentials | FIXED | Uses NEXT_PUBLIC env vars |
| portal/lib/auth/token-manager.ts | demo credentials | FIXED | Uses NEXT_PUBLIC env vars |
| scripts/seed_demo_data.py | demo passwords | A | ACCEPTABLE (seed only) |
| AI router files (6) | ai123 DB references | A | ACCEPTABLE (dev defaults) |

---

## ENVIRONMENT FILE STRATEGY

| File | Purpose | In Git? | Real Secrets? |
|------|---------|---------|---------------|
| .env.example | Template — safe defaults | ✅ YES | ❌ NO |
| .env.local | Local development | ❌ NO | ✅ Dev only |
| .env.staging | Staging environment | ❌ NO | ✅ Staging only |
| .env.production | Production | ❌ NO | ✅ Production only |

---

## PRODUCTION SECRET ROTATION REQUIRED

Before production deployment, rotate:
1. TB_SECRET_KEY — generate: python3 -c "import secrets; print(secrets.token_hex(64))"
2. DATABASE_URL password — use strong random password
3. Admin user password — change from admin123 after first login
4. SMTP credentials — use real SMTP service

---

## RULES

1. No secret ever committed to git
2. No secret in application logs
3. No secret in API responses
4. No secret in error messages
5. .env.production lives only on the production server
6. Rotate secrets on any suspected exposure
7. Generate secrets with: python3 -c "import secrets; print(secrets.token_hex(64))"
