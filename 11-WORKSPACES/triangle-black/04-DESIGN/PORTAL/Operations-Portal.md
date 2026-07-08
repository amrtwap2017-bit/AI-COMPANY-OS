# Operations Portal

## Identity

| Field | Value |
|-------|-------|
| URL | app.triangleblack.com |
| Purpose | Internal staff operations: CRM, quotations, projects, admin |
| Tone | Functional, data-dense, efficient |
| Primary Action | Manage pipeline, create quotations, track projects |

## User Roles & Access

| Role | Access | Modules |
|------|--------|---------|
| Admin | Full system | All modules + administration |
| Manager | Operational | CRM, Quotations, Projects (read all, write assigned) |
| Sales Rep | Pipeline | CRM leads/opportunities, Quotations (create own) |
| Engineer | Technical | Projects (assigned), Site survey |
| Procurement (V2) | Supply | Procurement module |
| Viewer | Read-only | Reports, project timelines |

## Navigation

### Top Navigation Bar
```
[Logo]  [Dashboard]  [CRM ▾]  [Quotations ▾]  [Projects ▾]  [Admin ▾]  [🔔]  [👤 Name ▾]
```

### CRM Sub-navigation
```
CRM
├── Leads           — Table view with filters, status, owner
├── Opportunities   — Pipeline Kanban view
├── Companies       — Table view with search
└── Contacts        — Table view linked to companies
```

### Quotations Sub-navigation
```
Quotations
├── RFQs            — RFQ list with status
├── Quotes          — Quotation list with approval status
└── Contracts       — Contract list with expiry tracking
```

### Projects Sub-navigation
```
Projects
├── All Projects    — Project list with health indicators
└── [Project]       — Detail with tabs: Overview, Milestones, Files, Team
```

### Admin Sub-navigation
```
Administration
├── Users           — User management CRUD
├── Roles           — Role & permission editor
├── Companies       — Tenant/company management
├── Settings        — System configuration
└── Audit Log       — Audit trail viewer
```

## Key Pages

### CRM Pages

| Page | URL | Components | Business Rules |
|------|-----|-----------|----------------|
| Lead List | /app/crm/leads | DataTable, FilterBar, SearchBar | BR-CRM-01 (uniqueness), BR-CRM-06 (activity minimum) |
| Lead Detail | /app/crm/leads/:id | LeadForm, ActivityTimeline, StatusBadge | BR-CRM-01, BR-CRM-06 |
| Pipeline | /app/crm/opportunities | KanbanBoard, PipelineCard, FilterBar | BR-CRM-04 (probability), BR-CRM-03 (closure rules) |
| Opp Detail | /app/crm/opportunities/:id | OpportunityForm, StageHistory, ActivityTimeline | BR-CRM-02 (company required), BR-CRM-04 |
| Company List | /app/crm/companies | DataTable, SearchBar | BR-CRM-05 (duplicate flag) |
| Company Detail | /app/crm/companies/:id | CompanyForm, ContactList, OpportunityList | BR-CRM-05 |
| Contact List | /app/crm/contacts | DataTable | — |
| Contact Detail | /app/crm/contacts/:id | ContactForm | — |

### Quotations Pages

| Page | URL | Components | Business Rules |
|------|-----|-----------|----------------|
| RFQ List | /app/quotations/rfqs | DataTable, StatusBadge | — |
| RFQ Detail | /app/quotations/rfqs/:id | RfqForm, ApprovalHistory | — |
| Quotation List | /app/quotations/quotes | DataTable, FilterBar | — |
| Quotation Builder | /app/quotations/quotes/new | QuotationBuilder, LineItemEditor | BR-QTN-01 (numbering), BR-QTN-07 (tax calc) |
| Quotation Detail | /app/quotations/quotes/:id | QuotationPreview, ApprovalPanel | BR-QTN-03 (versioning), BR-QTN-04 (expiry) |
| Quotation Approve | /app/quotations/quotes/:id/approve | ApprovalPanel, CommentBox | BR-QTN-05 (approval thresholds) |
| Contract List | /app/quotations/contracts | DataTable, ExpiryBadge | — |
| Contract Detail | /app/quotations/contracts/:id | ContractView, AmendmentList | BR-QTN-06 (one contract per quote) |

### Projects Pages

| Page | URL | Components | Business Rules |
|------|-----|-----------|----------------|
| Project List | /app/projects | DataTable, StatusBadge, HealthIndicator | — |
| Create Project | /app/projects/new | ProjectForm, MilestoneTemplate | BR-PRJ-01 (contract linkage) |
| Project Detail | /app/projects/:id | ProjectHeader, Tabs (Overview, Milestones, Files, Team) | BR-PRJ-01 |
| Milestones Tab | /app/projects/:id#milestones | MilestoneList, MilestoneForm | BR-PRJ-02 (sequencing), BR-PRJ-03 (approval) |
| Files Tab | /app/projects/:id#files | FileList, FileUploader | BR-PRJ-05 (naming), BR-PRJ-06 (type restrict) |
| Site Survey | /app/projects/:id/survey | SurveyForm, PhotoCapture, Checklist | — |
| Assessment | /app/projects/:id/assessment | AssessmentForm, BoQEditor | — |

## Empty States

| Page | Empty State |
|------|-------------|
| Lead List | "No leads yet. Import leads or wait for website submissions." |
| Pipeline | "No opportunities yet. Convert a lead to get started." |
| Quotation List | "No quotations yet. Create your first quotation from an opportunity." |
| Project List | "No projects yet. Create a project from a signed contract." |
| Admin Users | "No users yet. Create the first admin user." (seed data) |
