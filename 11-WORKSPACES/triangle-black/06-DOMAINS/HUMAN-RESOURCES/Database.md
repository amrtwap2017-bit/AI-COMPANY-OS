# 13-HUMAN-RESOURCES — Database Schema

## Tables (extends Phase 5 Prisma schema)

### departments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| parent_id | UUID FK | Nullable, self-referencing |
| name | VARCHAR(100) | Not null, unique per tenant |
| code | VARCHAR(20) | Department code (e.g., ENG-01) |
| head_employee_id | UUID FK | Department manager |
| budget_headcount | INTEGER | Budgeted headcount |
| budget_salary | DECIMAL(12,2) | Annual salary budget |
| description | TEXT | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| created_by | UUID FK | — |
| updated_by | UUID FK | — |
| deleted_at | TIMESTAMPTZ | Soft delete |

### employees
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| department_id | UUID FK | Required |
| employee_code | VARCHAR(20) | Unique per tenant (EMP-XXXXX) |
| first_name | VARCHAR(100) | — |
| last_name | VARCHAR(100) | — |
| national_id | VARCHAR(20) | Egypt National ID, unique |
| email | VARCHAR(255) | Work email, unique per tenant |
| phone | VARCHAR(20) | Mobile number |
| job_title | VARCHAR(100) | — |
| employment_type | ENUM | full_time, part_time, contract, intern |
| status | ENUM | pending, active, terminated |
| hire_date | DATE | — |
| termination_date | DATE | Nullable |
| termination_reason | TEXT | Nullable |
| salary | DECIMAL(12,2) | Monthly gross salary |
| currency | VARCHAR(3) | EGP default |
| emergency_contact_name | VARCHAR(200) | Nullable |
| emergency_contact_phone | VARCHAR(20) | Nullable |
| emergency_contact_relation | VARCHAR(50) | Nullable |
| documents | JSONB | File URLs: contract, ID, certs |
| address | TEXT | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| created_by | UUID FK | — |
| updated_by | UUID FK | — |
| deleted_at | TIMESTAMPTZ | Soft delete |

### leave_requests
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| employee_id | UUID FK | — |
| leave_type | ENUM | annual, sick, personal, maternity, paternity, hajj, unpaid |
| start_date | DATE | — |
| end_date | DATE | — |
| total_days | DECIMAL(4,1) | Calculated |
| reason | TEXT | Required |
| status | ENUM | pending, approved, rejected, cancelled |
| approved_by | UUID FK | Nullable |
| approved_at | TIMESTAMPTZ | Nullable |
| rejection_reason | TEXT | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

### leave_balances
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| employee_id | UUID FK | Unique per employee per year |
| year | INTEGER | Calendar year |
| leave_type | ENUM | annual, sick, personal |
| total_days | DECIMAL(4,1) | Entitled per year |
| used_days | DECIMAL(4,1) | Consumed |
| carried_over | DECIMAL(4,1) | From previous year |
| remaining | DECIMAL(4,1) | Computed: total + carried - used |

### timesheets
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| employee_id | UUID FK | — |
| project_id | UUID FK | Links to 02-PROJECT-DELIVERY |
| period_start | DATE | Week start (Sunday) |
| period_end | DATE | Week end (Thursday) |
| sun_hours | DECIMAL(4,1) | — |
| mon_hours | DECIMAL(4,1) | — |
| tue_hours | DECIMAL(4,1) | — |
| wed_hours | DECIMAL(4,1) | — |
| thu_hours | DECIMAL(4,1) | — |
| total_hours | DECIMAL(4,1) | Computed |
| overtime_hours | DECIMAL(4,1) | > 8h/day or > 48h/week |
| task_category | VARCHAR(50) | engineering, supervision, admin, procurement, site_work |
| description | TEXT | Work performed |
| status | ENUM | draft, submitted, approved, rejected |
| approved_by | UUID FK | Nullable |
| approved_at | TIMESTAMPTZ | Nullable |
| hourly_rate | DECIMAL(10,2) | For cost allocation |
| labor_cost | DECIMAL(12,2) | Computed: total_hours × hourly_rate |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

### attendance_records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| employee_id | UUID FK | — |
| date | DATE | — |
| check_in | TIMESTAMPTZ | — |
| check_out | TIMESTAMPTZ | Nullable |
| total_hours | DECIMAL(4,1) | Computed |
| status | ENUM | present, late, early_departure, absent, half_day |
| late_minutes | INTEGER | Computed |
| early_departure_minutes | INTEGER | Computed |
| gps_check_in | JSONB | Nullable, {lat, lng} |
| gps_check_out | JSONB | Nullable, {lat, lng} |
| notes | TEXT | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| created_by | UUID FK | — |

### payroll_records (V2)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| tenant_id | UUID FK | — |
| employee_id | UUID FK | — |
| period_month | INTEGER | — |
| period_year | INTEGER | — |
| basic_salary | DECIMAL(12,2) | — |
| allowances | DECIMAL(12,2) | — |
| deductions | DECIMAL(12,2) | — |
| overtime_pay | DECIMAL(12,2) | — |
| leave_deductions | DECIMAL(12,2) | — |
| social_insurance | DECIMAL(12,2) | — |
| tax | DECIMAL(12,2) | — |
| net_pay | DECIMAL(12,2) | Computed |
| status | ENUM | draft, computed, approved, paid |
| paid_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

## Indexes (additional)

```sql
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_national_id ON employees(national_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_timesheets_employee_period ON timesheets(employee_id, period_start);
CREATE INDEX idx_timesheets_project ON timesheets(project_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_payroll_employee_period ON payroll_records(employee_id, period_month, period_year);
```
