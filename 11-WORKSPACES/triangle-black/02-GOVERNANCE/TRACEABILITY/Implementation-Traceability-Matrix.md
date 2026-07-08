# Implementation Traceability Matrix

| Field | Value |
|---|---|
| Document ID | ROOT-CORNERSTONE-04 |
| Document Purpose | Map every requirement to workflows, UI, APIs, database tables, tests, and acceptance criteria |
| Version | 1.0 |
| Status | Review |
| Dependencies | 07-Product/Functional-Requirements.md, 13-API/Endpoints.md, 10-Database/ERD.md |

---

## How to Use This Matrix

This is the single source of truth for implementation traceability. When building any feature:

1. Find the requirement in this matrix
2. Follow the trace to see exactly which workflows, UI screens, API endpoints, and database tables are involved
3. Confirm the acceptance criteria before coding
4. Verify the test requirements before merging

---

## V1 Module: CRM

### FR-CRM-001: Create Lead

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: CRM-001 |
| Business Capability | Marketing, CRM (Lead Management) |
| Workflow | 06-Operations/Lead-to-Contract.md: Stage 1-2 |
| UI | 08-UX/Portal-Flows.md: Lead creation flow |
| API | POST /v1/leads |
| Database | leads table |
| Roles | Sales, Marketing (create); All (view own) |
| Notifications | Email to assigned sales rep |
| Acceptance Criteria | Lead created with required fields. Lead visible in list immediately. Lead assigned to correct owner. |
| Tests | Unit: LeadService.create(). Integration: POST /v1/leads returns 201. E2E: Create lead via UI, verify in list. |

### FR-CRM-002: Convert Lead to Opportunity

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: CRM-002 |
| Business Capability | CRM (Opportunities) |
| Workflow | 06-Operations/Lead-to-Contract.md: Stage 2-3 |
| UI | 08-UX/Portal-Flows.md: Lead conversion flow |
| API | POST /v1/opportunities (from lead) |
| Database | leads (status=converted), opportunities |
| Roles | Sales |
| Notifications | None |
| Acceptance Criteria | Lead status changes to "Converted". Opportunity created with lead data. Lead becomes inactive. |
| Tests | Unit: LeadService.convertToOpportunity(). Integration: POST leads/{id}/convert returns 201. |

### FR-CRM-003: Manage Opportunities Pipeline

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: CRM-003 |
| Business Capability | CRM (Opportunities) |
| Workflow | 06-Operations/Lead-to-Contract.md: Stage 3-5 |
| UI | 08-UX/Navigation.md: Pipeline view |
| API | GET /v1/opportunities, PATCH /v1/opportunities/{id} |
| Database | opportunities, opportunity_stages, opportunity_activities |
| Roles | Sales (view/update), Manager (view all) |
| Notifications | Stage change to team |
| Acceptance Criteria | Pipeline shows opportunities by stage. Drag-and-drop stage transition. Activity logged on change. |
| Tests | Unit: OpportunityService.updateStage(). E2E: Move opportunity through stages via UI. |

---

## V1 Module: Projects

### FR-PRJ-001: Create Project

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: PRJ-001 |
| Business Capability | Project Execution |
| Workflow | 06-Operations/Project-Execution.md |
| UI | 08-UX/Portal-Flows.md: Project creation |
| API | POST /v1/projects |
| Database | projects, project_milestones |
| Roles | Project Manager (create), All (view assigned) |
| Notifications | Project created to team |
| Acceptance Criteria | Project created from contract or manually. Milestones auto-generated from template. |
| Tests | Unit: ProjectService.create(). Integration: POST /v1/projects returns 201. |

### FR-PRJ-002: Track Milestones

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: PRJ-002 |
| Business Capability | Project Execution |
| Workflow | 06-Operations/Project-Execution.md: Milestone tracking |
| UI | 08-UX/Components.md: Milestone tracker |
| API | PATCH /v1/projects/{id}/milestones/{mid} |
| Database | project_milestones |
| Roles | Project Manager (update), Client (view) |
| Notifications | Milestone completed to client and team |
| Acceptance Criteria | Milestone status updated. Completion % recalculated. Notification sent on 100%. |
| Tests | Unit: ProjectService.completeMilestone(). E2E: Complete milestone chain via UI. |

### FR-PRJ-003: Upload Deliverables

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: PRJ-003 |
| Business Capability | Project Execution |
| Workflow | 06-Operations/QAQC.md, Handover.md |
| UI | 08-UX/Portal-Flows.md: File upload |
| API | POST /v1/documents (file upload) |
| Database | documents, document_versions, project_deliverables |
| Roles | Project team (upload), Client (view in portal) |
| Notifications | New deliverable to client |
| Acceptance Criteria | File uploaded, virus scanned, versioned, linked to project. Client can view in portal. |
| Tests | Integration: POST /v1/documents (multipart). E2E: Upload deliverable, verify in client portal. |

---

## V1 Module: Quotations

### FR-QTN-001: Create Quotation

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: QTN-001 |
| Business Capability | Quotations |
| Workflow | 06-Operations/Quotation.md |
| UI | 08-UX/Portal-Flows.md: Quotation builder |
| API | POST /v1/quotations |
| Database | quotations, quotation_line_items |
| Roles | Sales (create), Manager (approve) |
| Notifications | Quotation ready for approval |
| Acceptance Criteria | Quotation created with line items. Total calculated. PDF generated. |
| Tests | Unit: QuotationService.calculateTotal(). E2E: Create quotation with items, verify PDF. |

### FR-QTN-002: Quotation Approval Workflow

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: QTN-002 |
| Business Capability | Quotations |
| Workflow | 06-Operations/Quotation.md: Approval |
| UI | 08-UX/Portal-Flows.md: Approval flow |
| API | PATCH /v1/quotations/{id}/approve |
| Database | quotations (status, approved_by, approved_at) |
| Roles | Manager (approve), Sales (submit) |
| Notifications | Approval requested, Approved, Rejected |
| Acceptance Criteria | Multi-level approval if above threshold. Rejection requires reason. |
| Tests | Unit: QuotationService.submitForApproval(). E2E: Submit, approve, verify status change. |

---

## V1 Module: Client Portal

### FR-CPT-001: View Project Progress

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: CPT-001 |
| Business Capability | Client Portal |
| Workflow | 06-Operations/Client-Support.md |
| UI | 08-UX/Portal-Flows.md: Project view |
| API | GET /v1/client-portal/projects/{id} (tenant-scoped) |
| Database | projects, project_milestones (client-visible subset) |
| Roles | Client (view own projects) |
| Notifications | None (pull) |
| Acceptance Criteria | Client sees only their projects. Milestones visible. Documents downloadable. |
| Tests | Integration: GET /v1/client-portal/projects returns tenant-scoped data. E2E: Login as client, view project. |

### FR-CPT-002: View Quotations & Invoices

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: CPT-002 |
| Business Capability | Client Portal |
| Workflow | 06-Operations/Quotation.md |
| UI | 08-UX/Portal-Flows.md: Documents view |
| API | GET /v1/client-portal/quotations, GET /v1/client-portal/invoices |
| Database | quotations (with client_id filter), invoices |
| Roles | Client (view own) |
| Notifications | New quotation available (push) |
| Acceptance Criteria | Client sees approved quotations only. PDF download. Invoice status visible. |
| Tests | E2E: Client views quotation, downloads PDF. |

---

## V1 Module: Executive Dashboard

### FR-DSH-001: Pipeline Health

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: DSH-001 |
| Business Capability | Executive Intelligence |
| Workflow | N/A (aggregated data) |
| UI | 08-UX/Dashboard/Dashboard.md: Pipeline widget |
| API | GET /v1/dashboard/pipeline |
| Database | Aggregated from opportunities |
| Roles | Executive, Manager |
| Notifications | None |
| Acceptance Criteria | Pipeline value by stage. Win probability. Expected close dates. |
| Tests | Integration: GET /v1/dashboard/pipeline returns correct aggregates. |

### FR-DSH-002: Revenue & Profitability

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: DSH-002 |
| Business Capability | Executive Intelligence |
| Workflow | N/A |
| UI | 08-UX/Dashboard/Dashboard.md: Revenue chart |
| API | GET /v1/dashboard/revenue |
| Database | Aggregated from quotations, invoices |
| Roles | Executive |
| Notifications | None |
| Acceptance Criteria | Revenue by month. Gross margin. YOY comparison. Forecast. |
| Tests | Integration: GET /v1/dashboard/revenue returns correct aggregates. |

---

## V1 Module: Administration

### FR-ADM-001: User Management

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: ADM-001 |
| Business Capability | Administration |
| Workflow | N/A |
| UI | 08-UX/Navigation.md: Admin panel |
| API | GET /v1/users, POST /v1/users, PATCH /v1/users/{id} |
| Database | users, roles, permissions, user_roles |
| Roles | Super Admin (full), Admin (limited) |
| Notifications | User created, Password reset |
| Acceptance Criteria | CRUD users. Assign roles. Enable/disable. Audit logged. |
| Tests | Unit: UserService.create(). E2E: Create user, assign role, verify permissions. |

### FR-ADM-002: Role & Permission Management

| Trace | Reference |
|---|---|
| Requirement | 07-Product/Functional-Requirements.md: ADM-002 |
| Business Capability | Administration |
| Workflow | N/A |
| UI | 08-UX/Navigation.md: Role editor |
| API | GET /v1/roles, POST /v1/roles, PATCH /v1/roles/{id} |
| Database | roles, permissions, role_permissions |
| Roles | Super Admin |
| Notifications | None |
| Acceptance Criteria | Create roles with permission set. Update permissions. Changes take effect immediately. |
| Tests | Unit: RoleService.updatePermissions(). E2E: Update role, verify access changes. |
