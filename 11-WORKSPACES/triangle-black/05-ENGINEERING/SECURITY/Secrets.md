# Secrets Management

## Overview

Secrets are never committed to git, never hardcoded in source code, and never logged. V1 uses environment variables managed through `.env` files with strict access control. V2+ may adopt a dedicated secrets manager (Hashicorp Vault, AWS Secrets Manager).

## What is a Secret

| Type | Examples | Location | Rotatable |
|------|----------|----------|-----------|
| Database credentials | `DB_USER`, `DB_PASSWORD` | `.env` | Yes |
| JWT secrets | `JWT_SECRET`, `JWT_REFRESH_SECRET` | `.env` | Yes |
| Encryption keys | `ENCRYPTION_KEY` | `.env` | Yes (with migration) |
| API keys | `SENDGRID_API_KEY`, `STRIPE_SECRET_KEY` | `.env` | Yes |
| OAuth tokens | `GOOGLE_CLIENT_SECRET` | `.env` | Yes |
| Database URL | `DATABASE_URL` | `.env` | Yes |
| Cloudflare API token | `CLOUDFLARE_API_TOKEN` | `.env` | Yes |

## Environment File Structure

### `.env.example` (committed to git)

```
# ─── Database ──────────────────────────────────
# PostgreSQL credentials
# Generate with: openssl rand -base64 12
DB_USER=tb_user
DB_PASSWORD=changeme

# ─── Auth ──────────────────────────────────────
# Generate with: openssl rand -base64 32
JWT_SECRET=changeme
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=changeme

# ─── External Services ─────────────────────────
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=

# ─── Domains ───────────────────────────────────
DOMAIN=triangleblack.com
API_DOMAIN=api.triangleblack.com
APP_DOMAIN=app.triangleblack.com
```

### `.env` (NOT committed)

```
DB_USER=tb_user
DB_PASSWORD=Ys9mK2pL4qR7vW8x
JWT_SECRET=0a5b8c1d2e3f4g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d
ENCRYPTION_KEY=7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f
SENDGRID_API_KEY=SG.abc123def456...
STRIPE_SECRET_KEY=sk_live_...
```

## `.gitignore` Configuration

```gitignore
# Environment files
.env
.env.local
.env.production
.env.development

# Secrets directory (future)
/secrets/
*.pem
*.key

# Docker compose override
docker-compose.override.yml
```

## Secret Generation

```bash
# Database password (12 chars, base64)
openssl rand -base64 12
# → Ys9mK2pL4qR7vW8x

# JWT secret (32 bytes, hex)
openssl rand -hex 32
# → 0a5b8c1d2e3f4g7h8i9j0k1l2m3n4o5p...

# Encryption key (32 bytes, hex)
openssl rand -hex 32
# → 7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d...

# Deploy user SSH key
ssh-keygen -t ed25519 -f ~/.ssh/tb_deploy -C "deploy@triangleblack.com"
```

## Secret Storage

### V1: Password Manager + Host File

| Environment | Storage | Access |
|-------------|---------|--------|
| Development | `.env.local` (developer machine) | Developer only |
| Staging | `.env` on staging VPS + 1Password | DevOps + Dev |
| Production | `.env` on production VPS + 1Password | DevOps only |

The `.env` file lives on the VPS at `/home/deploy/triangleblack/.env` and is referenced by Docker Compose:

```yaml
services:
  backend:
    env_file: .env
```

### V2+: Dedicated Secrets Manager

```
┌──────────────┐     ┌──────────────┐
│  Application  │────►│  Vault        │
│  (requests    │     │  (or AWS SM)  │
│   secret)     │     │               │
└──────────────┘     │  ├─ DB creds  │
                     │  ├─ JWT keys  │
                     │  ├─ API keys  │
                     │  └─ ...       │
                     └──────────────┘
```

## Secret Rotation Policy

| Secret | Rotation Frequency | Impact | Procedure |
|--------|--------------------|--------|-----------|
| Database password | Every 90 days | Rolling restart of backend | Update `.env`, restart `docker compose` |
| JWT secret | Every 90 days | All sessions invalidated | Update `.env`, restart backend |
| Encryption key | Every 6 months | Data re-encryption required | Complex — minimize changes |
| API keys (external) | On compromise or annually | Update external service, restart | Per-service |
| SSH keys | Annually | Update `authorized_keys` | Generate new key pair |
| Stripe keys | On compromise | Regenerate in Stripe dashboard | Update `.env` |

### Rotation Procedure

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update .env on server
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_SECRET/" /home/deploy/triangleblack/.env

# 3. Restart affected services
docker compose up -d backend

# 4. Verify
curl -s https://api.triangleblack.com/health

# 5. Update password manager
# (manual step in V1)
```

## Preventing Secret Leakage

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Prevent committing .env or secrets
if git diff --cached --name-only | grep -E '\.env$|\.pem$|\.key$|secrets'; then
  echo "ERROR: Refusing to commit environment files or secrets."
  exit 1
fi

# Check for potential secrets in staged files
if git diff --cached | grep -E '^\+.*(password|secret|api.?key|token)\s*[:=]\s*["\x27]?[A-Za-z0-9_\-]{20,}' > /dev/null; then
  echo "WARNING: Staged files may contain secrets. Please review."
  echo "To commit anyway: git commit --no-verify"
  exit 1
fi
```

### Code Scanning

```bash
# Scan repository for accidental secrets
# Install: npm install -g secretlint
secretlint "**/*"

# Or use git-secrets
# https://github.com/awslabs/git-secrets
git secrets --scan
```

## What NOT to Do

| Practice | Why | Instead |
|----------|-----|---------|
| Hardcoding secrets in source | Exposed in git history, CI logs | Environment variables |
| Committing `.env` to git | Public repository exposure | `.env.example` only |
| Logging secrets | Exposed in log aggregation | Strip secrets from logs |
| Sharing secrets in chat | Uncontrolled distribution | Password manager |
| Same secret dev/prod | Prod compromised if dev leaked | Separate secrets per environment |
| Long-lived static keys | Larger blast window if leaked | Regular rotation |
| Secrets in Docker images | Extracted from image layers | Runtime environment variables |

## Emergency Procedure

If a secret is compromised:

1. **Identify affected secret** — Review git history, logs, access patterns
2. **Rotate immediately** — Generate new secret, update `.env`, restart services
3. **Revoke old credentials** — For external services, revoke in provider dashboard
4. **Audit access** — Check if unauthorized access occurred
5. **Document incident** — What happened, how, prevention
6. **Update .env.example** — Add rotation date, note if format changed
