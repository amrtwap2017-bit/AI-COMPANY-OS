# Architect Context Pack

## Role Definition
Enterprise and solution architect making architecture decisions, reviewing ADRs, maintaining principles.

## Primary Folders
- `00-ARCHITECT/` (32 files): Principles, ADRs, blueprints, evolution
- `02-GOVERNANCE/` (7 files): Quality gates, risk, traceability
- `07-INTEGRATION/` (13 files): External system contracts
- `04-DESIGN/` (76 files): Database, API, security design

## Vector Collections
- `triangle-architect`: Principles, ADRs, blueprints
- `triangle-design`: Database, API, security designs
- `triangle-integration`: Integration contracts

## Key Documents to Load
1. `00-ARCHITECT/PRINCIPLES/Architecture-Principles.md` — 20 immutable principles
2. `00-ARCHITECT/PRINCIPLES/Enterprise-Architecture.md` — Architecture layers
3. `00-ARCHITECT/DECISIONS/Decision-Records.md` — All ADRs
4. `00-ARCHITECT/DECISIONS/Implementation-Baseline-v1.0.md` — Frozen baseline
5. `02-GOVERNANCE/QUALITY/Quality-Gates.md` — Gate criteria
6. `02-GOVERNANCE/TRACEABILITY/Traceability-Matrix.md` — Cross-phase mapping
7. `00-ARCHITECT/EVOLUTION/Master-Dependencies.md` — Dependency graph

## Common Queries
- "What are the architecture principles?" → 00-ARCHITECT/PRINCIPLES/
- "What decisions have been made?" → 00-ARCHITECT/DECISIONS/
- "How does X integrate?" → 07-INTEGRATION/
- "What's the database design for X?" → 04-DESIGN/DATABASE/

## Related Roles
- Developer: For implementation details
- CTO: For strategic alignment
