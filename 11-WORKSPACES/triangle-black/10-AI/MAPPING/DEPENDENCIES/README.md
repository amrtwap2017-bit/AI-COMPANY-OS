# Dependency Graphs

## Overview

Dependency graphs provide a structured representation of relationships between domains, capabilities, data entities, and sprints within Program 2.5. They serve as the foundation for sequencing work, identifying bottlenecks, and managing cross-domain risks.

## Graph Structure

Each dependency graph is a directed acyclic graph (DAG) where:

- **Nodes** represent work items (domains, capabilities, entities, sprints)
- **Edges** represent dependencies (A → B means A depends on B)
- **Direction** flows from dependent to prerequisite

Graphs are maintained at four levels of granularity:

| Graph | Nodes | Edges | Purpose |
|-------|-------|-------|---------|
| Domain-Dependencies | 14 domains | Domain-level arrows | Strategic sequencing |
| Capability-Dependencies | ~80 capabilities | Cross-domain refs | Build ordering |
| Data-Dependencies | ~200 entities | FK relationships | Schema planning |
| Sprint-Dependencies | ~50 sprints | Predecessor links | Release planning |

## Reading Dependency Graphs

### ASCII Diagrams

Diagrams use the following conventions:

```
Domain A ──→ Domain B
  │              │
  ▼              ▼
Domain C ──→ Domain D
```

- `──→` = depends on (arrow points to prerequisite)
- `│` = vertical connector
- `▼` = downward flow

### Tables

Dependencies are represented in tables with columns:

| Item | Depends On | Type | Critical Path |
|------|-----------|------|---------------|
| A | B | Hard | Yes |

- **Hard**: Must complete before work can begin
- **Soft**: Should complete before for efficiency
- **Optional**: May be parallelized with coordination

## Usage

1. **Planning**: Determine build order from dependency chains
2. **Risk Management**: Identify long dependency chains as risk items
3. **Impact Analysis**: Trace downstream effects of changes
4. **Sprint Allocation**: Group dependent work into same sprint where possible

## Maintenance

Dependency graphs are reviewed at the start of each sprint planning session. Updates follow this process:

1. Propose change in the affected domain file
2. Cross-reference dependent domains
3. Update all affected graph files
4. Validate against Mapping Integrity rules (see 10-VALIDATION/)
