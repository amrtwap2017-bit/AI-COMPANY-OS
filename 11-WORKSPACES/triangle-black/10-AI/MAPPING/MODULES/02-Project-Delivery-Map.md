# Project Delivery Module Map

## Scope
Project creation and setup, milestone planning and tracking, engineering design and change control, NCR management, daily reporting, project close-out, variation management, and subcontractor management.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Project Creation | 5 | 220 |
| Milestone Management | 6 | 280 |
| Engineering Management | 5 | 260 |
| NCR Management | 6 | 240 |
| Daily Report Management | 5 | 190 |
| Project Close-Out | 5 | 210 |
| Variation Management | 5 | 230 |
| Subcontractor Management | 4 | 180 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/02-Project-Delivery-Domain.md` — Full project delivery domain spec
- `03-FEATURES/05-Project-Management.md` — Project management feature spec
- `03-FEATURES/06-Milestone-Tracking.md` — Milestone tracking feature spec
- `03-FEATURES/07-NCR-Management.md` — NCR management feature spec
- `03-FEATURES/08-Daily-Reporting.md` — Daily reporting feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 8 |
| Frontend pages | Next.js pages | 22 |
| Database tables | Prisma models | 20 |
| API endpoints | REST routes | 52 |
| Test files | spec/test files | 65 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Project | Project | Core project record with status, dates |
| Milestone | Milestone | Project milestone with dependencies |
| EngineeringItem | EngineeringItem | Engineering design record |
| NCR | NCR | Non-conformance report |
| DailyReport | DailyReport | Daily site report |
| Variation | Variation | Change order/variation |
| Subcontractor | Subcontractor | Subcontractor record |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /projects | GET/POST | List and create projects |
| /projects/:id | GET/PUT | Read and update project |
| /milestones | GET/POST | List and create milestones |
| /milestones/:id/status | PATCH | Update milestone status |
| /engineering | GET/POST | List and create engineering items |
| /ncrs | GET/POST | List and create NCRs |
| /ncrs/:id/close | POST | Close NCR |
| /daily-reports | GET/POST | List and create daily reports |
| /variations | GET/POST | List and create variations |
| /projects/:id/close-out | GET/POST | Manage project close-out |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /projects | ProjectList, ProjectForm, ProjectDetail | Project management |
| /projects/:id/milestones | MilestoneList, MilestoneGanttView | Milestone tracking |
| /projects/:id/engineering | EngineeringList, EngineeringForm | Engineering management |
| /projects/:id/ncrs | NCRList, NCRForm, NCRAnalysis | NCR management |
| /projects/:id/daily-reports | DailyReportForm, DailyReportList | Daily reporting |
| /projects/:id/close-out | CloseOutForm, CloseOutChecklist | Project close-out |
| /projects/:id/variations | VariationList, VariationForm | Variation management |
| /subcontractors | SubcontractorList, SubcontractorForm | Subcontractor management |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| ProjectPlanGeneratorAI | Generate project plans from templates |
| MilestoneDelayPredictionAI | Predict milestone delays |
| ChangeImpactAI | Assess change request impact |
| NCRAutoClassificationAI | Auto-classify NCRs |
| DailyReportAutoGenerationAI | Auto-generate daily reports |
| VariationImpactPredictionAI | Predict variation impact |

## Estimated Sprint Allocation: 6 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Commercial — Weak (contracts → project activation)
- Inventory — Weak (stock consumption allocation)
- Financial Control — Weak (budget tracking)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E tests for project lifecycle
- Prisma — Schema validation
- SonarQube — Code quality gate
