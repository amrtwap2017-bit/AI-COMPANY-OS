# TRIANGLE BLACK — Review Routes Analysis
## Generated: 2026-09-16 05:47

## Summary
67 routes flagged as REVIEW from route matrix scan.
Analysis below classifies each by actual risk level.

## Classification Key
| Class | Meaning |
|-------|---------|
| INTERNAL_ONLY | Not customer-facing, internal tooling |
| INTERNAL_AI_PIPELINE | AI processing pipeline, internal only |
| ACCEPTABLE | Standard auth patterns (refresh/logout) |
| NEEDS_AUTH_VERIFICATION | Production data — requires deeper audit |
| LOW_RISK | User preferences, read status — low value data |
| EXEMPT_DEMO | Demo/showcase routes |

## Module Analysis

| Module | Routes | Classification | Action |
|--------|--------|----------------|--------|
| ai_assistant | 5 | INTERNAL_AI_PIPELINE | No customer access |
| ai_mentor | 2 | INTERNAL_AI_PIPELINE | No customer access |
| ai_scheduling | 1 | INTERNAL_AI_PIPELINE | No customer access |
| auth (refresh/logout) | 2 | ACCEPTABLE | Standard pattern |
| work_orders (PATCH/complete/close) | 5 | NEEDS_VERIFICATION | Priority audit |
| technicians | 2 | NEEDS_VERIFICATION | Priority audit |
| suppliers | 2 | NEEDS_VERIFICATION | Priority audit |
| employees | 2 | NEEDS_VERIFICATION | Priority audit |
| employee_timesheets | 4 | NEEDS_VERIFICATION | Priority audit |
| scope_of_work | 4 | NEEDS_VERIFICATION | Priority audit |
| invoices (payment) | 1 | NEEDS_VERIFICATION | High value data |
| notification_delivery | 2 | LOW_RISK | Read status only |
| notification_engine | 1 | LOW_RISK | Read status only |
| user_preferences | 3 | LOW_RISK | User settings |
| feedback | 2 | LOW_RISK | NPS/feedback data |
| audit_log (record) | 1 | NEEDS_VERIFICATION | Audit trail |
| showcase | 1 | EXEMPT_DEMO | Demo only |
| orchestrator | 2 | INTERNAL_ONLY | Internal tooling |
| [others] | ~33 | MIXED | See detailed scan |

## Priority Action Items (Before Production)

### P0 — Verify before any customer data:
- work_orders: PATCH, /complete, /close, /transition
- invoices: /payment
- suppliers: POST, PATCH
- technicians: POST, PATCH

### P1 — Verify before scale:
- employees, employee_timesheets
- scope_of_work
- audit_log /record

### Acceptable (no action needed):
- auth refresh/logout (standard pattern)
- notification read status
- user preferences
- AI pipeline routes (internal only)
- orchestrator (internal tooling)
- showcase/demo (no production data)