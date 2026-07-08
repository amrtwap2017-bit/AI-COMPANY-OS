# End-to-End Client Lifecycle

| Field | Value |
|---|---|
| Document ID | ROOT-CORNERSTONE-02 |
| Document Purpose | Document the complete client lifecycle from marketing through renewal with every interaction |
| Version | 1.0 |
| Status | Review |
| Dependencies | 06-Operations/Lead-to-Contract.md, 02-Business/Go-To-Market.md |

---

## Lifecycle Overview

```
Marketing → Lead → Survey → Assessment → Proposal → Quotation →
Contract → Procurement → Supply → Execution → Invoice →
Collection → Maintenance → Renewal
```

Each step links to: Portal, Database, API, Roles, Notifications, Reports.

---

## Stage 1: Marketing

### Description
Generate awareness and interest through content, SEO, partnerships, and industry presence.

### Activities
- Content marketing (articles, case studies, technical guides)
- SEO optimization for hospitality engineering keywords
- Hotel industry event presence
- Partnership referrals (architects, consultants)
- Direct outreach to hotel GMs and Chief Engineers

### Portal
Public Website

### Database Tables
leads (source = marketing, status = new)

### API
POST /v1/leads (from website form)

### Roles
Marketing team

### Notifications
Email to sales team on new lead

### Reports
Lead source analysis, Marketing ROI, Cost per lead

### AI Opportunity
Lead scoring, Chatbot qualification, Content personalization

---

## Stage 2: Lead Qualification

### Description
Incoming leads are qualified based on hotel type, location, budget, and need urgency.

### Activities
- Lead contacted within 4 hours
- Qualification call to assess need
- Lead scored (hot/warm/cold)
- Lead converted to opportunity or archived

### Portal
Operations Portal — CRM

### Database Tables
leads, lead_statuses, lead_activities

### API
PATCH /v1/leads/{id}, POST /v1/opportunities

### Roles
Sales team

### Notifications
Reminder if lead not contacted within SLA

### Reports
Lead conversion rate, Response time

### AI Opportunity
Lead scoring, Next best action, Follow-up scheduling

---

## Stage 3: Site Survey

### Description
Engineers visit the hotel to assess the physical scope of work.

### Activities
- Schedule site visit with hotel engineering team
- Physical inspection of systems (HVAC, electrical, plumbing, fire, kitchen, laundry, pools)
- Photographs and measurements
- Identified defects, risks, and recommendations
- Survey report generated

### Portal
Operations Portal — mobile

### Database Tables
project_milestones (survey milestone), documents (survey report)

### API
POST /v1/projects/{id}/milestones, POST /v1/documents

### Roles
Field engineer, Hotel chief engineer

### Notifications
Survey completed notification to sales and operations

### Reports
Survey report (PDF), Defect list

### AI Opportunity
Image recognition for defect identification, Report auto-generation, Recommendation engine

---

## Stage 4: Engineering Assessment

### Description
Engineers analyze survey findings and design the technical solution.

### Activities
- Review survey data
- Design engineering solution
- Create Bill of Quantities (BOQ)
- Estimate materials, labor, and timeline
- Identify risks and mitigations

### Portal
Operations Portal

### Database Tables
opportunities (technical assessment fields), documents (assessment report)

### API
PATCH /v1/opportunities/{id}

### Roles
Engineering team

### Notifications
Assessment ready for proposal

### Reports
Engineering assessment report, BOQ

### AI Opportunity
BOQ auto-generation from survey data, Material suggestion, Cost estimation

---

## Stage 5: Proposal

### Description
Create a professional proposal document for the client.

### Activities
- Compile assessment findings
- Define scope of work
- Outline approach and methodology
- Include timeline and milestones
- Present pricing options
- Risk and assumptions section

### Portal
Operations Portal — Quotations

### Database Tables
quotations, quotation_line_items

### API
POST /v1/quotations

### Roles
Sales, Engineering

### Notifications
Proposal sent to client

### Reports
Proposal PDF, Pricing breakdown

### AI Opportunity
Proposal template auto-fill, Price benchmarking, Competitive analysis

---

## Stage 6: Quotation & Negotiation

### Description
Provide detailed pricing and negotiate terms with the client.

### Activities
- Detailed quotation with line-item pricing
- Negotiation on scope, price, and terms
- Revision cycles
- Final pricing approval

### Portal
Operations Portal — Quotations, Client Portal

### Database Tables
quotations, quotation_line_items, quotation_statuses

### API
PATCH /v1/quotations/{id}, GET /v1/quotations/{id} (client-facing)

### Roles
Sales, Finance, Client procurement

### Notifications
Quotation sent, Quotation viewed, Revision requested

### Reports
Quotation summary, Margin analysis

### AI Opportunity
Price optimization recommendation, Historical pricing comparison, Negotiation support

---

## Stage 7: Contract

### Description
Formalize the agreement with a signed contract.

### Activities
- Generate contract from approved quotation
- Define terms, payment schedule, SLA, warranty
- Client review and signing
- Counter-signing and filing

### Portal
Operations Portal, Client Portal

### Database Tables
contracts, contract_terms, contract_amendments

### API
POST /v1/contracts

### Roles
Sales, Legal, Client signatory

### Notifications
Contract sent for signature, Contract signed, Contract expiry warning

### Reports
Contract register, Active contracts, Expiring contracts

### AI Opportunity
Contract clause analysis, Risk flagging, Renewal prediction

---

## Stage 8: Procurement

### Description
Source and purchase materials, equipment, and subcontractor services.

### Activities
- Create purchase requisitions based on BOQ
- RFQ to qualified suppliers
- Evaluate and select suppliers
- Issue purchase orders
- Track delivery

### Portal
Operations Portal — Procurement

### Database Tables
requisitions, rfqs, supplier_quotes, purchase_orders, goods_receipts

### API
POST /v1/purchase-orders, GET /v1/suppliers

### Roles
Procurement manager, Storekeeper, Approver

### Notifications
Requisition approval needed, PO issued, Delivery expected, Delivery received

### Reports
Procurement pipeline, Spend analysis, Supplier performance, Budget utilization

### AI Opportunity
Supplier recommendation, Price prediction, PO auto-generation, Three-way match automation

---

## Stage 9: Supply & Logistics

### Description
Manage delivery of materials to site.

### Activities
- Coordinate delivery schedule
- Receive and inspect goods
- Update inventory
- Handle discrepancies and damages

### Portal
Operations Portal, Mobile

### Database Tables
deliveries, inventory

### API
POST /v1/deliveries, PATCH /v1/inventory

### Roles
Logistics, Storekeeper, Supplier

### Notifications
Delivery scheduled, Delivery arrived, Stock level alert

### Reports
Delivery status, Inventory levels, Stock movement

### AI Opportunity
Delivery prediction, Route optimization, Inventory optimization

---

## Stage 10: Execution

### Description
Perform the engineering work on site.

### Activities
- Mobilize labor and materials
- Execute per engineering design
- Daily progress tracking
- Milestone completion
- Quality checks

### Portal
Operations Portal, Mobile

### Database Tables
projects, project_milestones, project_deliverables

### API
PATCH /v1/projects/{id}/milestones, POST /v1/deliverables

### Roles
Project manager, Engineers, Contractors

### Notifications
Milestone completed, Daily progress report, Quality issue flagged

### Reports
Daily progress report, Milestone tracker, Budget vs actual

### AI Opportunity
Progress prediction, Delay detection, Resource optimization

---

## Stage 11: QA/QC & Handover

### Description
Inspect completed work and hand over to the client.

### Activities
- Final inspection against specifications
- Punch list creation and resolution
- O&M manuals compilation
- Client walkthrough
- Sign-off and handover certificate

### Portal
Operations Portal, Client Portal

### Database Tables
inspection_records, project_handovers, documents

### API
POST /v1/inspections, POST /v1/handovers

### Roles
QA/QC inspector, Project manager, Client

### Notifications
Inspection scheduled, Punch list items, Handover ready

### Reports
Inspection report, Punch list, Handover certificate

### AI Opportunity
Automated defect detection, Documentation auto-generation

---

## Stage 12: Invoicing & Collection

### Description
Invoice the client and collect payment.

### Activities
- Generate invoice per contract terms
- Send invoice to client
- Track payment receipt
- Follow up on overdue payments
- Reconcile payments

### Portal
Operations Portal, Client Portal

### Database Tables
invoices, payments

### API
POST /v1/invoices, PATCH /v1/payments

### Roles
Finance, Client finance

### Notifications
Invoice sent, Payment received, Overdue alert

### Reports
Accounts receivable, Cash flow forecast, Aging report

### AI Opportunity
Invoice auto-generation, Payment prediction, Anomaly detection

---

## Stage 13: Maintenance

### Description
Ongoing maintenance and support after handover.

### Activities
- Preventive maintenance scheduling
- Corrective maintenance on request
- Spare parts management
- Performance monitoring
- Periodic reporting

### Portal
Operations Portal, Client Portal

### Database Tables
maintenance_schedules, work_orders

### API
POST /v1/work-orders, GET /v1/maintenance-schedules

### Roles
Engineering team, Client

### Notifications
Maintenance due, Work order assigned, SLA breach warning

### Reports
Maintenance completion rate, Asset health, SLA compliance

### AI Opportunity
Predictive maintenance, Work order auto-assignment, Spare parts forecasting

---

## Stage 14: Renewal

### Description
Renew and expand the partnership.

### Activities
- Contract renewal discussion (90 days before expiry)
- Performance review with client
- Scope expansion opportunities
- New contract terms
- Renewal signing

### Portal
Operations Portal, Client Portal

### Database Tables
contracts, opportunities (renewal)

### API
PATCH /v1/contracts/{id}

### Roles
Client success, Sales, Client

### Notifications
Contract expiring, Renewal proposal ready

### Reports
Client health score, Contract value history, Satisfaction trends

### AI Opportunity
Renewal likelihood prediction, Upsell recommendation, Churn early warning

---

## Traceability Summary

| Stage | Portal | Primary DB Tables | Primary API Module | Key Actors |
|---|---|---|---|---|
| Marketing | Public Website | leads | crm | Marketing |
| Lead | CRM | leads, lead_statuses | crm | Sales |
| Survey | Operations (mobile) | project_milestones | projects | Field engineers |
| Assessment | Operations | opportunities | crm | Engineering |
| Proposal | Operations | quotations | quotations | Sales, Engineering |
| Quotation | Operations + Client Portal | quotations, quotation_line_items | quotations | Sales, Finance |
| Contract | Operations + Client Portal | contracts, contract_terms | contracts | Sales, Legal |
| Procurement | Operations | purchase_orders, requisitions | procurement | Procurement |
| Supply | Operations | deliveries, inventory | procurement | Logistics |
| Execution | Operations | projects, project_milestones | projects | Project managers |
| Handover | Operations + Client Portal | project_handovers, documents | projects, documents | PM, Client |
| Invoice | Operations + Client Portal | invoices, payments | (future) | Finance |
| Maintenance | Operations + Client Portal | maintenance_schedules, work_orders | (future) | Engineering |
| Renewal | Operations + Client Portal | contracts | contracts | Client success |
