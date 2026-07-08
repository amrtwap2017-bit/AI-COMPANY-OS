# 02-Project-Delivery — Capability Mapping

## Project Creation (PRJ-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | Low |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, ProjectType, ProjectStatus, Contract, ProjectManager
**Dependencies:** Commercial (CTR-01), Shared Kernel (SK-01, SK-02)

## Milestone Management (PRJ-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | High |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, Milestone, MilestoneDate, MilestoneApproval, MilestoneStatus
**Dependencies:** Project Creation (PRJ-01), Financial Control (REV-01)

## Task Management (PRJ-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | High |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | High |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, Task, TaskAssignment, TaskStatus, TaskPriority, TaskType
**Dependencies:** Project Creation (PRJ-01), Milestone Management (PRJ-02)

## Gantt/Schedule (PRJ-04)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | Medium |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | Medium |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | High |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | High |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | Medium |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, Task, GanttItem, Dependency, ScheduleBaseline, CriticalPath
**Dependencies:** Task Management (PRJ-03), Milestone Management (PRJ-02)

## Team Allocation (RES-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | Medium |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, TeamMember, Role, Allocation, ResourceSkill
**Dependencies:** Project Creation (PRJ-01), Human Resources (EMP-01)

## Equipment Tracking (RES-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | Medium |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | Medium |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | Medium |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, Equipment, EquipmentAssignment, EquipmentType, MaintenanceSchedule
**Dependencies:** Team Allocation (RES-01), Maintenance (MNT-01)

## Timesheet Entry (TIM-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | Medium |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | Medium |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | Medium |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Timesheet, TimesheetEntry, TimeLog, Project, Task, TeamMember
**Dependencies:** Task Management (PRJ-03), Team Allocation (RES-01)

## Timesheet Approval (TIM-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Low |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Low |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | Medium |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | No | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 16
**Key Entities:** Timesheet, ApprovalStatus, Approver, ApprovalAction
**Dependencies:** Timesheet Entry (TIM-01), Shared Kernel (SK-03, SK-05)

## Inspection Checklist (QLT-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | Medium |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | Medium |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, InspectionChecklist, ChecklistItem, InspectionResult, Inspector
**Dependencies:** Project Creation (PRJ-01)

## Non-Conformance Report (QLT-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | High |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | High |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** NCR, NCRType, NCRAction, NCRAssignment, ClosureVerification
**Dependencies:** Inspection Checklist (QLT-01)

## Quality Audit (QLT-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Low |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Low |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** QualityAudit, AuditSchedule, AuditFinding, AuditScore, AuditReport
**Dependencies:** Non-Conformance Report (QLT-02)

## Risk Register (RSK-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | High |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Risk, RiskCategory, RiskSeverity, RiskMitigation, RiskOwner
**Dependencies:** Project Creation (PRJ-01)

## Daily Site Report (SIT-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | Medium |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | Medium |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | Medium |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Medium |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** SiteReport, DailyLog, ResourceLog, WeatherCondition, SiteIssue
**Dependencies:** Task Management (PRJ-03), Team Allocation (RES-01)

## Site Diary (SIT-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | Medium |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | Medium |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | Medium |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | Medium |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Low |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Low |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | Medium |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | No | Low |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | No | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | No | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** SiteDiary, DiaryEntry, DiaryCategory, ActivityLog
**Dependencies:** Daily Site Report (SIT-01)

## Photo Documentation (SIT-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | Medium |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | Medium |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | Medium |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | Medium |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Low |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | Medium |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | No | Low |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | Medium |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | No | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 15
**Key Entities:** Photo, GeoTag, PhotoAlbum, PhotoCategory, ProgressPhoto
**Dependencies:** Daily Site Report (SIT-01), Mobile (MOB-05)

## Handover Preparation (HND-01)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, HandoverDocument, SnagList, HandoverChecklist, AsBuilt
**Dependencies:** Quality Audit (QLT-03), Document Management (DOC-01)

## Client Training (HND-02)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | Medium |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Low |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Low |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | Medium |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | Low |
| Events | 02-PROJECT-DELIVERY/Events.md | No | Low |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | Medium |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | Medium |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | No | Low |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | No | Low |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 14
**Key Entities:** Project, TrainingSession, TrainingMaterial, Attendee, TrainingFeedback
**Dependencies:** Handover Preparation (HND-01)

## Project Closeout (HND-03)

| Document Type | Source | Required | Priority |
|---------------|--------|----------|----------|
| Business Overview | 02-PROJECT-DELIVERY/Business-Overview.md | Yes | High |
| Business Capabilities | 02-PROJECT-DELIVERY/Business-Capabilities.md | Yes | High |
| Workflows | 02-PROJECT-DELIVERY/Workflows.md | Yes | High |
| Business Rules | 02-PROJECT-DELIVERY/Business-Rules.md | Yes | High |
| Roles | 02-PROJECT-DELIVERY/Roles.md | Yes | High |
| Permissions | 02-PROJECT-DELIVERY/Permissions.md | Yes | High |
| Screens | 02-PROJECT-DELIVERY/Screens.md | Yes | Medium |
| Components | 02-PROJECT-DELIVERY/Components.md | Yes | Medium |
| Database | 02-PROJECT-DELIVERY/Database.md | Yes | High |
| APIs | 02-PROJECT-DELIVERY/APIs.md | Yes | High |
| Events | 02-PROJECT-DELIVERY/Events.md | Yes | High |
| Notifications | 02-PROJECT-DELIVERY/Notifications.md | Yes | High |
| Reports | 02-PROJECT-DELIVERY/Reports.md | Yes | High |
| KPIs | 02-PROJECT-DELIVERY/KPIs.md | Yes | High |
| AI Opportunities | 02-PROJECT-DELIVERY/AI-Opportunities.md | Yes | Medium |
| Testing | 02-PROJECT-DELIVERY/Testing.md | Yes | High |
| Acceptance Criteria | 02-PROJECT-DELIVERY/Acceptance-Criteria.md | Yes | High |

**Total Documents:** 17
**Key Entities:** Project, CloseoutReport, LessonsLearned, FinalInvoice, ProjectArchive
**Dependencies:** Handover Preparation (HND-01), Client Training (HND-02), Financial Control (PA-01)
