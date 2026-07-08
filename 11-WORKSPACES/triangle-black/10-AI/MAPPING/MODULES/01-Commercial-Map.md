# Commercial Module Map

## Scope
Customer relationship management, lead and opportunity tracking, survey management, quotation generation, contract lifecycle, and customer portal.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Lead Management | 5 | 250 |
| Opportunity Management | 6 | 320 |
| Survey Management | 4 | 180 |
| Quotation Management | 6 | 300 |
| Contract Management | 6 | 350 |
| Customer Portal | 5 | 280 |
| Customer Management | 6 | 260 |
| Communication Management | 4 | 190 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/01-Commercial-Domain.md` — Full commercial domain spec
- `03-FEATURES/01-Lead-Management.md` — Lead management feature spec
- `03-FEATURES/02-Opportunity-Management.md` — Opportunity management feature spec
- `03-FEATURES/03-Quotation-Management.md` — Quotation management feature spec
- `03-FEATURES/04-Contract-Management.md` — Contract management feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 8 |
| Frontend pages | Next.js pages | 24 |
| Database tables | Prisma models | 18 |
| API endpoints | REST routes | 48 |
| Test files | spec/test files | 60 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Lead | Lead | Sales lead with source, status, score |
| Opportunity | Opportunity | Sales opportunity with stage, value, probability |
| Quotation | Quotation | Customer quote with line items, terms |
| Contract | Contract | Legal agreement with clauses, parties |
| Customer | Customer | Customer 360 record with contacts |
| Survey | Survey | Customer survey with questions, responses |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /leads | GET/POST | List and create leads |
| /leads/:id | GET/PUT | Read and update lead |
| /opportunities | GET/POST | List and create opportunities |
| /opportunities/:id/stage | PATCH | Update opportunity stage |
| /quotations | GET/POST | List and create quotations |
| /quotations/:id/approve | POST | Approve quotation |
| /contracts | GET/POST | List and create contracts |
| /contracts/:id/renew | POST | Renew contract |
| /customers | GET/POST | List and create customers |
| /surveys/:id/responses | POST | Submit survey response |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /commercial/leads | LeadList, LeadForm, LeadDetail | Lead management |
| /commercial/opportunities | OpportunityList, PipelineView, OpportunityDetail | Pipeline management |
| /commercial/quotations | QuoteList, QuoteForm, QuoteDetail | Quotation management |
| /commercial/contracts | ContractList, ContractForm, ContractDetail | Contract management |
| /commercial/customers | CustomerList, CustomerDetail, Customer360 | Customer management |
| /portal | PortalDashboard, PortalProjects, PortalDocuments | Customer self-service |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| LeadScoringAI | Score and prioritize leads |
| OpportunityScoringAI | Predict opportunity win probability |
| QuoteOptimizationAI | Optimize quotation pricing |
| ContractRiskAI | Assess contract risk |
| CustomerChurnPredictionAI | Predict customer churn |

## Estimated Sprint Allocation: 5 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Document Management — Weak (contract documents)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E tests for critical flows
- Prisma — Schema validation
