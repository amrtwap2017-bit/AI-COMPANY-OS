# Human Resources Module Map

## Scope
Employee lifecycle management, department hierarchy, leave request and approval, timesheet entry and approval, attendance tracking, payroll processing, recruitment pipeline, and training management.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Employee Management | 6 | 260 |
| Department Management | 4 | 160 |
| Leave Management | 5 | 220 |
| Timesheet Management | 5 | 240 |
| Attendance Management | 5 | 210 |
| Payroll Management | 5 | 250 |
| Recruitment Management | 5 | 230 |
| Training Management | 4 | 170 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/13-Human-Resources-Domain.md` — Full human resources domain spec
- `03-FEATURES/27-Employee-Management.md` — Employee management feature spec
- `03-FEATURES/28-Leave-Management.md` — Leave management feature spec
- `03-FEATURES/29-Timesheet-Management.md` — Timesheet management feature spec
- `03-FEATURES/30-Payroll-Management.md` — Payroll management feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 8 |
| Frontend pages | Next.js pages | 20 |
| Database tables | Prisma models | 18 |
| API endpoints | REST routes | 46 |
| Test files | spec/test files | 56 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Employee | Employee | Employee master record |
| Department | Department | Department with hierarchy |
| LeaveRequest | LeaveRequest | Leave application |
| LeaveBalance | LeaveBalance | Leave entitlement balance |
| Timesheet | Timesheet | Weekly timesheet |
| TimesheetEntry | TimesheetEntry | Daily time entry |
| AttendanceRecord | AttendanceRecord | Clock-in/out record |
| ShiftSchedule | ShiftSchedule | Shift assignment |
| PayrollRun | PayrollRun | Payroll processing batch |
| PaySlip | PaySlip | Employee payslip |
| JobPosting | JobPosting | Open position |
| Candidate | Candidate | Job applicant |
| TrainingCourse | TrainingCourse | Training offering |
| TrainingEnrollment | TrainingEnrollment | Course enrollment |
| Skill | Skill | Employee skill record |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /employees | GET/POST | List and create employees |
| /employees/:id | GET/PUT | Read and update employee |
| /employees/:id/onboard | POST | Onboard employee |
| /departments | GET/POST | List and create departments |
| /leaves | GET/POST | List and create leave requests |
| /leaves/:id/approve | POST | Approve leave request |
| /leaves/balance | GET | Get leave balances |
| /timesheets | GET/POST | List and create timesheets |
| /timesheets/:id/submit | POST | Submit timesheet |
| /timesheets/:id/approve | POST | Approve timesheet |
| /attendance/clock-in | POST | Clock in |
| /attendance/clock-out | POST | Clock out |
| /payroll | GET/POST | List and create payroll runs |
| /payroll/:id/process | POST | Process payroll |
| /payroll/:id/payslip | GET | Get payslip |
| /recruitment/jobs | GET/POST | List and post jobs |
| /recruitment/candidates | GET/POST | List and add candidates |
| /training/courses | GET/POST | List and create courses |
| /training/enroll | POST | Enroll in course |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /hr/employees | EmployeeList, EmployeeForm, OrgChartView | Employee management |
| /hr/departments | DepartmentList, DepartmentForm | Department management |
| /hr/leaves | LeaveRequestForm, LeaveCalendarView | Leave management |
| /hr/timesheets | TimesheetForm, TimesheetListView | Timesheet management |
| /hr/attendance | AttendanceClockView, AttendanceLogView | Attendance tracking |
| /hr/payroll | PayrollList, PayrollRunForm, PaySlipView | Payroll management |
| /hr/recruitment | JobPostingList, CandidateListView | Recruitment management |
| /hr/training | CourseCatalogView, EnrollmentView | Training management |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| EmployeeTurnoverPredictionAI | Predict employee turnover risk |
| DepartmentOptimizationAI | Optimize department structure |
| LeaveForecastAI | Forecast leave demand |
| TimesheetAnomalyDetectionAI | Detect timesheet anomalies |
| AttendancePatternAI | Analyze attendance patterns |
| PayrollAnomalyDetectionAI | Detect payroll anomalies |
| CandidateMatchingAI | Match candidates to jobs |
| ResumeParsingAI | Parse and extract resume data |
| LearningRecommendationAI | Recommend training courses |

## Estimated Sprint Allocation: 4 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Project Delivery — Weak (timesheet → project cost allocation)
- Financial Control — Weak (payroll → GL integration)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for leave→timesheet→payroll flow
- Prisma — Schema validation
- OWASP — Security scanning (PII data)
