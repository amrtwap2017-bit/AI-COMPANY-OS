# Constraints

## Primary Keys

All tables use `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.

## Unique Constraints

| Table | Columns | Name |
|-------|---------|------|
| users | (email, tenant_id) | uq_users_email_tenant |
| users | (tenant_id, deleted_at) partial | uq_users_email_active |
| leads | (tenant_id, email) | uq_leads_email_tenant |
| companies | (tenant_id, name) | uq_companies_name_tenant |
| quotations | number | uq_quotation_number |
| quotation_line_items | (quotation_id, sort_order) | uq_qli_sort_order |
| contracts | number | uq_contract_number |
| projects | code | uq_project_code |
| service_requests | number | uq_sr_number |

## Foreign Key Integrity

| Child Table | Parent Table | Rule |
|-------------|-------------|------|
| All tenant tables | users (created_by, updated_by) | RESTRICT on delete |
| opportunities | leads | SET NULL on delete |
| opportunities | companies | RESTRICT |
| quotations | opportunities | RESTRICT |
| quotation_line_items | quotations | CASCADE |
| contracts | quotations | RESTRICT |
| projects | contracts | RESTRICT |
| milestones | projects | CASCADE |
| project_files | projects, milestones | CASCADE |
| surveys | projects | RESTRICT |
| assessments | surveys | SET NULL |
| service_requests | companies | RESTRICT |
| documents | companies | RESTRICT |

## Check Constraints

| Table | Constraint | Rule |
|-------|-----------|------|
| leads | chk_leads_score | score >= 0 AND score <= 100 |
| opportunities | chk_opp_probability | probability >= 0 AND probability <= 100 |
| opportunities | chk_opp_stage_lost | WHEN stage = 'closed_lost', lost_reason IS NOT NULL |
| quotations | chk_quotation_dates | valid_until >= created_at::date |
| quotation_line_items | chk_qli_quantity | quantity > 0 |
| quotation_line_items | chk_qli_unit_price | unit_price >= 0 |
| quotation_line_items | chk_qli_discount | discount_percent >= 0 AND discount_percent <= 100 |
| contracts | chk_contract_dates | end_date > start_date |
| projects | chk_project_dates | end_date IS NULL OR end_date >= start_date |
| milestones | chk_ms_completion | IF completed_at IS NOT NULL THEN milestone_due_date >= completed_at |
| milestones | chk_ms_dates | due_date >= project_start_date |
| milestones | chk_ms_sequence | sequence > 0 |
| service_requests | chk_sr_priority | priority IN ('low','medium','high','critical') |
| notifications | chk_notif_body | length(body) >= 1 |

## Enum Types

```sql
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'archived');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'sales_rep', 'engineer', 'viewer', 'client_admin', 'client_user');
CREATE TYPE lead_source AS ENUM ('website', 'referral', 'event', 'cold_outreach', 'other');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'disqualified', 'converted');
CREATE TYPE opp_stage AS ENUM ('qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE company_status AS ENUM ('active', 'inactive', 'prospect');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task');
CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'under_review', 'approved', 'rejected', 'expired');
CREATE TYPE rfq_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE contract_status AS ENUM ('draft', 'sent', 'signed', 'active', 'completed', 'terminated');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('not_started', 'in_progress', 'completed', 'approved');
CREATE TYPE survey_status AS ENUM ('scheduled', 'in_progress', 'completed');
CREATE TYPE assessment_status AS ENUM ('draft', 'completed', 'approved');
CREATE TYPE request_type AS ENUM ('maintenance', 'procurement', 'inquiry', 'emergency');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE request_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete');
```
