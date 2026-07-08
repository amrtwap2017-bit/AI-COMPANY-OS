# 09 — Bug Prioritization

> Bug prioritization framework for hypercare.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | Testing-Strategy.md | Testing framework |
| Phase 9 | Issue-Triage.md | Issue triage |

## Bug Severity Matrix

| Severity | Definition | Response | Fix Timeline |
|----------|-----------|----------|--------------|
| CRITICAL | System down, data at risk | Immediate | < 4 hours |
| HIGH | Feature broken, no workaround | 1 hour | < 24 hours |
| MEDIUM | Feature broken, workaround exists | 4 hours | < 1 week |
| LOW | Cosmetic, minor, enhancement | 24 hours | Next release |

## Bug Priority

| Priority | Fix Timeline | Owner | Examples |
|----------|-------------|-------|----------|
| P1-Critical | < 4 hours | DevOps + CTO | Cannot create reservation, login failure |
| P2-High | < 24 hours | DevOps | Wrong rate calculated, missing report data |
| P3-Medium | < 1 week | DevOps | UI alignment issue, slow page load |
| P4-Low | Next release | Senior Dev | Typo, color mismatch, minor enhancement |

## Bug Fix Process (Hypercare)

```
Bug Identified ──► Severity Assigned ──► Fix Created ──► Reviewed ──► Deployed ──► Verified
     │                 │                    │              │             │             │
  Ticket in         Priority            Hotfix         CTO review   Deploy to    Customer
  triage            + owner             branch                        production   confirms
```

## Bug Fix SLA

| Priority | Time to Fix | Time to Deploy | Total |
|----------|-------------|----------------|-------|
| P1-Critical | 2 hours | 1 hour | 3 hours |
| P2-High | 12 hours | 2 hours | 14 hours |
| P3-Medium | 3 days | 1 day | 4 days |
| P4-Low | Next sprint | Next release | 2 weeks |

## Hotfix Process (P1 Only)

1. CTO authorizes hotfix
2. Branch from main: `hotfix/ISS-XXX-description`
3. Minimal fix (no refactoring)
4. CI/CD must pass (build + test)
5. Deploy directly to production (skip staging)
6. Monitor for 30 min post-deploy
7. Postmortem required (within 24 hours)

## Bug Log

```
─────────────────────────────────────────────
BUG LOG
─────────────────────────────────────────────

Bug ID: BUG-001
Date: _____________
Severity: [Critical / High / Medium / Low]
Reported by: _____________

Description:
_______________________________________________

Steps to Reproduce:
1. ___________________________________________
2. ___________________________________________

Expected: _____________________________________
Actual: _______________________________________

Fix: __________________________________________
Deployed: [Date] [Time]
Verified: [Date] [Time]
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT ACTIVE
