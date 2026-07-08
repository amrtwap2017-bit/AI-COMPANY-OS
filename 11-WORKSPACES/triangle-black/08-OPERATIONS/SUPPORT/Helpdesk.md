# 05 — Helpdesk

> Helpdesk setup and operations for Triangle Black.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 07-OPERATIONS/Support.md | Support processes |
| Phase 8 | 08-CUSTOMER-SUCCESS/SLA.md | SLA commitments |

## Helpdesk Channels

| Channel | Access | Hours | SLA |
|---------|--------|-------|-----|
| Email: support@triangleblack.com | Any customer | Business hours | 4 hours |
| In-app chat | Logged-in users | Business hours | 15 min |
| Phone: [TBD] | Any customer | Business hours | 5 min |
| Support portal (TBD) | Any customer | 24/7 | — |

## Ticket Lifecycle

```
Submit ──► Triage ──► Assign ──► Investigate ──► Resolve ──► Close ──► Review
  │         │          │           │              │          │         │
Email/   Categorize  Assign     Debug         Fix or     Confirm   Customer
chat     + priority  to tier    + document    answer     with       survey
                                            customer
```

## Ticket Categories

| Category | Description | Priority | Assignee |
|----------|-------------|----------|----------|
| Technical Issue | Bug, error, system unavailable | P1-P3 | DevOps |
| How-To | Usage question, workflow | P3-P4 | Support |
| Account | User management, password | P3 | Support |
| Billing | Invoice, payment, pricing | P3 | Finance |
| Feature Request | New capability suggestion | P4 | Product |
| Complaint | Customer dissatisfaction | P1-P2 | COO |

## Helpdesk Tools

| Tool | Purpose | Status |
|------|---------|--------|
| Email (support@) | Primary ticket intake | ❌ NOT SET UP |
| Slack (#support) | Internal support channel | ❌ NOT SET UP |
| Shared inbox | Ticket tracking (V1) | ❌ NOT SET UP |
| CRM (TBD) | Customer management (V2) | ❌ NOT PLANNED |

## Helpdesk Team

| Role | Responsibility | Coverage |
|------|---------------|----------|
| Support Lead | Triage, Tier 2, escalation | Business hours |
| Support Agent | Tier 1, email/chat handling | Business hours |
| DevOps (on-call) | Technical escalation | 24/7 (emergency) |
| COO (escalation) | Customer escalations | Business hours |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
