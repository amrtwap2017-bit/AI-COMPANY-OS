# 09 — Issue Triage

> Issue triage process for hypercare period.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 9 | Hypercare-Plan.md | Hypercare priorities |
| Phase 9 | Incident-Management.md | Incident management |

## Triage Process

```
Issue Reported ──► Triage ──► Categorize ──► Prioritize ──► Assign ──► Track
     │              │            │              │             │          │
  Customer /     Severity     Bug /        P1-P4        Owner       Ticket
  Monitoring     + impact     Config /                   assigned    tracked
                              Question /                             to resolution
                              Feature
```

## Triage Criteria

| Factor | P1 | P2 | P3 | P4 |
|--------|------|------|------|------|
| Customer impact | Cannot work | Major feature blocked | Minor inconvenience | No impact |
| Revenue impact | Payment blocked | Revenue delayed | No impact | No impact |
| Data impact | Data loss risk | Data incorrect | Cosmetic data issue | No impact |
| Workaround | None | Partial | Full workaround | N/A |
| Users affected | All | Many | Few | Single |

## Triage Response Times

| Priority | Response Time | Update Frequency | Escalation |
|----------|--------------|------------------|------------|
| P1 | 15 min | Every 30 min | CTO immediately |
| P2 | 1 hour | Every 2 hours | COO + CTO |
| P3 | 4 hours | Daily | None |
| P4 | 24 hours | Weekly | None |

## Triage Log

```
─────────────────────────────────────────────
TRIAGE LOG
─────────────────────────────────────────────

Issue ID: ISS-001
Date/Time: _____________
Reported by: _____________
Channel: [Support / Monitoring / Customer]

Description:
_______________________________________________

Category: [Bug / Configuration / Question / Feature]
Severity: [P1 / P2 / P3 / P4]

Assignee: _____________
Status: [Open / In Progress / Resolved / Closed]

Resolution:
_______________________________________________

Resolved at: _____________
Verified by: _____________
```

## Triage Ownership

| Day | Triage Lead | Backup |
|-----|-------------|--------|
| Monday | DevOps Lead | CTO |
| Tuesday | DevOps Lead | CTO |
| Wednesday | CTO | DevOps Lead |
| Thursday | CTO | DevOps Lead |
| Friday | DevOps Lead | CTO |
| Weekend | CTO (on-call) | DevOps Lead (on-call) |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT ACTIVE
