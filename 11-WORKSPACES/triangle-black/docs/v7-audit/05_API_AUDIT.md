# V7 AUDIT — 05 API AUDIT
Date: 2026-08-31
Status: PARTIAL — critical path verified

---

## API SCALE

| Metric | Value | Status |
|--------|-------|--------|
| Route decorators in main.py | 224 | HIGH (architectural debt) |
| Router registrations (include_router) | 131 | FOUND |
| Total registered routers | 131 | FOUND |
| Rogue create_engine() in main.py | 308 | CRITICAL |

## CRITICAL PATH — ALL 24 ENDPOINTS PASS

Verified live on 2026-08-31 (fresh server start):

✅ Health Live           16ms
✅ Health Ready          12ms
✅ Leads list            208ms
✅ Quotes list           20ms
✅ Contracts list        20ms
✅ Work Orders           25ms
✅ Service Requests      20ms
✅ Assets                24ms
✅ PM Plans              57ms
✅ Suppliers             32ms
✅ Purchase Requests     22ms
✅ Purchase Orders       26ms
✅ Executive Engine      31ms
✅ PM Engine             28ms
✅ Data Quality          46ms
✅ AI Directors          20ms
✅ Recommendations       22ms
✅ ROI Report            39ms
✅ Demo Headline         34ms
✅ Twin State            28ms
✅ Critical Path         26ms
✅ Onboarding Status     26ms
✅ Health Metrics        8ms
✅ Health Backup         13ms

SUMMARY: 24/24 PASS ✅ — Commercial critical path is functional

## PERFORMANCE OBSERVATIONS

Leads list: 208ms — highest latency on critical path
PM Plans: 57ms — acceptable
All others: under 60ms

Leads 208ms may be a complex query — investigate in V7-017.

## SECURITY GAPS

Multiple endpoints in main.py without visible auth:
(See 07_SECURITY_AUDIT.md for full list)

Most critical:
- RBAC role assignment (should require admin JWT)
- WO complete (should require technician JWT)
- PM Plans list (returns operational data without auth verification)

## DUPLICATE ENDPOINTS

main.py has pattern of duplicate trailing-slash routes:
  L910: @app.get("/api/v1/stock-balances/")
  L911: @app.get("/api/v1/stock-balances")

This is repeated for multiple endpoints. Creates OpenAPI pollution
and potential routing ambiguity.

