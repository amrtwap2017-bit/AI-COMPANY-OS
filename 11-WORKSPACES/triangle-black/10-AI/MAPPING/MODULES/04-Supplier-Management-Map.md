# Supplier Management Module Map

## Scope
Supplier registration and onboarding, categorization, performance scorecards, compliance management, agreements, and risk management.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Supplier Registration | 5 | 200 |
| Supplier Categorization | 4 | 160 |
| Supplier Performance | 5 | 240 |
| Supplier Compliance | 5 | 210 |
| Supplier Agreements | 5 | 230 |
| Supplier Risk Management | 5 | 220 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/04-Supplier-Management-Domain.md` — Full supplier management domain spec
- `03-FEATURES/12-Supplier-Management.md` — Supplier management feature spec
- `03-FEATURES/13-Supplier-Performance.md` — Supplier performance feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 6 |
| Frontend pages | Next.js pages | 14 |
| Database tables | Prisma models | 16 |
| API endpoints | REST routes | 36 |
| Test files | spec/test files | 42 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Supplier | Supplier | Supplier master record |
| SupplierCategory | SupplierCategory | Supplier category/segment |
| PerformanceKPI | PerformanceKPI | Supplier performance metric |
| ScorecardTemplate | ScorecardTemplate | Evaluation scorecard template |
| SupplierCompliance | SupplierCompliance | Compliance record |
| ComplianceAudit | ComplianceAudit | Compliance audit record |
| SupplierAgreement | SupplierAgreement | Agreement with terms |
| SupplierRisk | SupplierRisk | Risk assessment record |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /suppliers | GET/POST | List and register suppliers |
| /suppliers/:id | GET/PUT | Read and update supplier |
| /suppliers/:id/onboard | POST | Onboard supplier |
| /supplier-categories | GET/POST | List and create categories |
| /supplier-performance | GET/POST | List and create evaluations |
| /supplier-performance/:id/evaluate | POST | Submit evaluation |
| /supplier-compliance | GET/POST | List and create compliance records |
| /supplier-compliance/:id/audit | POST | Execute compliance audit |
| /supplier-agreements | GET/POST | List and create agreements |
| /supplier-risks | GET/POST | List and create risk records |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /suppliers | SupplierList, SupplierForm, SupplierDetail | Supplier management |
| /suppliers/:id/onboarding | OnboardingWorkflow, DocumentUpload | Supplier onboarding |
| /suppliers/categories | CategoryList, CategoryForm | Category management |
| /suppliers/:id/performance | ScorecardView, EvaluationForm | Performance evaluation |
| /suppliers/:id/compliance | ComplianceList, AuditForm | Compliance management |
| /suppliers/:id/agreements | AgreementList, AgreementForm | Agreement management |
| /suppliers/:id/risks | RiskList, RiskHeatmapView | Risk management |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| SupplierVerificationAI | Verify supplier documents |
| AutoCategorizationAI | Auto-categorize suppliers |
| PerformancePredictionAI | Predict supplier performance |
| ComplianceRiskAI | Assess compliance risk |
| AgreementRiskAI | Assess agreement risk |
| RiskPredictionAI | Predict supplier risk |

## Estimated Sprint Allocation: 3 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Procurement — Weak (used by RFQ supplier selection)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Prisma — Schema validation
- SonarQube — Code quality gate
