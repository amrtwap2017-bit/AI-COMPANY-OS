# 06 — Business Metrics

> Business-level metrics for monitoring platform performance.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 0 | Revenue-Architecture.md | Revenue metrics |
| Phase 6 | Executive-Intelligence.md | Business intelligence |

## Business Metrics Dashboard

| Metric | Definition | Target | Frequency | Source |
|--------|-----------|--------|-----------|--------|
| Monthly Recurring Revenue (MRR) | Sum of monthly subscriptions | Growing | Monthly | Billing DB |
| Average Revenue Per Customer (ARPC) | MRR / active customers | Increasing | Monthly | Billing DB |
| Customer Acquisition Cost (CAC) | Sales cost / new customers | < $50 | Quarterly | Finance |
| Lifetime Value (LTV) | ARPC × avg months retained | > 12× CAC | Quarterly | Finance |
| Active Hotels | Hotels using platform daily | Growing | Daily | Activity logs |
| Active Users | Users logged in per day | Growing | Daily | Auth logs |
| Reservations/Day | Reservations created per day | Growing | Daily | Reservations DB |
| Customer Churn Rate | Customers lost / total | < 5% | Monthly | Customer DB |

## Business Health Indicators

### Green (Healthy)
- MRR growth month-over-month
- Active hotels increasing
- Users logging in daily
- Reservations being created

### Yellow (Warning)
- MRR flat for 2 months
- Active hotels not growing
- User adoption < 50%
- Reservations declining

### Red (At Risk)
- MRR declining
- Customer churn > 5%
- No new customers in 30 days
- Reservations dropped 50%+

## Reporting Schedule

| Report | Frequency | Audience | Format |
|--------|-----------|----------|--------|
| Weekly Business Review | Weekly | CTO + COO | Summary |
| Monthly Business Report | Monthly | Executive Committee | Full report |
| Quarterly Business Review | Quarterly | All stakeholders | Presentation |

## Business Metrics Sources

| Metric | Source | Query |
|--------|--------|-------|
| MRR | PostgreSQL (invoices table) | `SELECT SUM(amount) FROM invoices WHERE status = 'paid' AND period = 'monthly'` |
| Active Hotels | PostgreSQL (hotels table) | `SELECT COUNT(*) FROM hotels WHERE active = true` |
| Active Users | Auth logs | `SELECT COUNT(DISTINCT user_id) FROM auth_logs WHERE date = CURRENT_DATE` |
| Reservations | PostgreSQL (reservations) | `SELECT COUNT(*) FROM reservations WHERE created_at >= CURRENT_DATE` |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT CONFIGURED
