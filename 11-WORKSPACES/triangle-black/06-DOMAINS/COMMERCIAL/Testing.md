# 01-COMMERCIAL — Testing

## Unit Tests

| Module | File | Tests |
|--------|------|-------|
| Lead scoring | lead-score.service.spec.ts | Score calculation by source, title, company; edge cases (empty, invalid) |
| Stage progression | opportunity.service.spec.ts | Valid transitions, reject invalid, auto-probability |
| Margin calculation | quotation.service.spec.ts | Line item margin, bulk discount, tax calc |
| State machines | state-machine.spec.ts | Lead, survey, quotation, contract state transitions |
| Duplicate detection | lead.service.spec.ts | Same email, fuzzy name match |

## Integration Tests

| Test | Endpoints | Scenario |
|------|-----------|----------|
| Lead to opportunity | POST leads → GET leads/:id/convert → GET opportunities | Full conversion flow |
| Quotation lifecycle | POST quotations → submit → approve → send → client-approve | Full workflow |
| Contract activation | POST contracts → sign → activate | Verify project created |
| Permission enforcement | All endpoints by role | 403 for unauthorized |

## E2E Tests

| Scenario | Actions |
|----------|---------|
| Sales rep captures lead from web form | Fill form → submit → verify score |
| Pipeline management | Create opportunity → drag stages → verify |
| Quotation generation | Create quotation → add line items → verify margin |
| Contract activation | Approve quotation → verify contract + project created |
