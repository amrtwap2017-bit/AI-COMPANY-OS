# 07 — Integration Marketplace

> Integration marketplace for third-party connections.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Marketplace.md | Marketplace platform |
| Phase 10 — Public-API.md | API capabilities |

## Integration Types

| Type | Description | Examples |
|------|-------------|----------|
| Inbound | Data into Triangle Black | PMS import, CSV upload |
| Outbound | Data from Triangle Black | Analytics export, reporting |
| Bidirectional | Two-way sync | Channel manager, accounting |
| Webhook | Event-driven | Booking confirmation, invoice paid |

## H1 Integration Candidates

| Integration | Type | Partner | Complexity | Priority |
|-------------|------|---------|------------|----------|
| Fawry (payment) | Inbound | Fawry | Medium | P1 |
| Paymob (payment) | Inbound | Paymob | Medium | P1 |
| WhatsApp (notification) | Outbound | Meta API | Low | P1 |
| Twilio (SMS) | Outbound | Twilio | Low | P1 |
| Odoo (accounting) | Bidirectional | Odoo | High | P2 |
| SiteMinder (channel) | Bidirectional | SiteMinder | High | P2 |

## Integration Architecture

```
Third-Party API ──► Integration Adapter ──► Triangle Black API
     │                      │                       │
  External              Transform,              Internal
  provider              map, handle             data model
  format                errors
```

## Integration Certification

| Criterion | Standard | Verification |
|-----------|----------|--------------|
| API call success | 100% of test calls | Automated test |
| Error handling | All errors handled gracefully | Test with error injection |
| Data mapping | All fields mapped correctly | Data comparison |
| Rate limiting | Respects provider limits | Load test |
| Security | No credential leakage | Security review |
