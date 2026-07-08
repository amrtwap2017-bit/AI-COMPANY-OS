# 08 — Service Level Agreement

> Service Level Agreements for Triangle Black customers.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | Infrastructure SLA |
| PHASE-07 | | Integration SLAs |

## Service Availability SLA

| Metric | Target | Measurement | Exclusion |
|--------|--------|-------------|-----------|
| Platform uptime (API + Web) | 99.5% | Monthly average | Planned maintenance |
| Database availability | 99.9% | Monthly average | Backup window |
| Email delivery | 99% | Monthly average | Third-party issues |
| SMS delivery | 98% | Monthly average | Carrier issues |

## Support SLA

| Priority | Response Time | Resolution Time | Notification |
|----------|--------------|-----------------|--------------|
| SEV-1 (Service Down) | 15 min | 4 hours | Phone + Email |
| SEV-2 (Major Issue) | 1 hour | 24 hours | Email + In-app |
| SEV-3 (Minor Issue) | 4 hours | 5 business days | Email |
| SEV-4 (Enhancement) | 24 hours | Next release | Email |

## Penalties

| Missed SLA | Credit |
|------------|--------|
| Uptime < 99.0% | 10% monthly credit |
| Uptime < 95.0% | 25% monthly credit |
| Uptime < 90.0% | 50% monthly credit |
| SEV-1 resolution > 4 hours | 5% monthly credit per incident |

## SLA Exclusions

- Planned maintenance (notified 7 days in advance)
- Force majeure (natural disasters, war, etc.)
- Third-party service failures
- Customer-side issues (network, misconfiguration)
- Beta features

## SLA Reporting

- Monthly SLA report generated automatically
- Delivered via email to customer admin
- Available in-platform under Settings > SLA

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
