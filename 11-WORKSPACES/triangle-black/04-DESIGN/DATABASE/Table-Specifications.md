# Table Specifications

## Platform Schema Tables

### tenants

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Tenant identifier |
| name | VARCHAR(255) | NOT NULL | Company/hotel name |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier |
| domain | VARCHAR(255) | NULL | Custom domain |
| status | tenant_status | NOT NULL, DEFAULT 'active' | active, suspended, archived |
| config | JSONB | NOT NULL, DEFAULT '{}' | Tenant configuration |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'EGP' | Default currency |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'Africa/Cairo' | Default timezone |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |

### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | User identifier |
| tenant_id | UUID | FK → tenants.id | Tenant association |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| first_name | VARCHAR(100) | NOT NULL | — |
| last_name | VARCHAR(100) | NOT NULL | — |
| role | user_role | NOT NULL | SUPER_ADMIN, ADMIN, MANAGER, SALES_REP, ENGINEER, VIEWER, CLIENT_ADMIN, CLIENT_USER |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account enabled |
| last_login_at | TIMESTAMPTZ | NULL | Last login timestamp |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |

---

## Tenant Schema Tables

### leads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| first_name | VARCHAR(100) | NOT NULL | — |
| last_name | VARCHAR(100) | NOT NULL | — |
| email | VARCHAR(255) | NULL | — |
| phone | VARCHAR(50) | NULL | — |
| company_name | VARCHAR(255) | NULL | — |
| job_title | VARCHAR(100) | NULL | — |
| source | lead_source | NOT NULL | website, referral, event, cold_outreach, other |
| status | lead_status | NOT NULL, DEFAULT 'new' | new, contacted, qualified, disqualified, converted |
| score | INTEGER | NULL, DEFAULT 0 | Lead score |
| assigned_to | UUID | FK → users.id | Owner |
| notes | TEXT | NULL | — |
| converted_at | TIMESTAMPTZ | NULL | When converted to opportunity |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | Soft delete |

### opportunities

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| lead_id | UUID | FK → leads.id | Originating lead |
| company_id | UUID | FK → companies | Client company |
| name | VARCHAR(255) | NOT NULL | Opportunity name |
| value | DECIMAL(12,2) | NOT NULL | Estimated value |
| stage | opp_stage | NOT NULL | qualification, needs_analysis, proposal, negotiation, closed_won, closed_lost |
| probability | INTEGER | NOT NULL, DEFAULT 10 | Auto-set by stage |
| close_date | DATE | NOT NULL | Expected close |
| assigned_to | UUID | FK → users.id | Owner |
| lost_reason | TEXT | NULL | Required if stage = closed_lost |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### companies

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| name | VARCHAR(255) | NOT NULL | Company/hotel name |
| industry | VARCHAR(100) | NULL | hospitality, etc. |
| size | VARCHAR(50) | NULL | Number of rooms/employees |
| website | VARCHAR(255) | NULL | — |
| phone | VARCHAR(50) | NULL | — |
| address | JSONB | NULL | Address components |
| notes | TEXT | NULL | — |
| status | company_status | NOT NULL, DEFAULT 'active' | active, inactive, prospect |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### contacts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| company_id | UUID | FK → companies | Parent company |
| first_name | VARCHAR(100) | NOT NULL | — |
| last_name | VARCHAR(100) | NOT NULL | — |
| email | VARCHAR(255) | NULL | — |
| phone | VARCHAR(50) | NULL | — |
| job_title | VARCHAR(100) | NULL | — |
| department | VARCHAR(100) | NULL | — |
| is_primary | BOOLEAN | NOT NULL, DEFAULT false | Primary contact |
| notes | TEXT | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### activities

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| entity_type | VARCHAR(50) | NOT NULL | lead, opportunity, company, contact |
| entity_id | UUID | NOT NULL | Related entity |
| activity_type | activity_type | NOT NULL | call, email, meeting, note, task |
| subject | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| activity_date | TIMESTAMPTZ | NOT NULL | When it occurred |
| duration_minutes | INTEGER | NULL | For calls/meetings |
| assigned_to | UUID | FK → users.id | Owner |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### quotations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| number | VARCHAR(50) | NOT NULL, UNIQUE | QTN-{YYYY}-{XXXXX} |
| opportunity_id | UUID | FK → opportunities | Source opportunity |
| company_id | UUID | FK → companies | Client company |
| status | quotation_status | NOT NULL, DEFAULT 'draft' | draft, sent, under_review, approved, rejected, expired |
| version | INTEGER | NOT NULL, DEFAULT 1 | Revision number |
| subtotal | DECIMAL(12,2) | NOT NULL | Before tax |
| tax_rate | DECIMAL(5,2) | NOT NULL, DEFAULT 14 | Tax percentage |
| tax_total | DECIMAL(12,2) | NOT NULL | Tax amount |
| total | DECIMAL(12,2) | NOT NULL | Grand total |
| margin | DECIMAL(5,2) | NULL | Margin percentage |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'EGP' | Currency code |
| valid_until | DATE | NOT NULL | Expiry date (BR-QTN-04) |
| notes | TEXT | NULL | Internal notes |
| terms | TEXT | NULL | Terms and conditions |
| approved_by | UUID | NULL | FK → users (final approver) |
| approved_at | TIMESTAMPTZ | NULL | Approval timestamp |
| sent_at | TIMESTAMPTZ | NULL | When sent to client |
| client_approved_at | TIMESTAMPTZ | NULL | Client approval |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### quotation_line_items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| quotation_id | UUID | FK → quotations | Parent quotation |
| description | VARCHAR(500) | NOT NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity |
| unit | VARCHAR(50) | NOT NULL | Unit of measure |
| unit_price | DECIMAL(12,2) | NOT NULL | Per-unit price |
| discount_percent | DECIMAL(5,2) | NULL, DEFAULT 0 | Discount percentage |
| total | DECIMAL(12,2) | NOT NULL | Calculated total |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### rfqs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| number | VARCHAR(50) | NOT NULL, UNIQUE | RFQ-{YYYY}-{XXXXX} |
| opportunity_id | UUID | FK → opportunities | Source |
| status | rfq_status | NOT NULL, DEFAULT 'draft' | draft, submitted, under_review, approved, rejected |
| response_deadline | DATE | NULL | Vendor response deadline |
| notes | TEXT | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### contracts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| number | VARCHAR(50) | NOT NULL, UNIQUE | CNT-{YYYY}-{XXXXX} |
| quotation_id | UUID | FK → quotations | Source quotation |
| company_id | UUID | FK → companies | Client |
| title | VARCHAR(255) | NOT NULL | Contract title |
| status | contract_status | NOT NULL, DEFAULT 'draft' | draft, sent, signed, active, completed, terminated |
| value | DECIMAL(12,2) | NOT NULL | Total contract value |
| start_date | DATE | NOT NULL | Effective start |
| end_date | DATE | NOT NULL | Expiry date |
| signed_at | TIMESTAMPTZ | NULL | When fully signed |
| terminated_at | TIMESTAMPTZ | NULL | If terminated |
| notes | TEXT | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| contract_id | UUID | FK → contracts | Source contract |
| company_id | UUID | FK → companies | Client |
| name | VARCHAR(255) | NOT NULL | Project name |
| code | VARCHAR(50) | NOT NULL, UNIQUE | PRJ-{YYYY}-{XXXXX} |
| status | project_status | NOT NULL, DEFAULT 'planning' | planning, in_progress, on_hold, completed, cancelled |
| value | DECIMAL(12,2) | NULL | Project value |
| budget | DECIMAL(12,2) | NULL | Approved budget |
| start_date | DATE | NOT NULL | Project start |
| end_date | DATE | NULL | Expected end |
| completion_percent | INTEGER | NOT NULL, DEFAULT 0 | Auto-calculated |
| manager_id | UUID | FK → users | Project manager |
| notes | TEXT | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| created_by | UUID | NOT NULL | — |
| updated_by | UUID | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### milestones

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| project_id | UUID | FK → projects | Parent project |
| name | VARCHAR(255) | NOT NULL | Milestone name |
| description | TEXT | NULL | — |
| sequence | INTEGER | NOT NULL | Order (BR-PRJ-02) |
| due_date | DATE | NOT NULL | Target date |
| completed_at | TIMESTAMPTZ | NULL | When completed |
| approved_at | TIMESTAMPTZ | NULL | When approved (BR-PRJ-03) |
| status | milestone_status | NOT NULL, DEFAULT 'not_started' | not_started, in_progress, completed, approved |
| assigned_to | UUID | FK → users | Owner |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### project_files

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| project_id | UUID | FK → projects | Parent project |
| milestone_id | UUID | FK → milestones | Optional milestone link |
| name | VARCHAR(255) | NOT NULL | Original filename |
| storage_path | VARCHAR(500) | NOT NULL | Storage location |
| file_type | VARCHAR(50) | NOT NULL | MIME type |
| file_size | INTEGER | NOT NULL | Bytes |
| category | VARCHAR(50) | NULL | report, drawing, photo, contract, other |
| uploaded_by | UUID | FK → users | Uploader |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### surveys

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| project_id | UUID | FK → projects | Parent project |
| surveyor_id | UUID | FK → users | Field engineer |
| scheduled_date | DATE | NOT NULL | Site visit date |
| completed_date | DATE | NULL | When survey done |
| status | survey_status | NOT NULL, DEFAULT 'scheduled' | scheduled, in_progress, completed |
| findings | JSONB | NULL | Structured findings |
| recommendations | TEXT | NULL | Engineer recommendations |
| report_path | VARCHAR(500) | NULL | Generated report file |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### assessments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| project_id | UUID | FK → projects | Parent project |
| survey_id | UUID | FK → surveys | Source survey |
| status | assessment_status | NOT NULL, DEFAULT 'draft' | draft, completed, approved |
| technical_specs | JSONB | NULL | Technical specifications |
| boq_items | JSONB | NULL | Bill of quantities |
| reviewed_by | UUID | FK → users | Reviewer |
| reviewed_at | TIMESTAMPTZ | NULL | Review date |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### service_requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| company_id | UUID | FK → companies | Client company |
| portal_user_id | UUID | FK → portal_users | Submitter |
| number | VARCHAR(50) | NOT NULL, UNIQUE | REQ-{YYYY}-{XXXXX} |
| type | request_type | NOT NULL | maintenance, procurement, inquiry, emergency |
| priority | request_priority | NOT NULL, DEFAULT 'medium' | low, medium, high, critical |
| subject | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NOT NULL | — |
| status | request_status | NOT NULL, DEFAULT 'submitted' | submitted, acknowledged, in_progress, resolved, closed |
| assigned_to | UUID | FK → users | Assigned staff |
| resolved_at | TIMESTAMPTZ | NULL | Resolution date |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### portal_users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| user_id | UUID | FK → users (platform) | Linked platform user |
| company_id | UUID | FK → companies | Client company |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### documents

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| company_id | UUID | FK → companies | Owning company |
| name | VARCHAR(255) | NOT NULL | Document name |
| storage_path | VARCHAR(500) | NOT NULL | File path |
| file_type | VARCHAR(50) | NOT NULL | MIME type |
| file_size | INTEGER | NOT NULL | Bytes |
| category | VARCHAR(50) | NOT NULL | report, invoice, contract, drawing, photo, other |
| project_id | UUID | FK → projects | Optional project link |
| version | INTEGER | NOT NULL, DEFAULT 1 | Version number |
| uploaded_by | UUID | FK → users | Uploader |
| created_at | TIMESTAMPTZ | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | — |
| deleted_at | TIMESTAMPTZ | NULL | — |

### notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | — |
| user_id | UUID | FK → users | Recipient |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| body | TEXT | NOT NULL | Message body |
| link | VARCHAR(500) | NULL | Deep link |
| is_read | BOOLEAN | NOT NULL, DEFAULT false | Read status |
| read_at | TIMESTAMPTZ | NULL | When read |
| created_at | TIMESTAMPTZ | NOT NULL | — |

### audit_log

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PK | Sequential ID |
| tenant_id | UUID | NULL | null for platform actions |
| table_name | VARCHAR(100) | NOT NULL | Affected table |
| record_id | UUID | NOT NULL | Affected record |
| action | audit_action | NOT NULL | create, update, delete |
| old_values | JSONB | NULL | Previous state |
| new_values | JSONB | NULL | New state |
| changed_by | UUID | NOT NULL | Acting user |
| changed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp |
| ip_address | INET | NULL | Request IP |
| user_agent | VARCHAR(500) | NULL | User agent |
