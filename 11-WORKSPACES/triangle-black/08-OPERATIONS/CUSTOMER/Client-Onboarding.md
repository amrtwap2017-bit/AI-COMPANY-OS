# 08 — Client Onboarding

> Client onboarding process for hotel customers.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-06 | Commercial-Domain.md | Customer lifecycle |
| PHASE-01 | Operational-Workflows.md | Onboarding workflow |

## Onboarding Phases

```
Sign Contract ──► Configure ──► Data Migration ──► Training ──► Go-Live ──► Support
    │              │              │                  │            │           │
  1-2 days       3-5 days       5-10 days          2-3 days     1 day       30 days
```

## Onboarding Checklist

### Pre-Onboarding
- [ ] Contract signed and countersigned
- [ ] First payment received (setup fee)
- [ ] Account manager assigned
- [ ] Welcome email sent with timeline
- [ ] Technical questionnaire sent
- [ ] Kickoff meeting scheduled

### Configuration
- [ ] Tenant provisioned (schema + subdomain)
- [ ] Branding configured (logo, colors, domain)
- [ ] User accounts created (admin accounts)
- [ ] Roles and permissions configured
- [ ] Integration keys generated (if applicable)
- [ ] Data import format agreed

### Data Migration
- [ ] Existing data exported from legacy system
- [ ] Data mapping validated (fields match)
- [ ] Import script run on staging
- [ ] Import validated (record count, data quality)
- [ ] Production import scheduled

### Training
- [ ] Admin training session completed
- [ ] Staff training session completed
- [ ] Training materials provided
- [ ] User guides distributed
- [ ] Sandbox environment available for practice

### Go-Live
- [ ] Production access granted
- [ ] DNS configured (custom domain if needed)
- [ ] SSL certificate valid
- [ ] Backup script verified
- [ ] Support contacts shared
- [ ] Go-live confirmation call completed

## Onboarding Timeline Target

| Customer Type | Target Days | Notes |
|--------------|-------------|-------|
| Small hotel (<50 rooms) | 7 days | Minimal data migration |
| Medium hotel (50-200 rooms) | 14 days | Standard migration |
| Large hotel (>200 rooms) | 21 days | Complex migration |
| Hotel chain (multiple properties) | 30+ days | Per-property rollout |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
