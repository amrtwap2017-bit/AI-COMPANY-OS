# Phase 03 — Physical Database

> Physical database schema design across all domains.

## Schema Overview

| Domain | Tables | Key Entities |
|--------|--------|-------------|
| Shared Platform | 6 | tenant, user, role, permission, audit_log, notification |
| Commercial | 8 | lead, lead_score, opportunity, site_survey, quotation, quotation_line, contract, contract_amendment |
| Project Delivery | 5 | project, milestone, ncr, daily_report, handover_document |
| Procurement | 4 | requisition, purchase_order, po_line, goods_receipt |
| Supplier | 3 | supplier, supplier_rate_card, supplier_evaluation |
| Inventory | 4 | warehouse, stock_item, stock_transfer, stock_adjustment |
| Financial | 6 | invoice, invoice_line, credit_note, revenue_recognition, three_way_match, gl_entry |
| Maintenance | 4 | service_request, warranty_claim, sla_contract, preventive_maintenance_schedule |
| Document | 2 | document, document_folder |
| AI | 1 | agent_decision_log |
| Integration | 3 | webhook, integration_log, dead_letter_queue |
| **Total** | **46** | |

## Schema Design Rules

- All tables have `id` (UUID PK), `tenant_id` (FK), `created_at`, `updated_at`
- All tables have soft delete (`deleted_at`)
- All financial tables have `currency` and `exchange_rate` columns
- All monetary values stored as integers (pennies/cents) — no floats
- JSONB for flexible attributes (max 10 fields per JSONB)
- Composite indexes on `(tenant_id, display_id)`, `(tenant_id, status, created_at)`

## Key Relationships

```
tenant 1:N user
user N:M role (via user_role)
user 1:N lead, opportunity, project (assigned_to)
lead 1:1 opportunity
opportunity N:1 site_survey
opportunity 1:N quotation
quotation 1:1 contract
contract 1:N project
project 1:N milestone
project 1:N ncr
project 1:N procurement_requisition
contract 1:N service_request (warranty)
```

See `10-Database/` for complete schema definitions with all columns, types, and constraints.
