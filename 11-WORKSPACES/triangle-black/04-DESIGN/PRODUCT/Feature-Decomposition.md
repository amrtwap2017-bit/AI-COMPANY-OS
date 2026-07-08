# Feature Decomposition

## Feature Specification Format

Each feature in this decomposition follows:
- **ID:** Unique feature identifier
- **Name:** Feature name
- **Module:** Parent module
- **Business Capability:** Traceable capability
- **Inputs:** Data/triggers required
- **Outputs:** Results produced
- **Business Rules:** Key rules enforced
- **Actors:** Who performs the action
- **V1 Priority:** P0 (launch gate), P1 (first client gate), P2 (growth)

---

## V1 Features

### Module: Marketing Site

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| WEB-001 | Company Profile Display | P0 | Content files | Rendered pages | Visitor |
| WEB-002 | Services Catalog | P0 | Service definitions | Services page | Visitor |
| WEB-003 | Contact Form | P0 | Form submission | Lead created in CRM | Prospect |
| WEB-004 | Case Studies | P1 | Case study content | Case study pages | Visitor |
| WEB-005 | Blog | P2 | Markdown posts | Blog listing + detail | Visitor |
| WEB-006 | SEO Metadata | P0 | Page metadata | Search ranking | Crawler |
| WEB-007 | Spam Protection | P0 | Form submission | Filtered submissions | Prospect |
| WEB-008 | Responsive Design | P0 | Breakpoint tokens | Mobile/tablet/desktop layout | Visitor |

### Module: CRM

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| CRM-001 | Create Lead | P0 | Name, contact, source, notes | Lead record | Sales, Website |
| CRM-002 | Convert Lead to Opportunity | P0 | Lead, Company data | Opportunity created | Sales |
| CRM-003 | Pipeline View | P0 | Opportunity data | Stage-based pipeline | Sales, Manager |
| CRM-004 | Manage Companies | P0 | Company details | Company record | Sales |
| CRM-005 | Manage Contacts | P0 | Contact details | Contact record | Sales |
| CRM-006 | Log Activities | P0 | Activity details | Activity on entity | Sales |
| CRM-007 | Search CRM | P0 | Search query | Results across entities | Sales |
| CRM-008 | Duplicate Detection | P1 | New/updated record | Duplicate flag | System |
| CRM-009 | Export | P1 | Entity data | CSV file | Sales, Manager |

### Module: Quotations

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| QTN-001 | Manage RFQs | P0 | Line items, specs, delivery date | RFQ record | Sales, Engineer |
| QTN-002 | Create Quotation | P0 | RFQ, pricing, line items | Quotation | Sales |
| QTN-003 | Line-Item Pricing | P0 | Items, qty, unit price, discount | Calculated totals | Sales |
| QTN-004 | Approval Workflow | P0 | Quotation, thresholds | Approved/Rejected | Manager, Director |
| QTN-005 | PDF Generation | P0 | Quotation data | PDF document | System |
| QTN-006 | Revision History | P0 | Quotation changes | Versioned history | Sales |
| QTN-007 | Generate Contract | P0 | Approved quotation | Contract | System, Sales |
| QTN-008 | Send Quotation | P0 | Quotation, client email | Sent notification | Sales |
| QTN-009 | Currency Support | P1 | Currency selection | EGP/USD pricing | Sales |

### Module: Projects

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| PRJ-001 | Create Project | P0 | Contract, name, dates, budget | Project record | PM |
| PRJ-002 | Milestone Tracking | P0 | Milestones, dates, assignee | Milestone progress | PM, Engineer |
| PRJ-003 | Deliverable Upload | P0 | File, description, category | Uploaded file | Team |
| PRJ-004 | File Repository | P0 | All project files | Organized file list | Team, Client |
| PRJ-005 | Project Timeline | P1 | Milestone dates | Visual timeline | PM, Client |
| PRJ-006 | Completion % | P0 | Milestone status | Calculated % | System |
| PRJ-007 | Site Survey | P0 | Survey data, photos, findings | Survey report | Field Engineer |
| PRJ-008 | Engineering Assessment | P0 | Survey data, technical analysis | Assessment report | Engineer |
| PRJ-009 | Activity Log | P1 | Changes, comments | Chronological log | Team |

### Module: Client Portal

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| POR-001 | Client Authentication | P0 | Email, password / magic link | Authenticated session | Client |
| POR-002 | Dashboard | P0 | Aggregated client data | Dashboard view | Client |
| POR-003 | Project Visibility | P0 | Project data (client-scoped) | Project list + detail | Client |
| POR-004 | Quotation Review | P0 | Quotation data | Quotation detail + PDF | Client |
| POR-005 | Quotation Approval | P0 | Approve/reject action | Status change | Client Admin |
| POR-006 | Document Access | P0 | Document list | File viewer/download | Client |
| POR-007 | Service Request | P0 | Request form | Submitted request | Client |
| POR-008 | Multi-tenant Isolation | P0 | Tenant context | Client sees own data only | System |
| POR-009 | Notification Preferences | P1 | User settings | Configured alerts | Client |
| POR-010 | Password Reset | P0 | Email | Reset email | Client |

### Module: Executive Dashboard

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| DSH-001 | Pipeline Summary | P0 | Opportunity aggregates | Pipeline widget | Executive |
| DSH-002 | Revenue Tracking | P0 | Quotation/contract aggregates | Revenue chart | Executive |
| DSH-003 | Project Health | P0 | Project status data | Health indicators | Executive |
| DSH-004 | Upcoming Milestones | P0 | Milestone data | Milestone calendar | Executive |
| DSH-005 | Client KPIs | P1 | Per-client metrics | Client widgets | Executive |
| DSH-006 | Date Range Filtering | P1 | Date selection | Filtered data | Executive |
| DSH-007 | Interactive Charts | P1 | Chart data | Hover/drill-down | Executive |

### Module: Administration

| ID | Feature | Priority | Inputs | Outputs | Actors |
|----|---------|----------|--------|---------|--------|
| ADM-001 | User CRUD | P0 | User details | User account | Admin |
| ADM-002 | Role Management | P0 | Role, permissions | Role definition | Admin |
| ADM-003 | Company/Tenant Config | P0 | Company details | Tenant setup | Admin |
| ADM-004 | System Settings | P0 | Configuration values | System config | Admin |
| ADM-005 | Audit Log Viewer | P0 | Filter criteria | Audit log entries | Admin |
| ADM-006 | Password Policy | P0 | Policy rules | Enforced passwords | System |
| ADM-007 | Deactivate User | P0 | User selection | Disabled account | Admin |

---

## V1 Feature Summary

| Module | P0 Features | P1 Features | P2 Features | Total |
|--------|-------------|-------------|-------------|-------|
| Marketing Site | 5 | 1 | 1 | 7 |
| CRM | 5 | 2 | 0 | 7 |
| Quotations | 8 | 1 | 0 | 9 |
| Projects | 5 | 2 | 0 | 7 |
| Client Portal | 8 | 1 | 0 | 9 |
| Executive Dashboard | 4 | 3 | 0 | 7 |
| Administration | 6 | 0 | 0 | 6 |
| **Total V1** | **41** | **10** | **1** | **52** |
