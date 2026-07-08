# 06-FINANCIAL-CONTROL — Testing

## Unit Tests
- Invoice creation: VAT auto-calc, line item totals
- 3-way match: PO vs GR vs Invoice match logic
- Revenue recognition: cash vs accrual handling
- GL double-entry: debit = credit enforcement

## Integration Tests
- Milestone approved → invoice created → sent → paid → revenue recognized
- PO → goods receipt → supplier invoice → 3-way match → payment
- Invoice overdue escalation workflow

## E2E
- Full AR cycle: create invoice → send → record payment → verify GL
- Full AP cycle: enter supplier invoice → match → approve → schedule → pay
