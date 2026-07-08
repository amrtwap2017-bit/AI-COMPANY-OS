# 05 — Process Mining

> Process mining for automation opportunity discovery.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Automation-Roadmap.md | Automation priorities |
| Phase 6 — All domain workflows | Process event logs |

## Process Mining Approach

```
Event Logs ──► Discover ──► Analyze ──► Improve ──► Automate
   │            │            │           │            │
System     Reconstruct    Bottlenecks  Redesign    Build
logs       actual          + deviations + optimize  workflow
           process flow                 target     + deploy
```

## Event Log Sources

| Source | Events | Volume (daily) |
|--------|--------|----------------|
| PMS | Check-in, check-out, booking, cancel | 50K |
| Procurement | PO create, approve, order, receive, invoice | 5K |
| Maintenance | Report, assign, fix, verify, close | 2K |
| Support | Create, assign, resolve, close | 1K |
| Finance | Invoice create, match, approve, pay | 3K |

## Analysis Outputs

| Output | Description | Action |
|--------|-------------|--------|
| Process map | Visual process flow | Identify automation points |
| Bottleneck analysis | Steps with longest wait times | Target for automation |
| Deviation analysis | Steps that skip normal flow | Process redesign |
| Conformance check | Actual vs. ideal process | Training + automation |
| Automation score | Per-process automation potential | Prioritize high-score |

## H1 Process Mining Initiatives

| Initiative | Data Source | Timeline | Output |
|------------|-------------|----------|--------|
| Procurement process discovery | PO event logs | Q1 | Procurement automation plan |
| Support process discovery | Ticket event logs | Q1 | Support copilot requirements |
| Maintenance process discovery | Work order logs | Q2 | Maintenance workflow design |
| Finance process discovery | Invoice logs | Q2 | Invoice automation plan |
