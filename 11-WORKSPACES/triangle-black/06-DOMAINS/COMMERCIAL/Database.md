# 01-COMMERCIAL — Database Schema

## Tables (extends Phase 5 Prisma schema)

### leads
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| first_name | VARCHAR(100) | Not null |
| last_name | VARCHAR(100) | Not null |
| email | VARCHAR(255) | Nullable |
| phone | VARCHAR(50) | Nullable |
| company_name | VARCHAR(255) | Nullable |
| job_title | VARCHAR(100) | Nullable |
| source | ENUM | website, referral, event, cold_outreach, other |
| status | ENUM | new, contacted, qualified, disqualified, converted |
| score | INTEGER | 0-100 |
| assigned_to | UUID FK | Nullable |
| notes | TEXT | Nullable |
| converted_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| created_by | UUID FK | — |
| updated_by | UUID FK | — |
| deleted_at | TIMESTAMPTZ | Soft delete |

### opportunities
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| lead_id | UUID FK | Nullable |
| company_id | UUID FK | Required |
| name | VARCHAR(255) | Not null |
| value | DECIMAL(12,2) | Estimated value |
| stage | ENUM | qualification, needs_analysis, proposal, negotiation, closed_won, closed_lost |
| probability | INTEGER | 0-100 |
| close_date | DATE | Expected close |
| assigned_to | UUID FK | Nullable |
| lost_reason | TEXT | Nullable, required if closed_lost |
| source | VARCHAR(50) | Original lead source |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| deleted_at | TIMESTAMPTZ | — |

### companies (existing)
| Extended columns | Type | Notes |
|-----------------|------|-------|
| type | ENUM | hotel, resort, restaurant, commercial |
| classification | ENUM | luxury, midscale, economy, budget |
| rooms_count | INTEGER | For hotels |
| year_established | INTEGER | — |
| region | VARCHAR(100) | Egypt region |
| tags | TEXT[] | Segment tags |

### site_surveys
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| opportunity_id | UUID FK | Required |
| surveyor_id | UUID FK | Engineer |
| scheduled_date | DATE | — |
| completed_date | DATE | Nullable |
| status | ENUM | scheduled, in_progress, completed, approved |
| findings | JSONB | Structured findings |
| photos | JSONB | Photo URLs + metadata |
| measurements | JSONB | Measurement data |
| recommendations | TEXT | — |
| risk_level | ENUM | low, medium, high |
| report_path | VARCHAR(500) | Generated report |
| approved_by | UUID FK | Nullable |
| approved_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| deleted_at | TIMESTAMPTZ | — |

### quotation_line_items_extended
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| quotation_id | UUID FK | — |
| category | ENUM | material, labor, equipment, transport, other |
| description | VARCHAR(500) | — |
| quantity | DECIMAL(10,2) | — |
| unit | VARCHAR(50) | m, m2, unit, day, hour, kg, ton |
| unit_price | DECIMAL(12,2) | — |
| cost_price | DECIMAL(12,2) | For margin calculation |
| discount_percent | DECIMAL(5,2) | — |
| margin_percent | DECIMAL(5,2) | Auto-calculated |
| total | DECIMAL(12,2) | — |
| sort_order | INTEGER | — |
| notes | TEXT | Nullable |

### contracts_extended
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| quotation_id | UUID FK | — |
| company_id | UUID FK | — |
| project_id | UUID FK | Created on activation |
| title | VARCHAR(255) | — |
| number | VARCHAR(50) | Unique, CNT-{YYYY}-{XXXXX} |
| status | ENUM | draft, sent, signed, active, completed, terminated |
| value | DECIMAL(12,2) | — |
| start_date | DATE | — |
| end_date | DATE | — |
| signed_at | TIMESTAMPTZ | — |
| terminated_at | TIMESTAMPTZ | — |
| terminated_reason | TEXT | — |
| terms | TEXT | Terms and conditions |
| notes | TEXT | — |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| deleted_at | TIMESTAMPTZ | — |

## Indexes (additional)

```sql
CREATE INDEX idx_leads_score ON leads(score DESC);
CREATE INDEX idx_opportunities_company ON opportunities(company_id);
CREATE INDEX idx_site_surveys_opportunity ON site_surveys(opportunity_id);
CREATE INDEX idx_site_surveys_surveyor ON site_surveys(surveyor_id);
CREATE INDEX idx_contracts_company ON contracts(company_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```
