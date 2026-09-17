# TRIANGLE BLACK — Gate 07: Final Route Classification
## Generated: 2026-09-17 03:26
## Commit: 277a6897

## CLASSIFICATION SUMMARY
| Classification | Count | Routes |
|----------------|-------|--------|
| FIX (add auth) | 5 | asset_api, eta_invoicing, inventory_alerts, service_request_actions |
| EXEMPT (internal/dev) | 2 | orchestrator reload + sprint planner |
| VERIFY (already fixed) | 1 | financial_gl (fixed in 2582ff0c) |

## DETAILED CLASSIFICATION

| Route | Module | Customer-Facing | Risk | Classification | Decision |
|-------|--------|-----------------|------|----------------|----------|
| POST /import-csv-row | asset_api | Import tool | MEDIUM | **FIX** | Add auth |
| POST /submit | eta_invoicing | Financial/ETA | HIGH | **FIX** | Add auth |
| POST /accounts/ | financial_gl | Financial | HIGH | VERIFY | Fixed in 2582ff0c |
| PATCH /accounts/{id} | financial_gl | Financial | HIGH | VERIFY | Fixed in 2582ff0c |
| POST /alerts/ | inventory_alerts | Operations | MEDIUM | **FIX** | Add auth |
| POST /alerts/{id}/acknowledge/ | inventory_alerts | Operations | MEDIUM | **FIX** | Add auth |
| POST /{sr_id}/generate-work-order | service_request_actions | Operations | HIGH | **FIX** | Add auth |
| POST /tb/reload | orchestrator | Dev-only | HIGH | **EXEMPT** | Dev tool, not in prod |
| POST /plan-sprint/{id} | orchestrator | Internal AI | LOW | **EXEMPT** | Internal AI only |

## FIX REQUIRED BEFORE PRODUCTION
The following must have auth added before V14.5.1 GO:
1. asset_api /import-csv-row
2. eta_invoicing /submit
3. inventory_alerts /alerts/ and acknowledge
4. service_request_actions /generate-work-order

## EXEMPT ROUTES (formally documented)
The following are intentionally unprotected:
- POST /tb/reload — development hot-reload (not mounted in production docker-compose)
- POST /orchestrator/plan-sprint — internal AI workspace (internal prefix)

## PRODUCTION VERIFICATION
Before V14.5.1 GO, verify /tb/reload is NOT accessible at production URL.
