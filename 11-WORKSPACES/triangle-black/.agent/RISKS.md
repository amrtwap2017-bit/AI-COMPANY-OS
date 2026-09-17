# TRIANGLE BLACK — Risk Register
## Updated: 2026-09-16 19:00

## RISK-001: No production environment
Severity: CRITICAL
Impact: Cannot deploy, no customer access
Mitigation: Owner must provision VM + domain
Status: OPEN

## RISK-002: Evidence test contamination
Severity: MEDIUM
Impact: L3 records appear during test runs
Mitigation: Teardown added in 0fb231b5
Status: MITIGATED ✅

## RISK-003: 9 unprotected routes remain
Severity: LOW
Impact: Internal/import routes without auth
Mitigation: Classified as internal/low-risk
Status: DOCUMENTED

## RISK-004: Mobile/offline not implemented
Severity: MEDIUM (Category B)
Impact: Field engineers cannot work offline
Mitigation: Defer until pilot feedback confirms need
Status: ACCEPTED RISK

## RISK-005: 281 TypeScript errors
Severity: LOW
Impact: Hidden quality debt
Mitigation: No new errors policy, progressive fix
Status: CONTROLLED DEBT
