# 07 — Change Management

> Change management process for production changes.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | CI-CD.md | Deployment pipeline |
| PHASE-05 | DevOps-Foundation.md | Deployment workflow |

## Change Types

| Type | Approval | Window | Examples |
|------|----------|--------|----------|
| Emergency | CTO + DevOps Lead | Any time | Hotfix for SEV-1 |
| Standard | DevOps Lead | Mon-Fri 9-5 | Feature release, patch |
| Minor | Self-service | Any time | Config change, env vars |
| Scheduled | COO + CTO | Planned window | Infrastructure upgrade |

## Change Request Process

```
Submit ──► Review ──► Approve ──► Test ──► Deploy ──► Verify
  │          │           │          │        │          │
  Jira       Peer        Required   Staging  Prod       Monitor
  ticket     review      approver   deploy   deploy     1 hour
```

## Change Advisory Board (CAB)

| Role | Member | Voting |
|------|--------|--------|
| CTO | TBD | ✅ |
| DevOps Lead | TBD | ✅ |
| COO | TBD | ✅ |
| QA Lead | TBD | Advisory |
| Customer Rep | TBD | Advisory |

## Change Calendar

| Window | Day | Time | Notes |
|--------|-----|------|-------|
| Regular | Mon-Thu | 09:00-15:00 | Standard deploys |
| Emergency | Any | Any | SEV-1 only |
| Freeze | Last week of month | — | Pre-billing stability |
| Freeze (major) | Dec 15 - Jan 5 | — | Holiday season |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT DOCUMENTED
