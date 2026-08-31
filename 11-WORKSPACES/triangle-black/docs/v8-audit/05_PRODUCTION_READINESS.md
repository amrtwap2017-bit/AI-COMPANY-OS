# V8-001 AUDIT — 05 PRODUCTION READINESS
Date: 2026-08-31
Source: Infrastructure verification

---

## PRODUCTION READINESS SCORECARD

| Item | Status | Evidence | Risk |
|------|--------|----------|------|
| Server starts | ✅ 3.16s | Measured | Acceptable |
| Tests pass | ✅ 3,619 | Fresh run | Good |
| Backup exists | ⚠️ 2 days old | Last: Aug 29 | Medium |
| Staging deployed | ❌ NOT DONE | Config exists only | HIGH |
| CI/CD production gate | ⚠️ PARTIAL | No full gate | Medium |
| main.py size | ❌ 9,019 lines | Growing | Medium |
| Rogue engines | ❌ 308 | create_engine() in routes | HIGH under load |
| Restore tested | ❌ UNKNOWN | No recent test | HIGH |

## CRITICAL: STAGING NOT DEPLOYED

docker-compose.staging.yml exists but has never been deployed.
This means:
- No pre-production validation environment
- Cannot test migrations before production
- Cannot demo to a customer on a stable URL
- Pilot must run on localhost or an ad-hoc deployment

For the first pilot, a cloud VM (DigitalOcean/Hetzner) is required.
Minimum spec: 4GB RAM, 2 CPU, 50GB SSD.
Estimated cost: ~$20-40/month.

## SERVER STARTUP TIME

3.16 seconds to import src.main is significant.
This is because main.py has 9,019 lines and 308 create_engine() calls.
Each create_engine() creates a connection pool at import time.

Under production load, this will cause:
- Slow cold starts
- Connection pool exhaustion under concurrent load
- Memory pressure

This is a KNOWN P1 risk. Not blocking for pilot (single-user demo)
but must be addressed before any scale.

## BACKUP STATUS

Last backup: 2026-08-29 (2 days before this audit on 2026-08-31)
Backup cron is configured and running.
However: restore has NOT been tested recently.

RULE: A backup never restore-tested is not a backup.

## CI/CD PIPELINE

.github/workflows/ci.yml exists with:
- Backend tests (fast subset)
- Build guard
- Python lint
- Database migrations

MISSING:
- Full test suite run (only "fast subset")
- Portal TypeScript build check
- Security tests
- E2E tests
- Staging deployment gate
- Production approval gate

