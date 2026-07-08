# Implementation Sequences

## Overview

Implementation sequences define the build order for all sprints across Program 2.5. Sequences are optimized for the **revenue-first principle**: capabilities that generate or track revenue are built before cost-centric capabilities.

## Guiding Principles

1. **Revenue First**: Commercial capabilities precede HR and other cost domains
2. **Critical Path**: Sprints on the critical path are prioritized above non-critical work
3. **Dependency Resolution**: No sprint starts until its hard dependencies are complete
4. **Incremental Value**: Each phase delivers a working, demonstrable system
5. **Risk Reduction**: High-risk items are scheduled early to surface issues

## Files in This Section

| File | Description |
|------|-------------|
| Master-Sequence.md | Complete sprint-ordered build sequence with critical path |
| Revenue-First-Sequence.md | Justification and detail for revenue-first ordering |
| Phase-Sequence.md | High-level phase breakdown with go/no-go criteria |

## Sequence Hierarchy

```
Phase Sequence (6 phases)
  └── Master Sequence (24 sprints)
       ├── Critical Path (16 sprints)
       └── Non-Critical Path (8 sprints)
            └── Revenue-First Ordering (applied within phases)
```

## Key Milestones

| Milestone | Sprint | Deliverable |
|-----------|--------|-------------|
| Foundation Complete | S4 | Multi-tenant platform with customer management |
| First Revenue | S5 | Contract and sales order processing |
| Money Flow | S8 | Invoice matching and financial reconciliation |
| Operational | S12 | Full procurement-to-maintenance cycle |
| Intelligent | S15 | AI copilot query engine operational |
| People Ready | S20 | HR and mobile field operations live |
| Platform Scale | S24 | Multi-region, hardened platform |
