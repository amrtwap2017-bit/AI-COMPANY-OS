# Commercial Reality
## A-001 Audit — August 2026

### Commercial Modules Present
| Module | Endpoints | Status |
|--------|-----------|--------|
| baseline_report | /baseline/report, /risk, /insights | ✅ NEW — Live |
| onboarding | /onboarding/provision-property | ✅ Live |
| pilot_config | /pilot/status | ✅ Exists |
| billing | /billing/checkout-session | ✅ Foundation |
| feedback | /feedback/ | ✅ Exists |
| plans | /plans/matrix | ✅ Exists |
| sso_scim | /sso/config, /scim/v2/Users | ✅ Sandbox |

### Revenue Loop Status
11/12 endpoints working. PM Plans 404 = broken.

### Onboarding Flow — VERIFIED THIS SESSION
1. POST /onboarding/provision-property → ✅ creates hotel+site+user
2. POST /auth/login/json with new credentials → ✅ JWT with hotel_id
3. GET /baseline/report → ✅ scoped to new tenant
4. GET /work-orders/ → ✅ empty (isolated from default tenant)

### Tenant Isolation — VERIFIED
New tenant's JWT contains correct hotel_id.
New tenant sees ONLY their own data.

### What Is Missing For Commercial Readiness
1. PM Plans endpoint 404 — breaks operations loop
2. Customer self-service onboarding not polished
3. ROI measurement per customer not built
4. Time-to-Value not measured
5. Pricing not customer-validated
6. First paying customer: ZERO

### Pricing Framework (In Code)
- Foundation: Operational management
- Intelligence: Analytics + recommendations  
- Enterprise: Multi-property + integrations

### North Star
🏆 FIRST PAYING CUSTOMER
One engineering company + one property + 30-day pilot + ROI report
