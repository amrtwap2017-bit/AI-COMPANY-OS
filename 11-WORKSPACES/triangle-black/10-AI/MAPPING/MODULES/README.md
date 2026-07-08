# Module Maps Overview

## Purpose
Module Maps define the structural blueprint for each domain module. They specify the sub-modules, entities, APIs, screens, AI agents, and dependencies that will be implemented in Program 3.

## How to Read a Module Map
Each module map contains these sections:

| Section | Description |
|---------|-------------|
| **Scope** | What the module covers |
| **Sub-Modules** | Breakdown of sub-modules with capability counts and doc line estimates |
| **Documents Consumed** | References to Program 1 documents used as input |
| **Documents Produced** | Artifact estimates for Program 3 delivery |
| **Key Entities** | Core database entities and their descriptions |
| **Key APIs** | Primary REST endpoints |
| **Key Screens** | Frontend routes and components |
| **AI Agents Involved** | AI copilot features within the module |
| **Estimated Sprint Allocation** | Sprint count estimate |
| **Dependencies** | Module dependencies and dependency types |
| **Quality Gates** | Quality checks and enforcement tools |

## Cross-References
- Each module map references entities, APIs, and screens from the **Traceability Chains** (03-TRACEABILITY/)
- Sprint allocation estimates feed into **Sprint Maps** (05-SPRINT-MAPS/)
- Dependencies feed into **Dependency Graphs** (07-DEPENDENCY-GRAPHS/)
- Implementation sequence is defined in **Implementation Sequences** (08-IMPLEMENTATION-SEQUENCES/)

## Legend

### Dependency Types
| Type | Meaning |
|------|---------|
| Strong | Must be implemented before this module |
| Weak | Can be implemented in parallel, may need interfaces |
| Data | Requires data/entities from another module |
| API | Requires API endpoints from another module |
| UI | Requires UI components from another module |

### Quality Gate Enforcers
| Enforcer | Tool/Process |
|----------|-------------|
| ESLint | Code quality and consistency |
| Jest | Unit and integration tests |
| Playwright | E2E tests |
| Prisma | Database schema validation |
| SonarQube | Code quality gate |
| OWASP | Security scanning |
| k6 | Performance/load testing |

### Module Index
| Map | Domain | Sprints (Est.) |
|-----|--------|----------------|
| 00-Shared-Kernel-Map.md | Shared Kernel | 2 |
| 01-Commercial-Map.md | Commercial | 5 |
| 02-Project-Delivery-Map.md | Project Delivery | 6 |
| 03-Procurement-Map.md | Procurement | 4 |
| 04-Supplier-Management-Map.md | Supplier Management | 3 |
| 05-Inventory-Map.md | Inventory | 4 |
| 06-Financial-Control-Map.md | Financial Control | 5 |
| 07-Maintenance-Map.md | Maintenance | 4 |
| 08-Document-Management-Map.md | Document Management | 3 |
| 09-Executive-Intelligence-Map.md | Executive Intelligence | 3 |
| 10-AI-Copilots-Map.md | AI Copilots | 4 |
| 11-Integrations-Map.md | Integrations | 4 |
| 13-Human-Resources-Map.md | Human Resources | 4 |
