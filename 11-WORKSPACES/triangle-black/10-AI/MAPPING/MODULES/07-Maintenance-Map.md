# Maintenance Module Map

## Scope
Asset registry and lifecycle, preventive maintenance scheduling, corrective maintenance work requests, work order management, SLA tracking, and spare parts management.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Asset Management | 5 | 230 |
| Preventive Maintenance | 5 | 250 |
| Corrective Maintenance | 5 | 220 |
| Work Order Management | 6 | 280 |
| SLA Management | 5 | 200 |
| Spare Parts Management | 4 | 180 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/07-Maintenance-Domain.md` — Full maintenance domain spec
- `03-FEATURES/19-Maintenance-Management.md` — Maintenance management feature spec
- `03-FEATURES/20-Asset-Management.md` — Asset management feature spec
- `03-FEATURES/21-Work-Order-Management.md` — Work order management feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 6 |
| Frontend pages | Next.js pages | 18 |
| Database tables | Prisma models | 16 |
| API endpoints | REST routes | 42 |
| Test files | spec/test files | 52 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Asset | Asset | Physical asset registry |
| AssetCategory | AssetCategory | Asset classification |
| PreventiveSchedule | PreventiveSchedule | PM schedule configuration |
| PreventiveTask | PreventiveTask | Generated PM task |
| CorrectiveWorkRequest | CorrectiveWorkRequest | Breakdown/work request |
| WorkOrder | WorkOrder | Maintenance work order |
| WorkOrderTask | WorkOrderTask | Individual work order task |
| SLA | SLA | Service level agreement |
| SLAViolation | SLAViolation | SLA breach record |
| SparePart | SparePart | Spare parts inventory |
| SparePartConsumption | SparePartConsumption | Spare part usage record |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /assets | GET/POST | List and create assets |
| /assets/:id | GET/PUT | Read and update asset |
| /assets/:id/dispose | POST | Dispose asset |
| /maintenance/preventive | GET/POST | List and create PM schedules |
| /maintenance/preventive/:id/generate-tasks | POST | Generate PM tasks |
| /maintenance/corrective | GET/POST | List and create work requests |
| /work-orders | GET/POST | List and create work orders |
| /work-orders/:id/start | POST | Start work order |
| /work-orders/:id/complete | POST | Complete work order |
| /slas | GET/POST | List and create SLAs |
| /slas/:id/check-compliance | POST | Check SLA compliance |
| /spare-parts | GET/POST | List and create spare parts |
| /spare-parts/:id/reorder | POST | Trigger reorder |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /maintenance/assets | AssetList, AssetForm, AssetDetail | Asset management |
| /maintenance/preventive | PMScheduleList, PMCalendarView | Preventive maintenance |
| /maintenance/corrective | WorkRequestList, WorkRequestForm | Corrective maintenance |
| /maintenance/work-orders | WOList, WOForm, WOResourceView | Work order management |
| /maintenance/slas | SLAForm, SLAComplianceView | SLA management |
| /maintenance/spare-parts | SparePartList, SparePartForm | Spare parts management |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| AssetLifecyclePredictionAI | Predict asset end-of-life |
| PMSchedulingOptimizationAI | Optimize PM schedules |
| BreakdownPredictionAI | Predict equipment breakdowns |
| WOResourceOptimizationAI | Optimize work order resources |
| SLACompliancePredictionAI | Predict SLA compliance |
| SparePartDemandForecastAI | Forecast spare part demand |

## Estimated Sprint Allocation: 4 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Inventory — Weak (spare parts inventory)
- Project Delivery — Weak (NCR → work order)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for work order lifecycle
- Prisma — Schema validation
