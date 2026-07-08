# Phase 06 — Project Delivery

> Project execution, milestone tracking, NCR management, and handover.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Project Planning | WBS, timeline, budget | P0 |
| Milestone Management | Define, track, approve, invoice | P0 |
| NCR Management | Identify, classify, resolve | P1 |
| Daily Reporting | Progress, photos, issues | P1 |
| Handover | Checklist, docs, sign-off | P1 |

## Entity Relationship

```
Contract (from Commercial) ──► 1:N ──► Project ──► 1:N ──► Milestone
                                        │ 1:N ──► NCR
                                        │ 1:N ──► DailyReport
                                        └─► 1:1 ──► HandoverDocument
```

## Location

`02-PROJECT-DELIVERY/` — 20 files following the standard template.

## Related Documents

- `02-PROJECT-DELIVERY/` — Complete 20-file set
