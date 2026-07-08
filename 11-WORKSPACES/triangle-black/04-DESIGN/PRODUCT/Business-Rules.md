---
ID: 07-Product-11
Title: Business Rules
Purpose: Define all business rules governing platform behavior
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Business Rules — V1

## 1. CRM Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-CRM-01 | Lead uniqueness | A Lead with the same email address cannot be created if an active Lead exists. Duplicate detection runs on creation. |
| BR-CRM-02 | Lead conversion | Converting a Lead to an Opportunity requires a Company to exist. If the company doesn't exist, the system creates one. |
| BR-CRM-03 | Opportunity closure | Closing an Opportunity as "Won" requires a Contract to be created or linked. "Lost" requires a reason. |
| BR-CRM-04 | Opportunity probability | Probability is auto-set by stage: Qualification=10%, Needs Analysis=25%, Proposal=50%, Negotiation=75%, Closed Won=100%, Closed Lost=0%. Manual override allowed. |
| BR-CRM-05 | Company duplicate rule | Companies with identical name and city are flagged as potential duplicates. Admin must resolve or confirm. |
| BR-CRM-06 | Activity minimum | A Lead cannot be set to "Disqualified" without at least one activity logged (call or email). |
| BR-CRM-07 | Owner assignment | Every Lead, Opportunity, Company, and Contact must have an assigned owner (internal user). |

## 2. Quotation Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-QTN-01 | Quotation numbering | Quotations are auto-numbered in format `QTN-{YYYY}-{XXXXX}` where XXXXX is a zero-padded sequential number per year. |
| BR-QTN-02 | Contract numbering | Contracts are auto-numbered in format `CNT-{YYYY}-{XXXXX}` following same scheme. |
| BR-QTN-03 | Quotation versioning | Revisions create a new version. Previous versions are preserved and viewable. Only the latest version can be acted upon. |
| BR-QTN-04 | Quotation expiry | Quotations have a configurable validity period (default 30 days). Expired quotations cannot be approved. |
| BR-QTN-05 | Approval chain | Quotations above EGP 50,000 require two internal approvals. Above EGP 200,000 require director approval. |
| BR-QTN-06 | Contract from quotation | A Contract can only be created from an Approved quotation. One quotation can generate at most one Contract. |
| BR-QTN-07 | Line item tax | Tax is calculated at line item level based on item category. Default tax rate is configurable at system level. |
| BR-QTN-08 | Discount limits | Line item discount cannot exceed 50%. Total quotation discount cannot exceed 30%. Discounts above these require director approval. |
| BR-QTN-09 | Currency consistency | All line items in a quotation must use the same currency. Mixed-currency quotations are not allowed. |

## 3. Project Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-PRJ-01 | Project-Contract linkage | A Project must be linked to exactly one Contract (or be an internal project with type "Internal"). |
| BR-PRJ-02 | Milestone ordering | Milestones have a sequence order. A milestone cannot be marked Complete unless all preceding milestones are Complete. |
| BR-PRJ-03 | Milestone approval | Milestones marked Complete require approval from a Project Manager (or assigned approver) before status becomes "Approved." |
| BR-PRJ-04 | Project completion | A Project cannot be marked Completed until all milestones are Completed and Approved. |
| BR-PRJ-05 | File naming | Uploaded files are renamed to `{project-id}_{milestone-id}_{timestamp}_{original-name}` for uniqueness. |
| BR-PRJ-06 | File type restriction | Only allowed file types (PDF, DOCX, XLSX, JPG, PNG, DWG) can be uploaded. Other formats are rejected. |
| BR-PRJ-07 | Status transitions | Valid transitions: Planning→InProgress, InProgress→OnHold, InProgress→Completed, OnHold→InProgress, Completed→(none), Cancelled→(none). |

## 4. Client Portal Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-POR-01 | Data isolation | A client user sees ONLY data belonging to their client Company. No cross-tenant data access under any circumstances. |
| BR-POR-02 | Contact-company link | A portal user must be associated with exactly one Company. No user can belong to multiple companies. |
| BR-POR-03 | Role-based document access | Document visibility is controlled by user role. Client Admin sees all documents; Client User sees only project documents. |
| BR-POR-04 | Quotation approval | Only users with "Client Admin" role can approve quotations in the portal. "Client User" can view and comment but not approve. |
| BR-POR-05 | Session timeout | Portal sessions expire after 60 minutes of inactivity. User must re-authenticate. |
| BR-POR-06 | Failed login lockout | After 5 failed login attempts, account is locked for 30 minutes. Admin can manually unlock. |
| BR-POR-07 | Request acknowledgment | Every service request submitted via portal must receive an automated acknowledgment within 5 minutes. |

## 5. Administration Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-ADM-01 | Role hierarchy | Roles: Admin > Manager > Client Admin > Client User. Higher roles inherit all permissions of lower roles. |
| BR-ADM-02 | Minimum admin count | The system must always have at least 2 active users with Admin role (preventing lockout). |
| BR-ADM-03 | Self-deactivation prevention | An Admin cannot deactivate their own account. Only another Admin can deactivate an Admin. |
| BR-ADM-04 | Audit retention | Audit logs are retained for a minimum of 365 days and cannot be deleted (only archived). |
| BR-ADM-05 | Password policy | Passwords: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character. |
| BR-ADM-06 | Password history | Last 5 passwords cannot be reused. |
| BR-ADM-07 | Email uniqueness | Each user email address must be unique across the entire system (all tenants). |
| BR-ADM-08 | Tenant isolation | Admin users can see all tenants. Manager users see only assigned tenants. Client users see only their tenant. |

## 6. General Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-GEN-01 | Soft delete | All records use soft delete (deleted_at timestamp). Hard delete only via database admin, logged separately. |
| BR-GEN-02 | Timestamp standard | All timestamps stored in UTC. Displayed in user's configured timezone. |
| BR-GEN-03 | Audit scope | Every create, update, and delete operation across all entities is recorded in the audit log. Read operations are not logged. |
| BR-GEN-04 | RESTful consistency | API operations must be idempotent where semantically appropriate (GET, PUT, DELETE). POST creates new resources. |
| BR-GEN-05 | Data export | Clients can request their data export. System must provide all client data within 72 hours in machine-readable format. |
