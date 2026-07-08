# AI Copilots Module Map

## Scope
AI-powered copilot agents across domains: executive, sales, procurement, engineering, projects, knowledge, and maintenance. Each copilot provides natural language query, recommendations, and domain-specific intelligence.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Executive Copilot | 5 | 250 |
| Sales Copilot | 5 | 230 |
| Procurement Copilot | 5 | 210 |
| Engineering Copilot | 4 | 200 |
| Project Copilot | 5 | 220 |
| Knowledge Copilot | 4 | 190 |
| Maintenance Copilot | 4 | 200 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/10-AI-Copilots-Domain.md` — Full AI copilots domain spec
- `04-AI/01-AI-Architecture.md` — AI infrastructure and agent design
- `04-AI/02-Copilot-Design.md` — Copilot interaction patterns
- `04-AI/03-Model-Strategy.md` — LLM model strategy and selection

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 7 |
| Frontend pages | Next.js pages | 7 |
| Database tables | Prisma models | 6 |
| API endpoints | REST routes | 28 |
| Test files | spec/test files | 35 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| AIConversation | AIConversation | Copilot conversation session |
| AIQuery | AIQuery | User query record |
| AIResponse | AIResponse | AI response record |
| AIRecommendation | AIRecommendation | Generated recommendation |
| AIInsight | AIInsight | Extracted insight |
| KnowledgeSource | KnowledgeSource | Indexed knowledge source |
| SearchResult | SearchResult | Knowledge search result |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /ai/executive/query | POST | Query executive copilot |
| /ai/executive/summary | GET | Get executive summary |
| /ai/sales/score-lead | POST | Score a lead |
| /ai/sales/next-best-action | POST | Get next best action |
| /ai/procurement/recommend-supplier | POST | Recommend supplier |
| /ai/engineering/validate-design | POST | Validate design |
| /ai/projects/assess-health | POST | Assess project health |
| /ai/projects/predict-risk | POST | Predict project risk |
| /ai/knowledge/search | POST | Semantic knowledge search |
| /ai/maintenance/predict-failure | POST | Predict equipment failure |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /ai/copilot/executive | ExecutiveCopilotChat, InsightView | Executive copilot UI |
| /ai/copilot/sales | SalesCopilotChat, LeadScoreView | Sales copilot UI |
| /ai/copilot/procurement | ProcurementCopilotChat, InsightView | Procurement copilot UI |
| /ai/copilot/engineering | EngineeringCopilotChat, DesignView | Engineering copilot UI |
| /ai/copilot/projects | ProjectCopilotChat, HealthView | Project copilot UI |
| /ai/copilot/knowledge | KnowledgeCopilotChat, SearchView | Knowledge copilot UI |
| /ai/copilot/maintenance | MaintenanceCopilotChat, AssetHealthView | Maintenance copilot UI |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| ExecutiveCopilotAI | Strategic Q&A and insights |
| NaturalLanguageQueryAI | Convert NL to structured queries |
| LeadScoringAI | Score and rank leads |
| NextBestActionAI | Suggest next sales actions |
| EmailDraftAI | Draft sales emails |
| SupplierRecommendationAI | Recommend suppliers |
| SpendAnalysisAI | Analyze procurement spend |
| MarketIntelligenceAI | Market trend analysis |
| DesignValidationAI | Validate engineering designs |
| ChangeImpactAI | Assess change request impact |
| SpecificationAI | Generate specifications |
| ProjectHealthAI | Assess project health |
| RiskPredictionAI | Predict project risks |
| ResourceOptimizationAI | Optimize resource allocation |
| SemanticSearchAI | Semantic document search |
| DocumentSummaryAI | Summarize documents |
| KnowledgeGraphAI | Build and query knowledge graph |
| FailurePredictionAI | Predict equipment failure |
| RepairRecommendationAI | Recommend repair actions |
| AssetHealthAI | Assess asset health |

## Estimated Sprint Allocation: 4 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- All domains — Strong (copilots consume domain data)
- Executive Intelligence — Weak (dashboard integration)
- Document Management — Weak (knowledge copilot sources)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for copilot chat flow
- Prisma — Schema validation
- OWASP — Security scanning (AI data access)
- k6 — Performance testing (API latency)
