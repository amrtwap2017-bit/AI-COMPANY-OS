# 05 — SLA Management

> SLA management and reporting for support operations.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 08-CUSTOMER-SUCCESS/SLA.md | SLA commitments |
| Phase 9 | Helpdesk.md | Helpdesk operations |

## SLA Targets

| Metric | Standard Tier | Premium Tier | Measurement |
|--------|--------------|--------------|-------------|
| First response (SEV-1) | 15 min | 15 min | From ticket creation |
| First response (SEV-2) | 1 hour | 30 min | From ticket creation |
| First response (SEV-3) | 4 hours | 2 hours | From ticket creation |
| First response (SEV-4) | 24 hours | 12 hours | From ticket creation |
| Resolution (SEV-1) | 4 hours | 2 hours | From ticket creation |
| Resolution (SEV-2) | 24 hours | 12 hours | From ticket creation |
| Resolution (SEV-3) | 5 business days | 3 business days | From ticket creation |
| Uptime (monthly) | 99.5% | 99.9% | Monitoring |

## SLA Monitoring

| Check | Tool | Frequency | Alert |
|-------|------|-----------|-------|
| First response time | Ticket system | Per ticket | Breach warning at 80% |
| Resolution time | Ticket system | Per ticket | Breach warning at 80% |
| Uptime | Uptime monitor | Continuous | Downtime alert |
| SLA compliance % | Monthly report | Monthly | Below target |

## SLA Breach Process

1. SLA breach detected (automated or manual)
2. Incident flagged in ticket system
3. Root cause identified
4. SLA credit calculated (per contract)
5. Credit applied to next invoice
6. Preventive action documented

## SLA Credits

| Breach | Credit |
|--------|--------|
| Response time breach (SEV-1) | 5% monthly credit |
| Resolution time breach (SEV-1) | 10% monthly credit |
| Response time breach (SEV-2) | 2% monthly credit |
| Uptime < 99.5% | 5% monthly credit per 0.5% below |
| Uptime < 95.0% | 25% monthly credit |
| Maximum cumulative credit | 50% of monthly fee |

## SLA Reporting

| Report | Frequency | Audience |
|--------|-----------|----------|
| SLA compliance summary | Monthly | Customer (automated) |
| Incident response times | Monthly | Customer (automated) |
| Uptime report | Monthly | Customer (automated) |
| Internal SLA review | Monthly | Support team |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
