# Tenant Isolation Matrix

| Surface | Tenant input / binding | CustomerDataScope | Runtime status | Result |
|---|---|---|---|---|
| Work orders / assets / PM / procurement active routes | many use `Depends(get_hotel_id)` | no | active subset | PARTIAL |
| Recommendations | `get_hotel_id` in router/service | no | not mounted | FAIL |
| Evidence | `get_hotel_id` | no | not mounted | FAIL |
| Attention / SLA | `get_hotel_id` | no | attention not mounted; SLA grouped failure | FAIL |
| Pilot / baseline | `get_hotel_id` | no | validator says absent | FAIL |
| Imports / onboarding / invitations / adoption | `get_hotel_id` in source routers | no | absent | FAIL |
| Dashboards/reports/export | mixed query/header/query-param patterns | no | partial active surface | NOT VERIFIED |
| Legacy root `main.py` leads | no auth; direct SQLite query | no | alternate runtime candidate | FAIL |

`CustomerDataScope` is defined only in `src/core/customer_scope.py` and referenced only by its tests; `rg` found no production use. It is not mandatory. `get_hotel_id` has a `DEFAULT_HOTEL_ID` fallback and returns a requested `X-Hotel-ID` when no JWT-bound hotel exists. Thus tenant isolation is not proven across the customer surface.
