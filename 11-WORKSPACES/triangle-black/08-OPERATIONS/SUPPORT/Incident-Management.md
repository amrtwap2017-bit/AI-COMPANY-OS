# 05 — Incident Management

> Incident management process for support operations.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 07-OPERATIONS/Incident.md | Incident response |
| Phase 8 | 07-OPERATIONS/Escalation.md | Escalation paths |

## Incident Severity Levels

| Level | Definition | Response | Resolution | Examples |
|-------|-----------|----------|------------|----------|
| SEV-1 | Service down, all customers affected | 15 min | 4 hours | Database crash, DDOS |
| SEV-2 | Major feature broken, some customers | 1 hour | 24 hours | API error, slow response |
| SEV-3 | Minor issue, workaround available | 4 hours | 5 business days | UI bug, cosmetic |
| SEV-4 | No customer impact | 24 hours | Next release | Internal tool, documentation |

## Incident Response Team

| Role | SEV-1 | SEV-2 | SEV-3 | SEV-4 |
|------|-------|-------|-------|-------|
| Incident Commander | CTO | DevOps Lead | Support Lead | Support |
| Technical Lead | DevOps Lead | DevOps | Support | — |
| Communications | COO | Support Lead | Support | — |
| Scribe | DevOps | Support | Support | — |

## Incident Workflow

```
                  ┌──────────────────────┐
                  │  Incident Detected   │
                  └──────────┬───────────┘
                             │
                     ┌───────▼───────┐
                     │  Triage       │
                     │  (Severity)   │
                     └───────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼─────┐  ┌─────▼─────┐  ┌────▼─────┐
       │   SEV-1    │  │  SEV-2/3  │  │  SEV-4   │
       │ Immediate  │  │ Standard  │  │  Normal  │
       │ response   │  │ response  │  │  queue   │
       └──────┬─────┘  └─────┬─────┘  └────┬─────┘
              │              │              │
       ┌──────▼──────────────▼──────────────▼──────┐
       │           Resolution                      │
       │  Fix + Verify + Close                     │
       └───────────────────────────────────────────┘
```

## Incident Log Template

```
─────────────────────────────────────────────
INCIDENT LOG
─────────────────────────────────────────────

Incident ID: INC-001
Date/Time: _____________
Severity: SEV-[1/2/3/4]
Detected by: _____________
Status: [Open / Investigating / Resolved / Closed]

Description:
_______________________________________________

Impact:
- Customers affected: [count]
- Services affected: [list]
- Duration: [time]

Timeline:
[time] - Detected
[time] - Triage complete
[time] - Response started
[time] - Root cause identified
[time] - Fix deployed
[time] - Verified resolved
[time] - Closed

Root Cause:
_______________________________________________

Resolution:
_______________________________________________

Postmortem required: [Yes/No]
Postmortem link: _____________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT DOCUMENTED
