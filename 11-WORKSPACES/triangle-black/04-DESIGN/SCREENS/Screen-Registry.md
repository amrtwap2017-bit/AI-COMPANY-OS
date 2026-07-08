# Screen Registry

## Screen Record Format

| Field | Description | Example |
|-------|-------------|---------|
| ID | Unique screen identifier | SCR-CRM-001 |
| Name | Screen name | Lead List |
| URL | Route path | /app/crm/leads |
| Portal | Portal name | Operations Portal |
| Module | Module name | CRM |
| Feature | Feature ID | CRM-001 |
| Auth | Auth required | Yes (Internal) |
| Roles | Allowed roles | ADMIN, MANAGER, SALES_REP |
| Components | UI components used | DataTable, FilterBar, SearchBar, StatusBadge |
| States | Screen states | Loading, Empty, Error, Data |
| API Endpoints | Data APIs consumed | GET /v1/leads |
| DB Tables | Data sources | leads, lead_statuses |
| Business Rules | Rules enforced | BR-CRM-01, BR-CRM-06 |

---

## Public Website

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-WEB-001 | Home | / | P0 | Hero, ServiceCards, CTASection, PartnerLogos | — |
| SCR-WEB-002 | Services | /services | P0 | ServiceList, ServiceCard | — |
| SCR-WEB-003 | Service Detail | /services/:slug | P1 | ServiceDetail, RelatedServices | — |
| SCR-WEB-004 | About | /about | P0 | CompanyStory, TeamGrid, Timeline | — |
| SCR-WEB-005 | Case Studies | /case-studies | P1 | CaseStudyGrid, FilterBar | — |
| SCR-WEB-006 | Case Study Detail | /case-studies/:slug | P1 | CaseStudyDetail, ResultsMetrics | — |
| SCR-WEB-007 | Blog | /blog | P2 | BlogGrid, Pagination, CategoryFilter | GET /v1/blog/posts |
| SCR-WEB-008 | Blog Post | /blog/:slug | P2 | BlogPost, ShareButtons, AuthorCard | GET /v1/blog/posts/:id |
| SCR-WEB-009 | Contact | /contact | P0 | ContactForm, reCAPTCHA, CompanyInfo | POST /v1/leads |
| SCR-WEB-010 | Thank You | /thank-you | P0 | SuccessMessage, NextSteps, CTA | — |
| SCR-WEB-011 | Privacy | /privacy | P0 | PolicyContent, TableOfContents | — |
| SCR-WEB-012 | Terms | /terms | P0 | TermsContent | — |

---

## Operations Portal — CRM

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-CRM-001 | Lead List | /app/crm/leads | P0 | DataTable, FilterBar, SearchBar, StatusBadge, NewButton | GET /v1/leads |
| SCR-CRM-002 | Lead Detail | /app/crm/leads/:id | P0 | LeadForm, ActivityTimeline, StatusBadge, ConvertButton | GET /v1/leads/:id, PATCH /v1/leads/:id |
| SCR-CRM-003 | Lead Create | /app/crm/leads/new | P0 | LeadForm, DuplicateWarning | POST /v1/leads |
| SCR-CRM-004 | Opportunity Pipeline | /app/crm/opportunities | P0 | KanbanBoard, PipelineCard, FilterBar, TotalValue | GET /v1/opportunities |
| SCR-CRM-005 | Opportunity Detail | /app/crm/opportunities/:id | P0 | OpportunityForm, StageHistory, ActivityTimeline, ConvertToQuote | GET /v1/opportunities/:id, PATCH /v1/opportunities/:id |
| SCR-CRM-006 | Opportunity Create | /app/crm/opportunities/new | P0 | OpportunityForm, CompanyLookup, ContactLookup | POST /v1/opportunities |
| SCR-CRM-007 | Company List | /app/crm/companies | P0 | DataTable, SearchBar, DuplicateAlert | GET /v1/companies |
| SCR-CRM-008 | Company Detail | /app/crm/companies/:id | P0 | CompanyForm, ContactList, OpportunityList, ActivityTimeline | GET /v1/companies/:id, PATCH /v1/companies/:id |
| SCR-CRM-009 | Company Create | /app/crm/companies/new | P0 | CompanyForm, DuplicateCheck | POST /v1/companies |
| SCR-CRM-010 | Contact List | /app/crm/contacts | P0 | DataTable, FilterBar | GET /v1/contacts |
| SCR-CRM-011 | Contact Detail | /app/crm/contacts/:id | P0 | ContactForm, ActivityTimeline | GET /v1/contacts/:id, PATCH /v1/contacts/:id |
| SCR-CRM-012 | Contact Create | /app/crm/contacts/new | P0 | ContactForm, CompanyLookup | POST /v1/contacts |

---

## Operations Portal — Quotations

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-QTN-001 | RFQ List | /app/quotations/rfqs | P0 | DataTable, StatusBadge, FilterBar | GET /v1/rfqs |
| SCR-QTN-002 | RFQ Detail | /app/quotations/rfqs/:id | P0 | RfqForm, LineItemTable, ApprovalHistory | GET /v1/rfqs/:id, PATCH /v1/rfqs/:id |
| SCR-QTN-003 | RFQ Create | /app/quotations/rfqs/new | P0 | RfqForm, LineItemEditor | POST /v1/rfqs |
| SCR-QTN-004 | Quotation List | /app/quotations/quotes | P0 | DataTable, StatusBadge, FilterBar | GET /v1/quotations |
| SCR-QTN-005 | Quotation Builder | /app/quotations/quotes/new | P0 | QuotationBuilder, LineItemEditor, PricingSummary, PDFPreview | POST /v1/quotations |
| SCR-QTN-006 | Quotation Detail | /app/quotations/quotes/:id | P0 | QuotationPreview, ApprovalPanel, RevisionHistory, DownloadPDF | GET /v1/quotations/:id, PATCH /v1/quotations/:id |
| SCR-QTN-007 | Quotation Approve | /app/quotations/quotes/:id/approve | P0 | ApprovalPanel, CommentBox, QuotationSummary | PATCH /v1/quotations/:id/approve |
| SCR-QTN-008 | Contract List | /app/quotations/contracts | P0 | DataTable, ExpiryBadge, StatusBadge | GET /v1/contracts |
| SCR-QTN-009 | Contract Detail | /app/quotations/contracts/:id | P0 | ContractView, AmendmentList, PaymentSchedule | GET /v1/contracts/:id |
| SCR-QTN-010 | Contract Create | /app/quotations/contracts/new | P0 | ContractForm, QuotationLookup, ClauseSelector | POST /v1/contracts |
| SCR-QTN-011 | Contract Sign | /app/quotations/contracts/:id/sign | P1 | SignatureCapture, TermsReview | PATCH /v1/contracts/:id/sign |
| SCR-QTN-012 | Quotation Revision | /app/quotations/quotes/:id/revision | P0 | RevisionForm, DiffView | POST /v1/quotations/:id/revisions |

---

## Operations Portal — Projects

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-PRJ-001 | Project List | /app/projects | P0 | DataTable, StatusBadge, HealthIndicator, FilterBar | GET /v1/projects |
| SCR-PRJ-002 | Project Create | /app/projects/new | P0 | ProjectForm, ContractLookup, MilestoneTemplate | POST /v1/projects |
| SCR-PRJ-003 | Project Overview | /app/projects/:id | P0 | ProjectHeader, KPICards, MilestoneList, RecentFiles | GET /v1/projects/:id |
| SCR-PRJ-004 | Project Milestones | /app/projects/:id/milestones | P0 | MilestoneList, MilestoneForm, Timeline, ProgressBar | GET /v1/projects/:id/milestones, PATCH /v1/milestones/:mid |
| SCR-PRJ-005 | Project Files | /app/projects/:id/files | P0 | FileUploader, FileList, CategoryFilter | GET /v1/projects/:id/files, POST /v1/documents |
| SCR-PRJ-006 | Site Survey | /app/projects/:id/survey | P0 | SurveyForm, ChecklistGroup, PhotoCapture, ReportPreview | POST /v1/surveys |
| SCR-PRJ-007 | Engineering Assessment | /app/projects/:id/assessment | P0 | AssessmentForm, BoQEditor, TechnicalSpecList | POST /v1/assessments |
| SCR-PRJ-008 | Project Timeline View | /app/projects/:id/timeline | P1 | Timeline, MilestoneMarkers, GanttView | GET /v1/projects/:id/timeline |

---

## Client Portal

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-CPT-001 | Portal Login | /portal/login | P0 | LoginForm, MagicLinkOption, PasswordReset | POST /v1/auth/login |
| SCR-CPT-002 | Portal Dashboard | /portal | P0 | KpiCards, ActiveProjects, PendingQuotes, ActivityFeed, QuickActions | GET /v1/client-portal/dashboard |
| SCR-CPT-003 | Project List | /portal/projects | P0 | ProjectCardGrid, StatusBadge, ProgressBar | GET /v1/client-portal/projects |
| SCR-CPT-004 | Project Detail | /portal/projects/:id | P0 | ProjectHeader, TimelineView, MilestoneList, FileList | GET /v1/client-portal/projects/:id |
| SCR-CPT-005 | Quotation List | /portal/quotations | P0 | DataTable, StatusBadge, FilterBar | GET /v1/client-portal/quotations |
| SCR-CPT-006 | Quotation Detail | /portal/quotations/:id | P0 | QuotationPreview, ApprovalPanel (Admin), DownloadPDF | GET /v1/client-portal/quotations/:id |
| SCR-CPT-007 | Documents | /portal/documents | P0 | DocumentGrid, FilterBar, SearchBar, ViewToggle | GET /v1/client-portal/documents |
| SCR-CPT-008 | Request List | /portal/requests | P0 | RequestList, StatusBadge, FilterBar | GET /v1/client-portal/requests |
| SCR-CPT-009 | New Request | /portal/requests/new | P0 | RequestForm, FileUploader, EmergencyBanner | POST /v1/client-portal/requests |
| SCR-CPT-010 | Request Detail | /portal/requests/:id | P0 | RequestDetail, ActivityLog, StatusTracker | GET /v1/client-portal/requests/:id |
| SCR-CPT-011 | Profile | /portal/profile | P0 | ProfileForm, NotificationPreferences | PATCH /v1/client-portal/profile |
| SCR-CPT-012 | Password Reset | /portal/reset-password | P0 | PasswordResetForm, EmailSent, SuccessMessage | POST /v1/auth/reset-password |

---

## Executive Dashboard

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-DSH-001 | Main Dashboard | /app/dashboard | P0 | PipelineFunnel, RevenueChart, ProjectHealth, KpiCards, DecisionCenter | GET /v1/dashboard/summary |
| SCR-DSH-002 | Pipeline Deep-Dive | /app/dashboard/pipeline | P1 | FunnelChart, StageBreakdown, OppTable, WinRate | GET /v1/dashboard/pipeline |
| SCR-DSH-003 | Revenue Analysis | /app/dashboard/revenue | P1 | RevenueChart, MarginBreakdown, Forecast, YOYCompare | GET /v1/dashboard/revenue |
| SCR-DSH-004 | Project Health | /app/dashboard/projects | P1 | HealthHeatmap, MilestoneCalendar, BudgetVariance | GET /v1/dashboard/projects |
| SCR-DSH-005 | Client Health | /app/dashboard/clients | P1 | ClientTable, HealthScore, ARSummary, RenewalCalendar | GET /v1/dashboard/clients |
| SCR-DSH-006 | Operations Overview | /app/dashboard/operations | P1 | WorkloadChart, ApprovalQueue, ResourceUtilization | GET /v1/dashboard/operations |

---

## Administration

| ID | Name | URL | V1 | Components | API |
|----|------|-----|----|------------|-----|
| SCR-ADM-001 | User List | /app/admin/users | P0 | DataTable, FilterBar, NewButton, StatusBadge | GET /v1/users |
| SCR-ADM-002 | User Create | /app/admin/users/new | P0 | UserForm, RoleSelect, CompanySelect, PasswordField | POST /v1/users |
| SCR-ADM-003 | User Detail | /app/admin/users/:id | P0 | UserForm, RoleBadge, ActivityHistory | GET /v1/users/:id, PATCH /v1/users/:id |
| SCR-ADM-004 | Role List | /app/admin/roles | P0 | DataTable, PermissionCount, UserCount | GET /v1/roles |
| SCR-ADM-005 | Role Editor | /app/admin/roles/:id | P0 | RoleForm, PermissionTree, UserAssignment | GET /v1/roles/:id, PATCH /v1/roles/:id |
| SCR-ADM-006 | Company List | /app/admin/companies | P0 | DataTable, StatusBadge, UserCount | GET /v1/admin/companies |
| SCR-ADM-007 | Company Detail | /app/admin/companies/:id | P0 | CompanyForm, ConfigEditor, UserList | GET /v1/admin/companies/:id, PATCH /v1/admin/companies/:id |
| SCR-ADM-008 | System Settings | /app/admin/settings | P0 | SettingsForm, ConfigTable | GET /v1/admin/settings, PATCH /v1/admin/settings |
| SCR-ADM-009 | Audit Log | /app/admin/audit | P0 | AuditLogTable, FilterBar, DateRangePicker, ExportButton | GET /v1/admin/audit |

---

## Screen State Matrix

Every screen implements these states:

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial API call | Skeleton screen or spinner |
| Empty | No data returned | EmptyState component with illustration + CTA |
| Error | API failure | ErrorState component with retry button |
| Data | Successful response | Normal rendered content |
| Refreshing | User-initiated refresh | Subtle loading indicator on component |
| Saving | Form submission | Button loading state + disabled form |
| Saved | Successful save | Toast notification |
| Error on save | Validation or server error | Inline error messages + toast |
