# Triangle Black — Security Rules

## Auth Requirements
  Every endpoint: Depends(get_current_user)
  Every data endpoint: Depends(get_hotel_id)
  get_hotel_id returns DEFAULT_HOTEL_ID if no JWT (does NOT raise 401)
  get_current_user DOES raise 401 — always use both

## Tenant Isolation
  All DB queries must filter by hotel_id
  Never query without hotel_id filter on multi-tenant tables
  Always verify: response.hotel_id.startswith("tb-")

## Input Validation
  Use ge=1 on limit parameters (prevents negative LIMIT SQL)
  Pydantic validators on all request models
  Never trust user-provided hotel_id

## Known Fixes Applied
  workflow/instances: was 401-free → now requires JWT
  assets/router.py: limit ge=1 added
  feature_flags.py: SessionLocal import fixed
  actions.py background task: status + created_at added

## Security Test Suite: 24 tests in test_security_tenant_isolation.py
