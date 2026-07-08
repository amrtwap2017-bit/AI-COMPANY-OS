# Stage 03: Architecture

## Purpose

Design the feature's architecture, verify it against the project's existing architectural baseline, and create or update Architecture Decision Records (ADRs) as needed.

## Agent Role

**Solution Architect AI** — Responsible for architectural design, baseline compliance, and ADR management.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Sprint Backlog Item | Planning artifact with status `APPROVED` |
| Architecture Baseline | Current architecture documentation, C4 models, and dependency rules exist |
| ADR Log | Existing ADRs are accessible for review |

## Process

### Step 1: Understand Feature Requirements
- Read the requirement document and sprint backlog item.
- Identify which architectural layers are affected (presentation, application, domain, infrastructure).
- Determine whether the feature introduces new concepts or modifies existing ones.

### Step 2: Design Feature Architecture
- Identify the **structural changes**: new modules, classes, interfaces, or packages.
- Identify the **behavioral changes**: new workflows, event flows, or state transitions.
- Map the design to Clean Architecture layers:
  - **Domain**: Entities, value objects, domain events, repository interfaces.
  - **Application**: Use cases (interactors), DTOs, ports.
  - **Infrastructure**: Repositories, external service adapters, database access.
  - **Presentation**: Controllers, middleware, request/response models.

### Step 3: Check Against Baseline
- Verify the design follows existing architectural patterns (repository pattern, dependency injection, etc.).
- Ensure dependency rule compliance: dependencies point inward (Presentation → Application → Domain).
- Check no circular dependencies are introduced.
- Validate that the design is consistent with existing C4 Context and Container diagrams.

### Step 4: Create or Update ADR
- If the design introduces a significant architectural decision (new pattern, library, external service, structural change), create a new ADR.
- ADR format:
  - **Title**: `ADR-<NNN>: <Title>`
  - **Status**: Proposed | Accepted | Deprecated | Superseded
  - **Context**: What is the issue driving this decision?
  - **Decision**: What was decided?
  - **Consequences**: What trade-offs, costs, and benefits result?
- If the design modifies a past decision, update the affected ADR's status to `Superseded` and link to the new ADR.

### Step 5: Document Architecture Spec
- Write the architecture spec artifact to `.architecture.md`.
- Include C4-level diagrams (as PlantUML or Mermaid) for the affected components.
- Document interfaces, contracts, and key data flows.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Architecture Spec Approved | Artifact status is `APPROVED` |
| ADRs Updated | New ADRs created or existing ones updated if decisions changed |
| Baseline Compliant | No violations of dependency rules or architectural patterns |
| C4 Diagrams Included | Context and Container diagrams for affected components |
| Interface Contracts Defined | All inter-module interfaces are specified |

## Artifact Template

```markdown
# Architecture Spec: <Feature Title>

**Sprint Item**: `SP-<ID>`
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Affected Layers
- [ ] Presentation
- [ ] Application
- [x] Domain
- [x] Infrastructure

## Structural Changes
- New module: `src/domains/<feature>/`
- Modified interface: `IMessageRepository`

## Behavioral Changes
- New use case: `ProcessOrderUseCase`
- Event flow: OrderSubmitted → PaymentProcessed → InventoryReserved

## C4 Diagrams
```mermaid
...
```

## Interface Contracts
### Input Ports
- `ProcessOrderUseCase.execute(dto: ProcessOrderDTO): Promise<OrderResponse>`

### Output Ports
- `IMessageRepository.save(message: Message): Promise<void>`

## Dependency Check
- [x] Presentation → Application only
- [x] Application → Domain only
- [x] Infrastructure → Domain/Application through ports only
- [x] No circular dependencies

## ADR References
- New: `ADR-042: Use Event Sourcing for Order Processing`
- Updated: `ADR-015` (superseded by ADR-042)
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Architecture violates dependency rules | Redesign to invert dependencies using ports/adapters |
| Missing interface contracts | Add explicit input/output port definitions |
| No existing pattern for the design | Create an ADR and document the new pattern |
| C4 diagrams inconsistent with baseline | Update baseline diagrams or align design |

## Cross-References

- [02-Planning.md](./02-Planning.md)
- [Standards: Architecture Standards](../05-STANDARDS/Architecture-Standards.md)
- [Standards: Coding Standards](../05-STANDARDS/Coding-Standards.md)
