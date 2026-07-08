# 05 — Problem Management

> Problem management process for recurring issues.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 07-OPERATIONS/Incident.md | Incident response |
| Phase 9 | Incident-Management.md | Incident management |

## Problem vs Incident

| Aspect | Incident | Problem |
|--------|----------|---------|
| Definition | Single event causing disruption | Root cause of one or more incidents |
| Focus | Restore service quickly | Prevent recurrence |
| Timeframe | Immediate (minutes/hours) | Ongoing (days/weeks) |
| Process | Triage → Fix → Verify | Analyze → Fix → Test → Deploy |
| Documentation | Incident report | Known error record |

## Problem Management Process

```
Identify ──► Log ──► Analyze ──► Fix ──► Verify ──► Close
   │         │        │          │        │          │
 Pattern   Problem   RCA         Root     Tested    Known
 from      record    identified  cause    +         error
 incidents  created              resolved  deployed  record
```

## Known Error Database

| KE ID | Description | Root Cause | Workaround | Permanent Fix | Status |
|-------|-------------|------------|------------|---------------|--------|
| KE-001 | (To be populated) | | | | |

## Problem Analysis Techniques

- **5 Whys** — Ask "why" 5 times to find root cause
- **Fishbone (Ishikawa)** — Categorize causes (people, process, technology)
- **Timeline analysis** — Map events leading to incident
- **Trend analysis** — Identify patterns across incidents

## Problem Record Template

```
─────────────────────────────────────────────
PROBLEM RECORD
─────────────────────────────────────────────

Problem ID: PRB-001
Date Opened: _____________
Related Incidents: INC-001, INC-003, INC-007

Description:
_______________________________________________

Root Cause Analysis:
_______________________________________________

Workaround:
_______________________________________________

Permanent Fix:
_______________________________________________

Fix Deployed: [Date]
Verified: [Date]
Closed: [Date]

Known Error Record: KE-[ID]
```

## Major Problem Review

For problems causing SEV-1/2 incidents:
1. Postmortem within 24 hours
2. Root cause documented
3. Permanent fix scheduled
4. Monitoring added for recurrence
5. Lessons learned shared with team

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT DOCUMENTED
