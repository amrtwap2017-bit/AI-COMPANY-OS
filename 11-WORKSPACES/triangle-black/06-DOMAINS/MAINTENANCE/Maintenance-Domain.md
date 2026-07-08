# Phase 06 — Maintenance Domain

> Service requests, SLA management, warranty claims, and preventive maintenance.

## Domain Scope

| Capability | Description | Priority |
|------------|-------------|----------|
| Service Request | Intake, triage, assign, schedule, complete | P1 |
| SLA Management | Define, track, breach notification | P1 |
| Warranty Management | Coverage, claims, tracking | P2 |
| Preventive Maintenance | Schedule, checklist, verification | P2 |

## Entity Relationship

```
Contract (Commercial) ──► 1:N ──► SLA Contract
Client ──► 1:N ──► ServiceRequest ──► 1:1 ──► WarrantyClaim (if applicable)
                                       ──► N:1 ──► AssignedTech (User)
                                       ──► N:1 ──► RelatedProject (if warranty from project)
```

## Location

`07-MAINTENANCE/` — 20 files following the standard template.
