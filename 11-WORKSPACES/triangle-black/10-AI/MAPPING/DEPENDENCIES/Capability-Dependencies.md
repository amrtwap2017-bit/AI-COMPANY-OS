# Capability Dependencies

## Cross-Domain Capability Dependencies

| Capability | Domain | Depends On Capability | Domain | Type |
|-----------|--------|----------------------|--------|------|
| Contract Management | 01 Commercial | Identity & Auth | 00 Shared Kernel | Hard |
| Sales Order Processing | 01 Commercial | Tenant Management | 00 Shared Kernel | Hard |
| Project Creation | 02 Project Delivery | Contract Activation | 01 Commercial | Hard |
| Project Budgeting | 02 Project Delivery | Sales Order Approval | 01 Commercial | Hard |
| PO Creation | 03 Procurement | Contract Activation | 01 Commercial | Hard |
| PO Budget Check | 03 Procurement | Project Budget Allocation | 02 Project Delivery | Hard |
| Supplier Onboarding | 04 Supplier Mgmt | PO History | 03 Procurement | Hard |
| Supplier Evaluation | 04 Supplier Mgmt | Supplier Onboarding | 04 Supplier Mgmt | Hard |
| Stock Receipt | 05 Inventory | PO Confirmation | 03 Procurement | Hard |
| Stock Allocation | 05 Inventory | Project Creation | 02 Project Delivery | Hard |
| Invoice Matching | 06 Financial Ctrl | PO Confirmation | 03 Procurement | Hard |
| Invoice Matching | 06 Financial Ctrl | Stock Receipt | 05 Inventory | Hard |
| Milestone Billing | 06 Financial Ctrl | Milestone Approval | 02 Project Delivery | Hard |
| Work Order Creation | 07 Maintenance | Stock Availability | 05 Inventory | Hard |
| Work Order Creation | 07 Maintenance | Project Milestones | 02 Project Delivery | Hard |
| Document Generation | 08 Document Mgmt | PO Approval | 03 Procurement | Hard |
| Document Generation | 08 Document Mgmt | Project Status | 02 Project Delivery | Soft |
| Contract Repository | 08 Document Mgmt | Supplier Contract | 04 Supplier Mgmt | Soft |
| Financial Dashboard | 09 Exec Intel | Invoice Reconciliation | 06 Financial Ctrl | Hard |
| Project Dashboard | 09 Exec Intel | Project Status Tracking | 02 Project Delivery | Hard |
| Inventory Dashboard | 09 Exec Intel | Stock Valuation | 05 Inventory | Hard |
| AI Assistant - Finance | 10 AI Copilots | Financial Dashboard | 09 Exec Intel | Hard |
| AI Assistant - Documents | 10 AI Copilots | Document Repository | 08 Document Mgmt | Hard |
| Mobile Sales | 12 Mobile | Sales Order Processing | 01 Commercial | Hard |
| Mobile Field Ops | 12 Mobile | Work Order Management | 07 Maintenance | Hard |
| Employee Onboarding | 13 HR | Identity & Auth | 00 Shared Kernel | Soft |
| Payroll Processing | 13 HR | Invoice Matching | 06 Financial Ctrl | Soft |

## Intra-Domain Capability Dependencies

| Domain | Capability | Depends On | Type |
|--------|-----------|-----------|------|
| 01 Commercial | Sales Order Processing | Customer Management | Hard |
| 01 Commercial | Contract Activation | Sales Order Approval | Hard |
| 01 Commercial | Revenue Recognition | Contract Activation | Hard |
| 02 Project Delivery | Project Planning | Project Creation | Hard |
| 02 Project Delivery | Resource Allocation | Project Planning | Hard |
| 02 Project Delivery | Milestone Tracking | Project Planning | Hard |
| 02 Project Delivery | Status Reporting | Milestone Tracking | Hard |
| 03 Procurement | PO Creation | Budget Validation | Hard |
| 03 Procurement | PO Approval Workflow | PO Creation | Hard |
| 03 Procurement | PO Confirmation | PO Approval | Hard |
| 04 Supplier Mgmt | Supplier Evaluation | Supplier Scorecard | Hard |
| 05 Inventory | Stock Receipt | GRN Creation | Hard |
| 05 Inventory | Stock Transfer | Stock Receipt | Hard |
| 05 Inventory | Stock Valuation | Stock Receipt | Hard |
| 06 Financial Ctrl | Invoice Receipt | Invoice Matching | Hard |
| 06 Financial Ctrl | Payment Processing | Invoice Approval | Hard |
| 06 Financial Ctrl | GL Posting | Payment Processing | Hard |
| 07 Maintenance | Work Order Planning | Work Order Creation | Hard |
| 07 Maintenance | Task Assignment | Work Order Planning | Hard |
| 07 Maintenance | Completion Reporting | Task Assignment | Hard |
| 08 Document Mgmt | Document Upload | Document Classification | Hard |
| 08 Document Mgmt | Document Search | Document Indexing | Hard |
| 09 Exec Intel | KPI Definition | KPI Calculation | Hard |
| 09 Exec Intel | Dashboard Rendering | KPI Calculation | Hard |
| 10 AI Copilots | Query Processing | Context Building | Hard |
| 10 AI Copilots | Response Generation | Query Processing | Hard |
| 11 Integrations | API Gateway | Service Registration | Hard |
| 11 Integrations | Event Bus | API Gateway | Hard |
| 12 Mobile | Offline Sync | Data Caching | Hard |
| 12 Mobile | Push Notifications | Event Subscription | Hard |
| 13 HR | Employee Record | Employee Onboarding | Hard |
| 13 HR | Time Tracking | Employee Record | Hard |
