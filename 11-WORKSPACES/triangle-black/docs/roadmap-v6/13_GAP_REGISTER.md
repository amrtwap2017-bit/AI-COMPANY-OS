# Triangle Black — Gap Register V6
*Generated: 2026-08-27 | Updated each sprint*

## P0 — Production Blockers

| ID | Gap | Status | Sprint |
|---|---|---|---|
| G-001 | 32 permanent skips classified | IN PROGRESS | S-001 |
| G-002 | Tenant isolation partial (predictive, technician) | IN PROGRESS | S-001 |
| G-003 | BOLA risk in 5 repositories | IN PROGRESS | S-001 |
| G-004 | Backup restore never verified end-to-end | IN PROGRESS | S-001 |
| G-005 | Security test suite missing | IN PROGRESS | S-001 |

## P1 — Customer Blockers

| ID | Gap | Status | Sprint |
|---|---|---|---|
| G-010 | Data Import 2.0 (upload→validate→map→import) | NOT STARTED | S-004 |
| G-011 | Report Export (PDF operational summary) | NOT STARTED | S-005 |
| G-012 | WO end-to-end workflow certification | NOT STARTED | S-006 |
| G-013 | Tenant management UI /tenants | NOT STARTED | S-007 |
| G-014 | WO Backlog bulk assign/close actions | NOT STARTED | S-007 |
| G-015 | Onboarding: real multi-tenant provisioning | NOT STARTED | S-007 |

## P2 — Quality

| ID | Gap | Status | Sprint |
|---|---|---|---|
| G-020 | main.py 8,900 lines — router extraction | NOT STARTED | S-008 |
| G-021 | @ts-nocheck 294 remaining | IN PROGRESS | S-009 |
| G-022 | Inline styles 1,145 | IN PROGRESS | S-009 |
| G-023 | WCAG 2.2 AA accessibility audit | NOT STARTED | S-010 |
| G-024 | API inventory document | NOT STARTED | S-011 |
| G-025 | Performance benchmarks | NOT STARTED | S-011 |
| G-026 | OpenTelemetry observability | NOT STARTED | S-012 |

## P3 — Future Commercial

| ID | Gap | When |
|---|---|---|
| G-030 | Digital Twin 2.0 (D3.js) | After Wave 3 |
| G-031 | AI Directors evidence chain | After first customer |
| G-032 | Marketing website separation | Wave 6 |
| G-033 | ROI measurement framework | After first customer |
| G-034 | SSO/SCIM | Enterprise prospect |
| G-035 | Multi-region | 5+ customers |

## Skip Classification Register

| Test | Category | Reason | Action |
|---|---|---|---|
| test_admin_portal_foundation | A | Endpoint not in main.py | GENUINE |
| test_analytics_api | A | Endpoint not in main.py | GENUINE |
| test_client_portal_api_complete | A | Endpoint not in main.py | GENUINE |
| test_client_portal_api_layer | A | Endpoint not in main.py | GENUINE |
| test_contract_lifecycle_management | A | Endpoint not in main.py | GENUINE |
| test_maintenance_schedule_module | A | Endpoint not in main.py | GENUINE |
| test_mobile_api_for_field_technicians | A | Endpoint not in main.py | GENUINE |
| test_payment_tracking_module | A | Endpoint not in main.py | GENUINE |
| test_project_management_module | A | Endpoint not in main.py | GENUINE |
| test_quotation_pdf_generator | A | Endpoint not in main.py | GENUINE |
| test_service_request_auto_routi | A | Endpoint not in main.py | GENUINE |
| test_sla_tracking | A | Endpoint not in main.py | GENUINE |
| test_vendor_portal_api | A | Endpoint not in main.py | GENUINE |
| test_performance (5 tests) | B | Requires stable env | ENV_DEPENDENT |
| test_activitys (2 tests) | C | Endpoint 500 | INVESTIGATE |
| test_cacheconfigs (2 tests) | C | Endpoint state | INVESTIGATE |
| test_documents | C | Endpoint state | INVESTIGATE |
| test_entitys (2 tests) | C | Endpoint 500 | INVESTIGATE |
| test_hotels | C | Hotels endpoint | INVESTIGATE |
| test_sprint078 approval | D | Business logic | INVESTIGATE |
| test_sprint245_fk | D | FK dependency | INVESTIGATE |
| test_a054_build_guard | D | Build Guard path | FIX |
| test_work_orders_coverage | D | WO create flow | FIX |
| test_crud WO (2 tests) | D | WO CRUD | FIX |
