# Business Capability Map

A detailed map of business capabilities organized by bounded context and subdomain type.

## Capability Overview

| Capability | Bounded Context | Subdomain Type | Description |
|-----------|----------------|---------------|-------------|
| Lead Management | CRM | Core | Capture, qualify, and track sales leads |
| Contact Management | CRM | Core | Manage client contacts and accounts |
| Opportunity Management | CRM | Core | Track sales opportunities through pipeline stages |
| Activity Management | CRM | Core | Log calls, meetings, emails, and follow-ups |
| Campaign Management | Marketing | Supporting | Create and manage marketing campaigns |
| Segment Management | Marketing | Supporting | Define and manage target audience segments |
| Lead Scoring | Marketing | Supporting | Score leads based on engagement and fit |
| Pricing | Quotation | Core | Define pricing models and rate cards |
| Estimation | Quotation | Core | Calculate cost estimates for scope of work |
| Quotation Generation | Quotation | Core | Generate and deliver quotations to clients |
| Margin Analysis | Quotation | Core | Calculate and analyze profit margins |
| Contract Drafting | Contract | Core | Create and version contract documents |
| Contract Negotiation | Contract | Core | Manage negotiation workflow and redlines |
| Contract Approval | Contract | Core | Route contracts through approval workflow |
| Contract Execution | Contract | Core | Manage signing, sealing, and execution |
| Contract Lifecycle | Contract | Core | Track renewals, amendments, and terminations |
| Project Planning | Project | Core | Define project scope, schedule, and budget |
| Resource Management | Project | Core | Assign and track resources across projects |
| Project Execution | Project | Core | Manage day-to-day project activities |
| Change Management | Project | Core | Process change orders and scope changes |
| Issue & Risk Management | Project | Core | Log and track issues and risks |
| Progress Tracking | Project | Core | Monitor project progress against plan |
| Financial Tracking | Project | Core | Track project costs, revenue, and profitability |
| Procurement Requisition | Procurement | Supporting | Create and approve material/service requests |
| Vendor Management | Procurement | Supporting | Register, evaluate, and manage vendors |
| RFQ Management | Procurement | Supporting | Create, send, and evaluate RFQs |
| Purchase Order Management | Procurement | Supporting | Create, approve, and track purchase orders |
| Goods Receipt | Procurement | Supporting | Receive and inspect delivered goods |
| Vendor Payment | Procurement | Supporting | Process vendor invoices and payments |
| Storage Management | Inventory | Supporting | Track warehouse and site inventory levels |
| Stock Movement | Inventory | Supporting | Manage stock transfers and adjustments |
| Reorder Management | Inventory | Supporting | Trigger reorder when stock reaches threshold |
| Logistics Planning | Supply | Supporting | Plan transportation and delivery schedules |
| Delivery Tracking | Supply | Supporting | Track deliveries from supplier to site |
| Document Storage | Document | Generic | Store and organize documents in a central repository |
| Document Versioning | Document | Generic | Manage document revisions and history |
| Document Access Control | Document | Generic | Manage permissions on documents |
| Document Templates | Document | Generic | Maintain standard document templates |
| Client Portal Access | ClientPortal | Supporting | Authenticate and authorize client users |
| Project Dashboard | ClientPortal | Supporting | Display project status and progress to clients |
| Document Sharing | ClientPortal | Supporting | Share documents with clients |
| Client Communication | ClientPortal | Supporting | Enable client messages and notifications |
| KPI Dashboard | Dashboard | Generic | Display operational KPIs and metrics |
| Report Generation | Dashboard | Generic | Generate and schedule reports |
| Alert Configuration | Dashboard | Generic | Configure threshold-based alerts |
| Notification Dispatch | Notification | Generic | Send notifications via email, SMS, in-app |
| Notification Preferences | Notification | Generic | Manage user notification preferences |
| User Management | Administration | Supporting | Create and manage system users |
| Role & Permission Management | Administration | Supporting | Define roles and assign permissions |
| Audit Logging | Administration | Supporting | Record system activity for compliance |
| System Configuration | Administration | Supporting | Manage system settings and parameters |

## Capability Heat Map

| Capability | Current Maturity | Target Maturity | Strategic Importance |
|-----------|-----------------|----------------|---------------------|
| Lead Management | Manual | Automated | High |
| Opportunity Management | Manual | Automated | High |
| Estimation | Spreadsheet-based | Automated | Critical |
| Quotation Generation | Manual | Automated | Critical |
| Contract Lifecycle | Manual | Semi-automated | Critical |
| Project Execution | Manual | Automated | Critical |
| Procurement Requisition | Manual | Automated | High |
| Vendor Management | Spreadsheet-based | Automated | High |
| Inventory Management | Manual | Automated | Medium |
| Document Management | Shared drives | Centralized | High |
| Client Portal | None | Self-service | High |
| Dashboard & Reporting | Manual | Automated | Medium |

## Capability Dependencies

```
Lead Management → Opportunity Management → Estimation → Quotation Generation → Contract Drafting → Project Planning → Project Execution → Handover → Maintenance
                      ↑                      ↑                ↑                      ↑
                Campaign Management     Pricing       Contract Templates      Procurement
                      ↑                                                         ↑
                Segment Management                                          Vendor Management
                      ↑                                                         ↑
                Lead Scoring                                              Purchase Order Management
                                                                                    ↑
                                                                              Goods Receipt
```
