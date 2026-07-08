# Business Capability Matrix

| Field | Value |
|---|---|
| Document ID | ROOT-CORNERSTONE-01 |
| Document Purpose | Map every business capability to owner, KPIs, portals, APIs, entities, and future AI |
| Version | 1.0 |
| Status | Review |
| Dependencies | 01-Executive/Business-Capabilities.md, 02-Business/Business-Model.md |

---

## Usage

This matrix is the traceability backbone of the entire platform. Every feature, API endpoint, database table, and screen must trace back to a capability in this matrix.

---

## Matrix

### Business Development

#### Marketing
| Field | Value |
|---|---|
| Business Owner | Marketing Lead |
| KPI | Leads generated, Cost per lead, Website conversion rate |
| Inputs | Content, SEO strategy, Partnership agreements |
| Outputs | Qualified leads, Brand awareness |
| Systems | Public Website, CRM |
| Actors | Marketing team, Potential clients |
| Risks | Low lead quality, High cost per acquisition |
| AI Opportunities | Lead scoring, Content generation, SEO optimization, Chatbot qualification |
| Portal Module | Public Website |
| API Module | crm (leads) |
| DB Tables | leads, companies |
| UI | Website landing pages, Contact forms |

#### CRM (Lead Management)
| Field | Value |
|---|---|
| Business Owner | Sales Director |
| KPI | Lead-to-opportunity conversion rate, Time to first contact |
| Inputs | Marketing leads, Inbound inquiries, Referrals |
| Outputs | Qualified opportunities, Lead scoring |
| Systems | Operations Portal |
| Actors | Sales team |
| Risks | Data entry inconsistency, Lead leakage |
| AI Opportunities | Lead scoring, Sentiment analysis, Follow-up automation |
| Portal Module | Operations Portal — CRM |
| API Module | crm |
| DB Tables | leads, lead_statuses, lead_activities |
| UI | Leads list, Lead detail, Kanban view |

#### Opportunities
| Field | Value |
|---|---|
| Business Owner | Sales Director |
| KPI | Win rate, Average deal size, Sales cycle length |
| Inputs | Qualified leads, Site survey results, Engineering assessments |
| Outputs | Won/lost opportunities, Proposal requests |
| Systems | Operations Portal |
| Actors | Sales team, Engineers |
| Risks | Inaccurate forecasting, Deal slippage |
| AI Opportunities | Deal scoring, Next-best-action recommendations, Churn prediction |
| Portal Module | Operations Portal — CRM |
| API Module | crm |
| DB Tables | opportunities, opportunity_stages, opportunity_activities |
| UI | Pipeline view, Opportunity detail, Stage transition |

#### Quotations
| Field | Value |
|---|---|
| Business Owner | Sales Director |
| KPI | Quote-to-close ratio, Average response time, Quote accuracy |
| Inputs | Opportunity data, Supplier pricing, Engineering BOQ |
| Outputs | Approved quotations, Contracts |
| Systems | Operations Portal |
| Actors | Sales team, Engineers, Procurement |
| Risks | Pricing errors, Margin erosion |
| AI Opportunities | Price optimization, BOQ auto-generation, Supplier price comparison |
| Portal Module | Operations Portal — Quotations |
| API Module | quotations |
| DB Tables | quotations, quotation_line_items, quotation_statuses |
| UI | Quote builder, Approval workflow, PDF generation |

#### Contracts
| Field | Value |
|---|---|
| Business Owner | Legal / Sales Director |
| KPI | Contract cycle time, Renewal rate, Contract value |
| Inputs | Approved quotations, Client details, Terms |
| Outputs | Signed contracts, SLAs |
| Systems | Operations Portal, Document Management |
| Actors | Sales, Legal, Client |
| Risks | Missing terms, Expiry gaps |
| AI Opportunities | Contract clause analysis, Renewal prediction, Risk flagging |
| Portal Module | Operations Portal, Client Portal |
| API Module | contracts |
| DB Tables | contracts, contract_terms, contract_amendments |
| UI | Contract view, Approval workflow, Client acceptance |

### Engineering Delivery

#### Site Survey
| Field | Value |
|---|---|
| Business Owner | Engineering Director |
| KPI | Surveys per week, Report turnaround time, Findings accuracy |
| Inputs | Opportunity, Client request |
| Outputs | Survey report, Engineering assessment scope |
| Systems | Operations Portal (mobile) |
| Actors | Field engineers |
| Risks | Incomplete data, Access issues |
| AI Opportunities | Image recognition for defect detection, Report auto-generation |
| Portal Module | Operations Portal |
| API Module | projects |
| DB Tables | project_milestones (survey as milestone type) |
| UI | Checklist forms, Photo capture, Report preview |

#### Procurement
| Field | Value |
|---|---|
| Business Owner | Procurement Manager |
| KPI | Supplier response time, Savings %, PO cycle time, Inventory accuracy |
| Inputs | Requisition, Approved budget, Supplier quotes |
| Outputs | Purchase orders, Goods receipts, Supplier evaluations |
| Systems | Operations Portal |
| Actors | Procurement, Suppliers, Storekeeper |
| Risks | Delayed delivery, Quality issues, Budget overrun |
| AI Opportunities | Supplier recommendation, Price prediction, PO auto-generation, Three-way match automation |
| Portal Module | Operations Portal — Procurement |
| API Module | procurement |
| DB Tables | purchase_orders, requisitions, goods_receipts, rfqs, supplier_quotes |
| UI | PO creation, Approval workflow, Receipt confirmation |

#### Supply Chain & Logistics
| Field | Value |
|---|---|
| Business Owner | Operations Manager |
| KPI | On-time delivery rate, Order accuracy, Logistics cost |
| Inputs | Purchase orders, Delivery schedules |
| Outputs | Delivered materials, Delivery confirmations |
| Systems | Operations Portal |
| Actors | Logistics team, Suppliers, Storekeeper |
| Risks | Customs delays, Damaged goods |
| AI Opportunities | Route optimization, Delivery prediction, Inventory optimization |
| Portal Module | Operations Portal |
| API Module | procurement |
| DB Tables | deliveries, inventory |
| UI | Delivery tracking, Inventory view |

#### Project Execution
| Field | Value |
|---|---|
| Business Owner | Engineering Director |
| KPI | Project completion rate, Milestone achievement, Budget variance |
| Inputs | Contracts, Engineering designs, Materials, Labor |
| Outputs | Completed projects, Handover documentation |
| Systems | Operations Portal |
| Actors | Project managers, Engineers, Contractors, Clients |
| Risks | Scope creep, Delay, Cost overrun |
| AI Opportunities | Progress prediction, Resource optimization, Delay alerts |
| Portal Module | Operations Portal, Client Portal |
| API Module | projects |
| DB Tables | projects, project_milestones, project_deliverables, project_files |
| UI | Project dashboard, Gantt chart, Milestone tracking |

#### QA/QC
| Field | Value |
|---|---|
| Business Owner | Quality Manager |
| KPI | Pass rate, Rework %, Inspection coverage |
| Inputs | Completed work, Standards, Specifications |
| Outputs | Inspection reports, Quality certificates |
| Systems | Operations Portal |
| Actors | QA/QC inspectors |
| Risks | Missed defects, Standards non-compliance |
| AI Opportunities | Automated defect detection using image analysis, Compliance checking |
| Portal Module | Operations Portal |
| API Module | projects |
| DB Tables | inspection_records, quality_checklists |
| UI | Checklist forms, Inspection reports |

#### Handover
| Field | Value |
|---|---|
| Business Owner | Engineering Director |
| KPI | Handover completeness score, Punch list items, Client satisfaction |
| Inputs | Completed project, QA/QC reports, O&M manuals |
| Outputs | Handover certificate, Client sign-off |
| Systems | Operations Portal, Document Management |
| Actors | Project manager, Client |
| Risks | Incomplete documentation, Client objections |
| AI Opportunities | Handover document auto-generation, Punch list auto-detection |
| Portal Module | Client Portal |
| API Module | projects, documents |
| DB Tables | project_handovers, documents |
| UI | Handover checklist, Document repository |

### Client Success

#### Client Portal
| Field | Value |
|---|---|
| Business Owner | Client Success Director |
| KPI | Portal adoption rate, Client satisfaction score, Support ticket resolution time |
| Inputs | Project data, Quotations, Invoices, Reports |
| Outputs | Client visibility, Trust, Self-service |
| Systems | Client Portal |
| Actors | Hotel GM, Chief Engineer, Procurement, Finance |
| Risks | Low adoption, Data accuracy |
| AI Opportunities | Chatbot support, Personalized recommendations, Report auto-generation |
| Portal Module | Client Portal |
| API Module | client-portal |
| DB Tables | client_portal_messages, notifications |
| UI | Dashboard, Project view, Documents, Messages |

#### Support & Renewals
| Field | Value |
|---|---|
| Business Owner | Client Success Director |
| KPI | Response time, Resolution time, Renewal rate, NPS |
| Inputs | Support requests, Contract data |
| Outputs | Resolved issues, Renewed contracts |
| Systems | Operations Portal |
| Actors | Support team, Operations |
| Risks | Low satisfaction, Churn |
| AI Opportunities | Ticket classification, Auto-response, Churn prediction |
| Portal Module | Client Portal |
| API Module | notifications, contracts |
| DB Tables | notifications, contracts |
| UI | Support ticket view, Contract management |

### Internal Operations

#### Finance
| Field | Value |
|---|---|
| Business Owner | Financial Controller |
| KPI | DSO, Margin accuracy, Budget variance, Cash flow |
| Inputs | Approved invoices, Payment receipts, Budget data |
| Outputs | Paid invoices, Financial reports, Tax filings |
| Systems | Finance module (future) |
| Actors | Finance team |
| Risks | Cash flow gaps, Invoicing errors |
| AI Opportunities | Invoice matching, Anomaly detection, Cash flow forecasting |
| Portal Module | Operations Portal (admin) |
| API Module | future |
| DB Tables | invoices, payments, budget_lines |
| UI | Invoice list, Payment tracking, Budget view |

#### Administration
| Field | Value |
|---|---|
| Business Owner | CTO / Admin |
| KPI | User adoption, Permission compliance, Audit coverage |
| Inputs | User data, Role definitions |
| Outputs | Configured system, Audit logs |
| Systems | Operations Portal (admin) |
| Actors | System administrators |
| Risks | Security breaches, Permission errors |
| AI Opportunities | Anomaly detection in user behavior, Automated provisioning |
| Portal Module | Operations Portal — Admin |
| API Module | administration |
| DB Tables | users, roles, permissions, user_roles, audit_logs |
| UI | User management, Role editor, Audit log viewer |

### Executive Intelligence

#### Executive Dashboard
| Field | Value |
|---|---|
| Business Owner | CEO / COO |
| KPI | N/A (consumes KPIs) |
| Inputs | All operational data |
| Outputs | Decisions, Insights |
| Systems | Executive Dashboard |
| Actors | CEO, COO, Department heads |
| Risks | Data quality, Misleading metrics |
| AI Opportunities | Narrative report generation, Anomaly detection, Forecasting, What-if analysis |
| Portal Module | Executive Dashboard |
| API Module | dashboard |
| DB Tables | (aggregated views, materialized views) |
| UI | KPI cards, Trend charts, Risk indicators |

---

## Traceability Map

```
Business Capability
    ↓
Operational Workflow (06-Operations/)
    ↓
Portal Module (08-UX/)
    ↓
API Endpoint (13-API/)
    ↓
Database Tables (10-Database/)
    ↓
Infrastructure (14-Infrastructure/)
```

Every feature, API, DB table, and screen must trace to a capability in this matrix. Features that cannot be traced to a capability do not belong in the platform.
