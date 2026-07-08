# 01 — Product Decomposition

## Purpose
Decompose the Triangle Black platform into its constituent parts: portals, modules, features, and components. Every element traces to a documented business capability.

## Documents

| File | Contents |
|------|----------|
| Product-Hierarchy.md | Full product tree: Ecosystem → Portals → Modules → Features → Components |
| Portal-Decomposition.md | Per-portal definition: users, navigation, scope |
| Module-Decomposition.md | Per-module breakdown: aggregates, domain services, events |
| Feature-Decomposition.md | Per-feature specification: inputs, outputs, business rules |
| Component-Decomposition.md | Shared and module-specific UI components |
| Capability-Mapping.md | Business capability → Module → Feature traceability |
| Dependency-Graph.md | Module dependency graph with rationale |

## Traceability

| Artifact | Source |
|----------|--------|
| Portals | 07-Product/Portal-Strategy.md, 08-UX/Information-Architecture.md |
| Modules | 07-Product/MVP.md, 07-Product/Functional-Requirements.md |
| Capabilities | 01-Executive/Business-Capabilities.md, Business-Capability-Matrix.md |
| Aggregates | 05-Domain/Aggregates.md |
| Entities | 05-Domain/Entities.md |
| Domain Events | 05-Domain/Domain-Events.md |
| Domain Services | 05-Domain/Domain-Services.md |
