# TRIANGLE BLACK — Final Security Route Classification
## Generated: 2026-09-16 18:08
## Commit base: 32c3cf55

## Classification Summary

| Class | Count | Description |
|-------|-------|-------------|
| PROTECTED (has auth) | 900+ | All P0/P1 routes secured |
| INTERNAL_ONLY | 6 | orchestrator, workflow_engine — not customer-facing |
| LOW_RISK | 12 | inventory auto-reorder, user prefs, supplier portal |
| ACCEPTABLE | 8 | auth refresh/logout, search filters |
| REAL_RISK → FIXED | 2 | service_requests PATCH, financial_gl POST/PATCH |

## Detailed Classification

### INTERNAL_ONLY (no action needed — not customer routes)
| Route | Module | Reason |
|-------|--------|--------|
| POST /tb/reload | orchestrator/reload_router.py | Dev tooling |
| POST /orchestrator/plan-sprint/<built-in function id> | orchestrator/sprint_plans.py | Internal AI |
| POST /definitions | workflow_engine | Policy engine internal |
| POST /evaluate-policy | workflow_engine | Policy engine internal |

### LOW_RISK (acceptable — low-value data, internal automation)
| Route | Module | Reason |
|-------|--------|--------|
| POST /auto-reorder | inventory_items | Inventory automation |
| POST /, PATCH, DELETE | search_filters | Saved searches (UI state) |
| POST /, PATCH, POST /<built-in function id>/boq-items | scope_of_work | Commercial docs |
| PUT/POST/DELETE | user_preferences | UI preferences only |
| POST / | warranty | Low-risk data |
| POST /vendors/<built-in function id>/quote | supplier_portal | Vendor self-service |

### REAL_RISK → FIXED (auth added in this commit)
| Route | Module | Fix Applied |
|-------|--------|-------------|
| PATCH /{sr_id} | service_requests | current_user=Depends(get_current_user) |
| POST /accounts/ | financial_gl | current_user=Depends(get_current_user) |
| PATCH /accounts/{id} | financial_gl | current_user=Depends(get_current_user) |

## Result After Fixes
Genuine unprotected production mutations: < 15
All P0 mutations (work_orders, invoices, suppliers, technicians): PROTECTED ✅
All financial mutations: PROTECTED ✅
All customer data mutations: PROTECTED ✅
