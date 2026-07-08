# Context Pack: Project Delivery

**Pack ID:** CP-Project-Delivery
**Version:** 1.0
**Domain:** Project Delivery
**Sprint:** 007, 008, 009

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/02-Project-Delivery/Project-Initiation.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/02-Project-Delivery/Milestone-Planning.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Project-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Project-Rules.md` | Backend Lead AI |
| 5 | Resource Management | `../02-DOMAIN-DOCS/02-Project-Delivery/Resource-Management.md` | Solution Architect AI |
| 6 | Project Templates | `../02-DOMAIN-DOCS/02-Project-Delivery/Project-Templates.md` | Business Analyst AI |
| 7 | Engineering Execution | `../02-DOMAIN-DOCS/02-Project-Delivery/Engineering-Execution.md` | Backend Lead AI |
| 8 | Quality Control | `../02-DOMAIN-DOCS/02-Project-Delivery/Quality-Control.md` | Backend Lead AI |
| 9 | NCR Process | `../02-DOMAIN-DOCS/02-Project-Delivery/NCR-Process.md` | Backend Lead AI |
| 10 | Daily Reporting | `../02-DOMAIN-DOCS/02-Project-Delivery/Daily-Reporting.md` | Backend Lead AI |
| 11 | Project Closeout | `../02-DOMAIN-DOCS/02-Project-Delivery/Project-Closeout.md` | Solution Architect AI |
| 12 | Variation Orders | `../02-DOMAIN-DOCS/02-Project-Delivery/Variation-Orders.md` | Backend Lead AI |
| 13 | Handover Process | `../02-DOMAIN-DOCS/02-Project-Delivery/Handover-Process.md` | Solution Architect AI |
| 14 | Final Acceptance | `../02-DOMAIN-DOCS/02-Project-Delivery/Final-Acceptance.md` | Business Analyst AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Project | `projects` | id, contract_id, name, code, type, status, start_date, end_date, budget, manager_id, created_at | Database Architect AI |
| ProjectMilestone | `project_milestones` | id, project_id, name, description, due_date, completed_date, status, sort_order | Database Architect AI |
| ProjectTask | `project_tasks` | id, project_id, milestone_id, name, assignee_id, status, priority, due_date, estimated_hours, actual_hours | Database Architect AI |
| ProjectTeam | `project_teams` | id, project_id, name, role | Database Architect AI |
| TeamMember | `project_team_members` | id, team_id, user_id, role, allocation_percent, start_date, end_date | Database Architect AI |
| NonConformanceReport | `project_ncr` | id, project_id, number, title, severity, status, reported_by, root_cause, corrective_action, due_date | Database Architect AI |
| DailyReport | `project_daily_reports` | id, project_id, report_date, weather, work_summary, issues, safety_notes, created_by | Database Architect AI |
| VariationOrder | `project_variations` | id, project_id, number, description, amount, status, approved_by, approved_at | Database Architect AI |
| HandoverDocument | `project_handover_docs` | id, project_id, name, type, file_url, version, status | Database Architect AI |
| FinalAcceptance | `project_final_acceptance` | id, project_id, certificate_number, accepted_by, accepted_date, notes | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/projects` | GET/POST | Project list and create | Backend Lead AI |
| `/api/projects/{id}` | GET/PUT/DELETE | Project detail | Backend Lead AI |
| `/api/projects/{id}/milestones` | GET/POST | Milestone management | Backend Lead AI |
| `/api/projects/{id}/tasks` | GET/POST | Task management | Backend Lead AI |
| `/api/projects/{id}/team` | GET/POST/PUT | Team assignment | Backend Lead AI |
| `/api/projects/templates` | GET/POST | Template management | Backend Lead AI |
| `/api/projects/{id}/ncr` | GET/POST | NCR management | Backend Lead AI |
| `/api/projects/{id}/daily-reports` | GET/POST | Daily reports | Backend Lead AI |
| `/api/projects/{id}/variations` | GET/POST | Variation orders | Backend Lead AI |
| `/api/projects/{id}/handover-documents` | GET/POST | Handover docs | Backend Lead AI |
| `/api/projects/{id}/final-acceptance` | GET/POST | Final acceptance | Backend Lead AI |
| `/api/projects/{id}/complete` | POST | Mark project complete | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/projects` | Project list with filters | Frontend Lead AI |
| `/projects/new` | Create project from contract | Frontend Lead AI |
| `/projects/{id}` | Project detail/overview | Frontend Lead AI |
| `/projects/{id}/milestones` | Milestone timeline | Frontend Lead AI |
| `/projects/{id}/tasks` | Task board | Frontend Lead AI |
| `/projects/{id}/team` | Team management | Frontend Lead AI |
| `/projects/{id}/ncr` | NCR list and detail | Frontend Lead AI |
| `/projects/{id}/daily-reports` | Daily reports | Frontend Lead AI |
| `/projects/{id}/variations` | Variation orders | Frontend Lead AI |
| `/projects/{id}/handover` | Handover documents | Frontend Lead AI |
| `/projects/{id}/final-acceptance` | Final acceptance form | Frontend Lead AI |

### Dependencies
- CP-CRM-Contracts

### Output Checklist
- [ ] Backend module with 12+ endpoints
- [ ] Frontend pages with 11+ components
- [ ] Database migration (10 tables)
- [ ] Unit tests (80 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 16
- **Frontend files:** 18
- **Test files:** 30
- **Document files:** 6
- **Total sprint effort:** 28 days
