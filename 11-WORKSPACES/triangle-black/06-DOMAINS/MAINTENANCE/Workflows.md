# 07-MAINTENANCE — Workflows

## Service Request Lifecycle

```
Client submits request (portal/phone):
    ├── Category: electrical, mechanical, plumbing, structural, other
    ├── Priority: low, medium, high, critical
    └── Description + photos
    │
    ▼
Auto-assign based on category:
    ├── Critical → Immediate assignment → 4hr response SLA
    ├── High → 8hr response SLA
    ├── Medium → 24hr response SLA
    └── Low → 48hr response SLA
    │
    ▼
Engineer dispatched → On-site → Fix complete → Client sign-off → Close
    │                                           │
    If warranty:                                │
    ├── Log warranty claim                      │
    └── Track cost vs warranty coverage         │
                                                 ▼
                                            Client satisfaction survey
```
