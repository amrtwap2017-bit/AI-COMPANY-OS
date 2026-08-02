# DOMAIN_MEMORY.md — Triangle Black

Quick reference for all 15 domains.

## Domain Status

| Domain | Sprint | Code Location | Status |
|--------|--------|--------------|--------|
| Commercial | 001-006 | src/commercial/lead_management, contracts, quotation | 60% |
| Procurement | 010 | src/commercial/purchase_requests, purchase_orders, rfqs | 54% |
| Maintenance | 016 | src/commercial/work_orders, maintenance_enterprise | 48% |
| Projects | 007-009 | src/commercial/projects, projects_enterprise | 40% |
| Inventory | 012 | src/commercial/inventory_items, warehouses | 49% |
| Supplier Mgmt | 011 | src/commercial/suppliers, vendor_scorecards | 44% |
| Financial | 013-015 | src/commercial/invoices, payment_tracking | 29% |
| Executive Intel | 018 | src/commercial/executive_intelligence | 48% |
| Digital Twin | Phase 6 | src/commercial/digital_twin | 16% |
| Document Mgmt | 017 | src/commercial/documents | 31% |
| AI Copilots | Phase 5 | src/commercial/ai_assistant | 30% |
| HR | 019-020 | NOT IMPLEMENTED | 0% |
| Integrations | Future | src/commercial/webhook_notifications | 23% |
| Mobile | Future | src/mobile_api_for_field_technicians | 11% |
| Shared Kernel | 021 | src/commercial/auth, pagination, cache | 67% |

## Key Business Rules Per Domain

### Commercial
- Lead lifecycle: New > Qualified > Survey > Quoted > Won/Lost
- Contract requires signed quotation
- Client portal: projects, invoices, approvals

### Procurement
- PR requires budget approval
- PO requires approved PR
- Three-way match: PO + GRN + Invoice before payment

### Maintenance
- Work orders: Reactive (breakdown) and Preventive (scheduled)
- Predictive alerts come from AI signals module

### Projects
- Must link to signed contract
- Milestone billing triggers invoice
- Change orders need client approval

### Inventory
- Stock quantity never goes negative
- Reorder point triggers purchase request automatically
- Multi-warehouse per tenant

### Financial
- AR: hotel client invoices (outbound)
- AP: supplier invoices (inbound)
- GL: NOT YET IMPLEMENTED (Sprint-015)

## Full Domain Specs
06-DOMAINS/{DOMAIN}/
