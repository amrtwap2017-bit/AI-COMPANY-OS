# 99-RELEASE — Testing

## Testing Types

| Type | Scope | Tool |
|------|-------|------|
| Unit Tests | Individual services | Vitest / Jest |
| Integration Tests | API endpoints, DB interactions | Supertest + test DB |
| E2E Tests | Critical business workflows | Playwright / Cypress |
| UAT | Business scenarios | Manual + documented |
| Performance | API response times, DB query perf | k6 / autocannon |
| Security | Auth, RBAC, data isolation | OWASP ZAP / manual |

## UAT Scenarios (per domain)

| Domain | Key UAT Scenarios |
|--------|-------------------|
| 01-COMMERCIAL | Lead → Opportunity → Survey → Quotation → Contract |
| 02-PROJECT-DELIVERY | Project create → milestones → daily reports → NCR → handover |
| 03-PROCUREMENT | Requisition → PO → goods receipt |
| 05-INVENTORY | Stock in → issue → transfer → adjust |
| 06-FINANCIAL-CONTROL | Invoice → payment → revenue recognition |
