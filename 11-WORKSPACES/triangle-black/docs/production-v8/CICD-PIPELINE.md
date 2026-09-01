# TRIANGLE BLACK — CI/CD PIPELINE
Date: 2026-09-01
Status: V8-005 — COMPLETE

---

## PIPELINE OVERVIEW

Every push to main or pull request runs:

  push/PR
    ↓
  backend-quality    (lint + syntax + build guard)
    ↓
  backend-tests      (3,650+ tests + migrations)
    ↓
  portal-build       (TypeScript + next build)
    ↓
  security-scan      (bandit + secret check)
    ↓
  ci-complete        (all gates passed gate)

## JOBS

### backend-quality
- Python syntax check (main.py)
- Ruff lint (E,W,F rules)
- Build Guard (existing custom checks)

### backend-tests
- Services: PostgreSQL (pg17) + Redis (7-alpine)
- Alembic migrations applied before tests
- Full pytest suite (3,650+ tests)
- Zero failures gate

### portal-build
- npm ci (clean install)
- TypeScript check (< 50 errors threshold)
- npm run build (full Next.js build)

### security-scan
- Bandit: HIGH severity issues reported
- .env files not in git check
- No production credentials in source

### ci-complete
- All previous jobs must pass
- Gate for deployment decisions

## GATES REQUIRED BEFORE DEPLOY

1. ✅ backend-quality: PASS
2. ✅ backend-tests: 0 failures
3. ✅ portal-build: build succeeds
4. ✅ security-scan: no critical issues
5. ✅ ci-complete: all gates

## ENVIRONMENT VARIABLES IN CI

| Variable | Source | Value |
|----------|--------|-------|
| DATABASE_URL | ci env | postgresql://ai:ai123@localhost:5432/triangle_black |
| TB_SECRET_KEY | ci env | ci-test-secret-key |
| DISABLE_RATE_LIMIT | ci env | 1 |

Production secrets NEVER in CI environment.
Production secrets ONLY on production server.

## WHAT CI DOES NOT YET DO

- E2E tests (Playwright) — future V8-011
- Container build + push — future V8-S09
- Automatic staging deploy — future V8-S09
- Production deploy — ALWAYS manual approval
