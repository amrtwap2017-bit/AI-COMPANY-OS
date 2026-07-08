# Planner Context Pack

## Role Definition
Project/program planner managing sprints, roadmaps, delivery sequences, and resource allocation.

## Primary Folders
- `10-AI/MAPPING/` (102 files): Sprint maps, capability mapping, sequences
- `10-AI/EXECUTION/` (123 files): Portfolio, epics, features, stories, tasks, sprints
- `01-EXECUTIVE/` (14 files): Strategic roadmap
- `09-EVOLUTION/` (114 files): Evolution roadmap
- `06-DOMAINS/` (317 files): Domain implementation specs
- `02-GOVERNANCE/TRACEABILITY/` — Traceability matrix

## Key Documents to Load
1. `10-AI/MAPPING/SPRINTS/` (23 files) — Sprint maps
2. `10-AI/MAPPING/SEQUENCES/` — Implementation sequences
3. `10-AI/MAPPING/DEPENDENCIES/` — Dependency graphs
4. `10-AI/MAPPING/CAPABILITIES/` — Capability mapping
5. `10-AI/EXECUTION/PORTFOLIO/` — Portfolio
6. `10-AI/EXECUTION/EPICS/` — Epic management
7. `10-AI/EXECUTION/SPRINTS/` — Sprint system
8. `01-EXECUTIVE/ROADMAP/Implementation-Roadmap.md`
9. `06-DOMAINS/IMPLEMENTATION-SEQUENCE.md`
10. `06-DOMAINS/MODULE-DEPENDENCIES.md`

## Common Queries
- "What's the sprint plan?" → 10-AI/MAPPING/SPRINTS/
- "What are the dependencies?" → 10-AI/MAPPING/DEPENDENCIES/
- "What is the implementation order?" → 10-AI/MAPPING/SEQUENCES/
- "What epics are in progress?" → 10-AI/EXECUTION/EPICS/

## Related Roles
- Manager: For resource tracking
- Developer: For implementation details
- CTO: For strategic alignment
