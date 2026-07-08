# 13-Human-Resources — Capability Mapping

## Department Management (DEP-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Department, DepartmentHead, DepartmentBudget, OrgUnit
**Dependencies:** Shared Kernel (SK-01, SK-02)

## Hierarchy Management (DEP-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | Medium |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | No | Low |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | No | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Department, ParentDepartment, OrgTree, HierarchyLevel
**Dependencies:** Department Management (DEP-01)

## Budget Management (DEP-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | Medium |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | High |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Medium |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Department, BudgetLine, HeadcountBudget, SalaryBudget, BudgetPeriod
**Dependencies:** Department Management (DEP-01), Financial Control (GL-01)

## Employee Records (EMP-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Employee, EmployeeProfile, ContactInfo, JobInfo, EmergencyContact
**Dependencies:** Department Management (DEP-01), Shared Kernel (SK-01, SK-02)

## Employee Lifecycle (EMP-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Employee, EmployeeStatus, StatusTransition, TerminationRecord, RehireRecord
**Dependencies:** Employee Records (EMP-01)

## Document Management (EMP-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | Medium |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | Medium |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | No | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Medium |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Employee, EmployeeDocument, DocumentType, ExpiryDate, Certificate
**Dependencies:** Employee Records (EMP-01), Document Management (DOC-01)

## Emergency Contacts (EMP-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Low |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | Low |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | No | Low |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | No | Low |
| Reports | 13-HUMAN-RESOURCES/Reports.md | No | Low |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | No | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 11
**Key Entities:** Employee, EmergencyContact, Relationship, BloodGroup
**Dependencies:** Employee Records (EMP-01)

## Check-in/Check-out (ATT-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Medium |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Attendance, CheckIn, CheckOut, AttendanceDate, Location
**Dependencies:** Employee Records (EMP-01)

## Schedule Management (ATT-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Schedule, Shift, ShiftAssignment, WorkPattern, Calendar
**Dependencies:** Employee Records (EMP-01), Department Management (DEP-01)

## Attendance Report (ATT-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | Medium |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | No | Low |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | High |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Medium |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Attendance, AttendanceSummary, Department, DateRange
**Dependencies:** Check-in/Check-out (ATT-01), Schedule Management (ATT-02)

## Anomaly Detection (ATT-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | High |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Attendance, AnomalyFlag, LateArrival, EarlyDeparture, MissingCheckIn
**Dependencies:** Check-in/Check-out (ATT-01), Schedule Management (ATT-02)

## Leave Request (LVE-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** LeaveRequest, LeaveType, LeavePeriod, Employee, LeaveBalance
**Dependencies:** Employee Records (EMP-01), Leave Balance Tracking (LVE-03)

## Leave Approval Workflow (LVE-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | No | Low |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** LeaveRequest, ApprovalStatus, Approver, ApprovalChain, RejectionReason
**Dependencies:** Leave Request (LVE-01), Shared Kernel (SK-03, SK-05)

## Leave Balance Tracking (LVE-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** LeaveBalance, LeaveAccrual, LeaveType, CarryOver, Consumption
**Dependencies:** Employee Records (EMP-01), Shared Kernel (SK-01, SK-02)

## Leave Calendar (LVE-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Low |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | Low |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | High |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | High |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | No | Low |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | No | Low |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Low |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | No | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 12
**Key Entities:** LeaveRequest, Employee, CalendarView, Team, DateRange
**Dependencies:** Leave Request (LVE-01), Leave Balance Tracking (LVE-03)

## Timesheet Entry (TS-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Timesheet, TimeEntry, Project, Task, Employee, WorkHours
**Dependencies:** Employee Records (EMP-01), Project Delivery (PRJ-03)

## Timesheet Approval (TS-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Timesheet, ApprovalStatus, Approver, ApprovalAction, Manager
**Dependencies:** Timesheet Entry (TS-01), Shared Kernel (SK-03, SK-05)

## Project Cost Allocation (TS-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | No | Low |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | High |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Medium |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Timesheet, CostAllocation, ProjectCost, HourlyRate, CostLine
**Dependencies:** Timesheet Approval (TS-02), Financial Control (PA-02)

## Timesheet Reports (TS-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Low |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | Low |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | No | Low |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | High |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Medium |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Timesheet, ReportSummary, EmployeeHours, ProjectHours, DepartmentHours
**Dependencies:** Timesheet Entry (TS-01), Timesheet Approval (TS-02)

## Payroll Data Export (PRL-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | Medium |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** PayrollExport, PayrollLine, Employee, Timesheet, Leave, Deduction
**Dependencies:** Timesheet Approval (TS-02), Leave Approval Workflow (LVE-02), Salary Structure (PRL-02)

## Salary Structure (PRL-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | Low |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | No | Low |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | No | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** SalaryStructure, PayGrade, Allowance, Deduction, TaxRule
**Dependencies:** Employee Records (EMP-01), Financial Control (GL-01)

## Job Posting (REC-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Low |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | Low |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** JobPosting, JobTitle, Department, JobDescription, PostingStatus
**Dependencies:** Department Management (DEP-01)

## Application Management (REC-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | High |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Application, Candidate, Resume, Interview, OfferLetter
**Dependencies:** Job Posting (REC-01)

## Performance Reviews (PRF-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | High |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | High |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | High |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | High |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Medium |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Medium |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | High |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | High |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | High |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** ReviewCycle, PerformanceReview, Goal, Rating, ReviewFeedback
**Dependencies:** Employee Records (EMP-01), Department Management (DEP-01)

## Employee Feedback (PRF-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 13-HUMAN-RESOURCES/Business-Overview.md | Yes | High |
| Business Capabilities | 13-HUMAN-RESOURCES/Business-Capabilities.md | Yes | High |
| Workflows | 13-HUMAN-RESOURCES/Workflows.md | Yes | Medium |
| Business Rules | 13-HUMAN-RESOURCES/Business-Rules.md | Yes | Medium |
| Roles | 13-HUMAN-RESOURCES/Roles.md | Yes | Medium |
| Permissions | 13-HUMAN-RESOURCES/Permissions.md | Yes | Medium |
| Screens | 13-HUMAN-RESOURCES/Screens.md | Yes | Low |
| Components | 13-HUMAN-RESOURCES/Components.md | Yes | Low |
| Database | 13-HUMAN-RESOURCES/Database.md | Yes | High |
| APIs | 13-HUMAN-RESOURCES/APIs.md | Yes | High |
| Events | 13-HUMAN-RESOURCES/Events.md | Yes | High |
| Notifications | 13-HUMAN-RESOURCES/Notifications.md | Yes | High |
| Reports | 13-HUMAN-RESOURCES/Reports.md | Yes | Medium |
| KPIs | 13-HUMAN-RESOURCES/KPIs.md | Yes | Medium |
| AI Opportunities | 13-HUMAN-RESOURCES/AI-Opportunities.md | Yes | High |
| Testing | 13-HUMAN-RESOURCES/Testing.md | Yes | High |
| Acceptance Criteria | 13-HUMAN-RESOURCES/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Feedback, FeedbackType, Recognition, Sender, Recipient
**Dependencies:** Employee Records (EMP-01), Performance Reviews (PRF-01)
