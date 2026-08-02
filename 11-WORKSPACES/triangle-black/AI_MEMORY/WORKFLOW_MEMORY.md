# WORKFLOW_MEMORY.md — Triangle Black

12 registered workflows. All in workflow-registry/

## Workflow List

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

## Lead to Contract Flow

New Lead
-> Qualification
-> Site Survey
-> Quotation
-> Client Review
-> Contract Signed
-> Triggers contract-to-project

## Procurement to Payment Flow

Purchase Request
-> PR Approval
-> RFQ to Suppliers
-> Quotation Received
-> PO Created
-> PO Approved
-> Goods Received (GRN)
-> Invoice Matched (3-way)
-> Payment Made

## Workflow Engine

Code: src/commercial/workflow_engine/
Events: src/commercial/procurement_events/
Real-time: src/commercial/sse_notifications/
