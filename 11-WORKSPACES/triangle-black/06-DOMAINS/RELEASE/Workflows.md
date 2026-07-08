# 99-RELEASE — Workflows

## Release Pipeline

```
Feature Complete → CI/CD Pipeline → Staging Deploy → QA Test → UAT → Production Deploy → Go-Live → Hyper-care
                       ↓               ↓              ↓        ↓          ↓                ↓          ↓
                   GitHub          Docker         Automated    Client    Blue-green     DNS cutover   Monitoring
                   Actions         Compose        tests +     sign-off   deploy         validate     Daily
                                   staging        manual                                                standups
```

## UAT Workflow

```
Release candidate deployed to staging → UAT testers assigned
    │
    ├── Execute test scripts (by role)
    ├── Log defects → Priority: critical, high, medium, low
    ├── Fix → Verify → Close
    └── All critical/high defects closed → Sign-off
    │
    ▼
UAT sign-off obtained → Ready for production deploy
```
