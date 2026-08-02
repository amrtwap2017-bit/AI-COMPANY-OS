# KNOWLEDGE_MAP.md — Triangle Black

## 1. Domain Map

| Domain | Code | Docs | Status |
|--------|------|------|--------|
| Commercial | src/commercial/lead_management contracts quotation | 06-DOMAINS/COMMERCIAL/ | 60% |
| Procurement | src/commercial/purchase_requests purchase_orders rfqs | 06-DOMAINS/PROCUREMENT/ | 54% |
| Maintenance | src/commercial/work_orders maintenance_enterprise | 06-DOMAINS/MAINTENANCE/ | 48% |
| Projects | src/commercial/projects projects_enterprise | 06-DOMAINS/PROJECT-DELIVERY/ | 40% |
| Inventory | src/commercial/inventory_items warehouses | 06-DOMAINS/INVENTORY/ | 49% |
| Supplier Mgmt | src/commercial/suppliers vendor_scorecards | 06-DOMAINS/SUPPLIER-MANAGEMENT/ | 44% |
| Financial | src/commercial/invoices payment_tracking | 06-DOMAINS/FINANCIAL-CONTROL/ | 29% |
| Executive Intel | src/commercial/executive_intelligence | 06-DOMAINS/EXECUTIVE-INTELLIGENCE/ | 48% |
| Digital Twin | src/commercial/digital_twin | docs/enterprise-blueprint-v4/09 | 16% |
| Document Mgmt | src/commercial/documents | 06-DOMAINS/DOCUMENT-MANAGEMENT/ | 31% |
| AI Copilots | src/commercial/ai_assistant ai_signals | 06-DOMAINS/AI-COPILOTS/ | 30% |
| HR | NOT IMPLEMENTED | 06-DOMAINS/HUMAN-RESOURCES/ | 0% |
| Integrations | src/commercial/webhook_notifications | 06-DOMAINS/INTEGRATIONS/ | 23% |
| Mobile | src/mobile_api_for_field_technicians | 06-DOMAINS/MOBILE/ | 11% |
| Shared Kernel | src/commercial/auth pagination cache | 06-DOMAINS/SHARED-KERNEL/ | 67% |

## 2. Domain Events

| Event | Publisher | Trigger |
|-------|-----------|---------|
| LeadCreated | Commercial | New lead added |
| ContractSigned | Commercial | Contract executed |
| PurchaseRequestCreated | Procurement | PR submitted |
| PurchaseOrderApproved | Procurement | PO approved |
| GoodsReceived | Procurement | GRN created |
| WorkOrderCreated | Maintenance | WO raised |
| WorkOrderCompleted | Maintenance | WO closed |
| StockLevelLow | Inventory | Below reorder point |
| ProjectCompleted | Projects | Project closed |
| InvoiceCreated | Financial | Invoice raised |
| PaymentReceived | Financial | Payment recorded |

## 3. Workflow Catalog

| Workflow | Domain | Location |
|----------|--------|----------|
| lead-to-contract | Commercial | workflow-registry/lead-to-contract/ |
| contract-to-project | Projects | workflow-registry/contract-to-project/ |
| procurement-to-payment | Procurement | workflow-registry/procurement-to-payment/ |
| service-to-resolution | Maintenance | workflow-registry/service-to-resolution/ |
| inspection | Projects | workflow-registry/inspection/ |
| inventory-control | Inventory | workflow-registry/inventory-control/ |
| approval | Shared | workflow-registry/approval/ |
| renewal | Commercial | workflow-registry/renewal/ |
| warranty | Maintenance | workflow-registry/warranty/ |
| incident-management | Maintenance | workflow-registry/incident-management/ |
| project-execution | Projects | workflow-registry/project-execution/ |
| ai-review | AI | workflow-registry/ai-review/ |

## 4. Portal Map

| Portal | Location | Users |
|--------|----------|-------|
| Main Operations | portal/app/(app)/ | Engineering staff |
| Client Portal | portal/app/client-portal/ | Hotel management |
| Supplier Portal | portal/app/supplier-portal/ | Vendors |
| Admin | admin-portal/ | System admins |

## 5. AI Module Map

| Module | Location | Status |
|--------|----------|--------|
| Knowledge Graph | src/commercial/knowledge_graph/ | Live |
| Digital Twin | src/commercial/digital_twin/ | Partial |
| Predictive Maintenance | src/commercial/predictive_maintenance/ | Live |
| AI Assistant | src/commercial/ai_assistant/ | Live |
| AI Signals | src/commercial/ai_signals/ | Live |
| Procurement Intelligence | src/commercial/procurement_intelligence/ | Live |
| Executive Intelligence | src/commercial/executive_intelligence/ | Live |
| RAG ChromaDB | agent/.chromadb/ | Live |

## 6. Dependency Map

Commercial needs Shared Kernel
Procurement needs Shared Kernel and Inventory
Projects needs Commercial and Procurement
Maintenance needs Inventory and Supplier Mgmt
Financial needs Commercial and Procurement and Projects
Executive Intel needs all domains
Digital Twin needs Maintenance and Inventory
AI Copilots needs all domains
