# Context Pack: HR Timesheets & Leave

**Pack ID:** CP-HR-Timesheets
**Version:** 1.0
**Domain:** HR
**Sprint:** 020

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/09-HR/HR-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/09-HR/Leave-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/HR-Leave-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Leave-Policy-Rules.md` | Backend Lead AI |
| 5 | Timesheet Management | `../02-DOMAIN-DOCS/09-HR/Timesheet-Management.md` | Backend Lead AI |
| 6 | Attendance Tracking | `../02-DOMAIN-DOCS/09-HR/Attendance-Tracking.md` | Solution Architect AI |
| 7 | Leave Policies | `../02-DOMAIN-DOCS/09-HR/Leave-Policies.md` | Business Analyst AI |
| 8 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 9 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |
| 10 | Coding Standards | `../04-STANDARDS/Coding-Standards.md` | All Agents |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| LeaveRequest | `hr_leave_requests` | id, employee_id, leave_type_id, start_date, end_date, days, reason, status, approved_by, approved_at, created_at | Database Architect AI |
| LeaveType | `hr_leave_types` | id, name, code, paid, days_per_year, requires_approval, carry_forward, is_active | Database Architect AI |
| LeaveBalance | `hr_leave_balances` | id, employee_id, leave_type_id, total_days, used_days, pending_days, remaining_days, year | Database Architect AI |
| LeavePolicy | `hr_leave_policies` | id, leave_type_id, min_days, max_days, requires_documentation, approval_chain, rules | Database Architect AI |
| Timesheet | `hr_timesheets` | id, employee_id, period_start, period_end, status, total_hours, submitted_at, approved_by, approved_at | Database Architect AI |
| TimesheetEntry | `hr_timesheet_entries` | id, timesheet_id, date, project_id, task_id, hours, description, billable | Database Architect AI |
| TimesheetApproval | `hr_timesheet_approvals` | id, timesheet_id, approver_id, status, comments, decided_at | Database Architect AI |
| AttendanceRecord | `hr_attendance` | id, employee_id, date, clock_in, clock_out, total_hours, status, notes | Database Architect AI |
| AbsenceReport | `hr_absence_reports` | id, employee_id, report_date, absence_type, reason, duration, documented_by | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/hr/leave/requests` | GET/POST | Leave requests | Backend Lead AI |
| `/api/hr/leave/requests/{id}` | GET/PUT | Request detail | Backend Lead AI |
| `/api/hr/leave/requests/{id}/submit` | POST | Submit for approval | Backend Lead AI |
| `/api/hr/leave/requests/{id}/approve` | POST | Approve/reject | Backend Lead AI |
| `/api/hr/leave/types` | GET/POST | Leave type config | Backend Lead AI |
| `/api/hr/leave/balances` | GET | Employee leave balances | Backend Lead AI |
| `/api/hr/leave/balances/{id}` | GET/PUT | Balance adjustment | Backend Lead AI |
| `/api/hr/leave/policies` | GET/POST | Leave policy rules | Backend Lead AI |
| `/api/hr/timesheets` | GET/POST | Timesheets | Backend Lead AI |
| `/api/hr/timesheets/{id}` | GET/PUT | Timesheet detail | Backend Lead AI |
| `/api/hr/timesheets/{id}/entries` | GET/POST/PUT | Time entries | Backend Lead AI |
| `/api/hr/timesheets/{id}/submit` | POST | Submit timesheet | Backend Lead AI |
| `/api/hr/timesheets/{id}/approve` | POST | Approve/reject | Backend Lead AI |
| `/api/hr/timesheets/current` | GET | Current period timesheet | Backend Lead AI |
| `/api/hr/attendance` | GET/POST | Attendance records | Backend Lead AI |
| `/api/hr/attendance/clock-in` | POST | Clock in | Backend Lead AI |
| `/api/hr/attendance/clock-out` | POST | Clock out | Backend Lead AI |
| `/api/hr/reports/absence` | GET | Absence report | Backend Lead AI |
| `/api/hr/reports/leave-utilization` | GET | Leave utilization | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/hr/leave` | Leave request list | Frontend Lead AI |
| `/hr/leave/new` | Create leave request | Frontend Lead AI |
| `/hr/leave/{id}` | Leave request detail | Frontend Lead AI |
| `/hr/leave/types` | Leave type configuration | Frontend Lead AI |
| `/hr/leave/balances` | Leave balances view | Frontend Lead AI |
| `/hr/leave/policies` | Leave policy rules | Frontend Lead AI |
| `/hr/timesheets` | Timesheet list | Frontend Lead AI |
| `/hr/timesheets/new` | Create timesheet | Frontend Lead AI |
| `/hr/timesheets/{id}` | Timesheet with entries | Frontend Lead AI |
| `/hr/timesheets/{id}/approvals` | Approval view | Frontend Lead AI |
| `/hr/timesheets/current` | Current week timesheet | Frontend Lead AI |
| `/hr/attendance` | Attendance dashboard | Frontend Lead AI |
| `/hr/attendance/clock` | Clock in/out interface | Frontend Lead AI |
| `/hr/reports/absence` | Absence analysis | Frontend Lead AI |
| `/hr/reports/leave-utilization` | Leave utilization report | Frontend Lead AI |

### Dependencies
- CP-HR-Employee

### Output Checklist
- [ ] Backend module with 19+ endpoints
- [ ] Frontend pages with 15+ components
- [ ] Database migration (9 tables)
- [ ] Unit tests (65 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 14
- **Frontend files:** 18
- **Test files:** 24
- **Document files:** 4
- **Total sprint effort:** 22 days
