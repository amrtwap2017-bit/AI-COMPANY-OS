# 06 Financial Control Deliverable Mapping

## Backend Deliverables

| Module | Files | Endpoints | Entities | Estimated Effort |
|--------|-------|-----------|----------|-----------------|
| Invoice Receipt | 5 | 4 | 2 | 4 days |
| Invoice Matching | 6 | 4 | 3 | 6 days |
| Payment Processing | 5 | 4 | 2 | 4 days |
| GL Posting | 5 | 3 | 2 | 4 days |
| Financial Reports | 4 | 3 | 2 | 3 days |
| Revenue Recognition | 4 | 3 | 2 | 4 days |

## Frontend Deliverables

| Page | Route | Components | Estimated Effort |
|------|-------|-----------|-----------------|
| Invoice List | /finance/invoices | 3 | 2 days |
| Invoice Detail | /finance/invoices/:id | 4 | 2 days |
| Invoice Matching | /finance/matching | 5 | 3 days |
| Payment Run | /finance/payments | 4 | 2 days |
| GL Explorer | /finance/gl | 4 | 2 days |
| Financial Reports | /finance/reports | 3 | 1 day |

## Test Deliverables

| Test Type | Count | Coverage Target |
|-----------|-------|-----------------|
| Unit | 100 | 80% |
| Integration | 40 | 70% |
| E2E | 10 | Key paths |

## Document Deliverables

| Document | Source | Format |
|----------|--------|--------|
| API Docs | OpenAPI spec | YAML |
| 3-Way Matching Process | Process docs | Markdown |
| Revenue Recognition Policy | Business docs | Markdown |

## Total Estimate

- **Backend:** 29 files, 25 days
- **Frontend:** 23 files, 12 days
- **Tests:** 150 files, 6 days
- **Docs:** 4 files, 2 days
- **Total:** 206 files, 45 days
