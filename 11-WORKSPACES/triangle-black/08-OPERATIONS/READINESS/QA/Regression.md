# 04 — Regression Testing

> Regression testing strategy to prevent existing feature breakage.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | Testing-Strategy.md | Test automation |

## Regression Suite

| Test Type | Count | Frequency | Automation | Status |
|-----------|-------|-----------|------------|--------|
| Unit tests | — | Every commit | ✅ Planned | ❌ |
| Integration tests | — | Every PR | ✅ Planned | ❌ |
| E2E critical path | 6 | Every deployment | ✅ Planned | ❌ |
| E2E full suite | — | Nightly | ✅ Planned | ❌ |
| Visual regression | Key screens | Weekly | ⚠️ Planned | ❌ |

## Regression Triggers

| Trigger | Scope | Responsibility |
|---------|-------|---------------|
| New feature deployment | Full regression | QA Team |
| Dependency update | Affected modules | Dev Team |
| Database migration | Data layer | Dev Team |
| Configuration change | Deployment | DevOps |
| Hotfix | Affected + dependent | Dev + QA |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |

**Status:** ❌ NOT SET UP
