# 13-HUMAN-RESOURCES — Business Rules

## Employee Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| EMP-R01 | National ID must be unique within tenant | Unique constraint |
| EMP-R02 | Email must be unique within tenant | Unique constraint |
| EMP-R03 | Age must be ≥ legal working age (18) | Validation |
| EMP-R04 | Employee must belong to a department | FK constraint |
| EMP-R05 | Terminated employee cannot be assigned to projects | State machine |
| EMP-R06 | Employee status lifecycle: pending→active→terminated | State machine |

## Department Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| DEP-R01 | Department name must be unique within tenant | Unique constraint |
| DEP-R02 | Department head must be an active employee | FK + status check |
| DEP-R03 | Circular hierarchy not allowed (self-referencing) | Validation |
| DEP-R04 | Department cannot be deleted with active employees | Soft delete |

## Leave Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| LVE-R01 | Leave end date must be ≥ start date | Validation |
| LVE-R02 | Cannot apply for leave without sufficient balance | Validation |
| LVE-R03 | Annual leave balance: 21 days/year (Egypt labor law) | Service logic |
| LVE-R04 | Sick leave requires ≥ 1 day notice except emergency | Validation |
| LVE-R05 | Consecutive leave capped at 15 working days max | Validation |
| LVE-R06 | Public holidays cannot be submitted as leave | Calendar check |
| LVE-R07 | Approved leave locks timesheet period | State machine |

## Timesheet Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| TS-R01 | Weekly hours cannot exceed 48 (Egypt labor law) | Validation |
| TS-R02 | Overtime > 48h requires manager approval | Workflow |
| TS-R03 | Timesheet must have at least 1 entry per working day | Validation |
| TS-R04 | Submitted timesheet cannot be edited | State machine |
| TS-R05 | Approved timesheet cannot be deleted | Soft delete |
| TS-R06 | Project hours must link to active project | FK + status check |

## Attendance Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| ATT-R01 | Check-in must precede check-out | Validation |
| ATT-R02 | Same-day duplicate check-in not allowed | Validation |
| ATT-R03 | Grace period: 15 minutes late allowed | Service logic |
| ATT-R04 | Early departure = 30+ minutes before shift end | Service logic |
