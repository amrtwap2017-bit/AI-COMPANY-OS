# Traceability Matrix

## Requirement → Feature → API → Database → Screen

### CRM Module

| Requirement | Feature | API Endpoint | DB Table | Screen ID |
|-------------|---------|-------------|----------|-----------|
| Capture website leads | Lead Management | POST /api/v1/crm/leads | leads | LS-01 |
| View leads pipeline | Lead Pipeline | GET /api/v1/crm/pipeline | leads (aggregated) | LS-03 |
| Convert lead to opportunity | Lead Conversion | POST /api/v1/crm/leads/:id/convert | leads, opportunities, companies | LS-02 |
| Track opportunity stages | Sales Pipeline | GET /api/v1/crm/opportunities | opportunities | OP-01 |
| Manage client companies | Company Management | POST /api/v1/crm/companies | companies | CM-01 |
| Log client interactions | Activity Logging | POST /api/v1/crm/activities | activities | CM-03 |
| Forecast revenue | Pipeline Forecast | GET /api/v1/crm/pipeline/win-loss | opportunities (aggregated) | ED-02 |

### Quotations Module

| Requirement | Feature | API Endpoint | DB Table | Screen ID |
|-------------|---------|-------------|----------|-----------|
| Create professional quotations | Quotation Builder | POST /api/v1/quotations/quotations | quotations, quotation_line_items | QN-01 |
| Send quotation to client | Quotation Submit | POST /api/v1/quotations/quotations/:id/submit | quotations | QN-02 |
| Internal approval workflow | Quotation Approval | POST /api/v1/quotations/quotations/:id/approve | quotations | QN-03 |
| Generate quotation PDF | PDF Export | GET /api/v1/quotations/quotations/:id/pdf | — | QN-02 |
| Manage contracts | Contract Lifecycle | POST /api/v1/quotations/contracts | contracts | CT-01 |
| Track signed contracts | Contract Status | GET /api/v1/quotations/contracts | contracts | CT-02 |

### Projects Module

| Requirement | Feature | API Endpoint | DB Table | Screen ID |
|-------------|---------|-------------|----------|-----------|
| Create project from contract | Project Setup | POST /api/v1/projects/projects | projects | PR-01 |
| Track milestone progress | Milestone Management | POST /api/v1/projects/projects/:id/milestones | milestones | PR-04 |
| Upload project documents | File Management | POST /api/v1/projects/projects/:id/files | project_files | PR-02 |
| Conduct site surveys | Survey Management | POST /api/v1/projects/projects/:id/surveys | surveys | SR-01 |
| Create technical assessments | Assessment | PUT /api/v1/projects/assessments/:id | assessments | SR-02 |
| Monitor project health | Dashboard | GET /api/v1/projects/summary | projects (aggregated) | PR-03 |

### Client Portal Module

| Requirement | Feature | API Endpoint | DB Table | Screen ID |
|-------------|---------|-------------|----------|-----------|
| Submit service requests | Request Submission | POST /api/v1/portal/service-requests | service_requests | CP-01 |
| Track request status | Request Status | GET /api/v1/portal/service-requests/:id | service_requests | CP-02 |
| View company documents | Document Access | GET /api/v1/portal/documents | documents | CP-03 |
| View active projects | Client Projects | GET /api/v1/portal/projects | projects | CP-04 |

### Administration Module

| Requirement | Feature | API Endpoint | DB Table | Screen ID |
|-------------|---------|-------------|----------|-----------|
| Manage users | User Management | POST /api/v1/admin/users | users | AD-01 |
| Configure roles | Role Management | PUT /api/v1/admin/roles/:role/permissions | roles (config) | AD-02 |
| View audit trail | Audit Log | GET /api/v1/admin/audit-logs | audit_log | AD-03 |
| Configure tenant | Tenant Settings | PUT /api/v1/admin/tenant | tenants | AD-04 |
| View notifications | Notifications | GET /api/v1/admin/notifications | notifications | LS-02 |

## Requirement Count by Module

| Module | Requirements | API Endpoints | DB Tables | Screens |
|--------|-------------|---------------|-----------|---------|
| CRM | 7 | 12 | 5 | 3 |
| Quotations | 7 | 10 | 5 | 5 |
| Projects | 6 | 9 | 5 | 6 |
| Client Portal | 4 | 5 | 3 | 4 |
| Administration | 5 | 7 | 4 | 4 |
| Shared | — | 6 | 3 | — |
| **Total** | **29** | **49** | **25** | **22** |
