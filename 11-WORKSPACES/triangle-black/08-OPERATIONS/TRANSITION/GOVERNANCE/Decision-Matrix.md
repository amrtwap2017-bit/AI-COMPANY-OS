# 01 — Decision Matrix

> Rapid decision-making framework for go-live decisions.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 0 | 02-DECISION-RECORDS.md | ADR process |
| Phase 8 | 12-GO-LIVE | Go-live criteria |

## Decision Categories

| Category | Decision Type | Timeframe | Authority |
|----------|--------------|-----------|-----------|
| **RED** | Emergency, must act now | < 15 min | CTO |
| **AMBER** | Urgent, can wait 1 hour | < 1 hour | CTO + DevOps |
| **GREEN** | Standard decision | < 24 hours | Designated owner |
| **BLUE** | Strategic decision | < 1 week | Executive Committee |

## RED Decisions (15 min)

| Decision | Default Action | Authority |
|----------|---------------|-----------|
| Rollback deployment | Rollback immediately | CTO |
| Take site offline | Take offline, investigate | CTO |
| Block malicious traffic | Block at Nginx level | CTO |
| Restore from backup | Restore, notify COO | DevOps Lead |

## AMBER Decisions (1 hour)

| Decision | Default Action | Authority |
|----------|---------------|-----------|
| Emergency release | Authorize hotfix | CTO |
| Scale up VPS | Upgrade droplet | DevOps Lead |
| Failover to backup | Initiate failover | DevOps Lead |
| Customer data fix | Manual SQL with approval | CTO |

## GREEN Decisions (24 hours)

| Decision | Default Action | Authority |
|----------|---------------|-----------|
| Standard release | Follow release process | DevOps Lead |
| Feature flag toggle | Toggle per plan | Product |
| Customer config change | Apply per request | Support |
| Access grant | Follow access policy | CTO |

## BLUE Decisions (1 week)

| Decision | Default Action | Authority |
|----------|---------------|-----------|
| Pricing change | Proposal → COO review | COO |
| Contract terms | Legal review | COO |
| Architecture change | ADR required | CTO |
| New integration | Phase 7 process | CTO + COO |
| Budget change | Executive review | Executive Committee |

## Escalation Path

```
Issue occurs
    │
    ▼
Category identified (RED/AMBER/GREEN/BLUE)
    │
    ▼
Authority makes decision
    │
    ▼
Decision logged in decision register
    │
    ▼
If needed → Escalate to next authority
```

## Decision Register

Every decision is logged with:
- Date/time
- Decision
- Rationale
- Authority
- Outcome
- Related incident (if any)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT APPROVED
