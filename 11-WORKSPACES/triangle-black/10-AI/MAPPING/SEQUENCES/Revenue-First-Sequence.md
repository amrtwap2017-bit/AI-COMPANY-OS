# Revenue-First Implementation Sequence

## Principle

Program 2.5 follows the **revenue-first** principle established in Program 1. Capabilities that directly generate, track, or accelerate revenue are built before capabilities focused on cost reduction or compliance.

## Financial Rationale

### Why Commercial Before Operations?

| Domain | Category | Impact | Timeline |
|--------|----------|--------|----------|
| Commercial | Revenue-generating | Direct invoicing, contract value tracking | Sprint 1-5 |
| Project Delivery | Revenue-enabling | Milestone billing, project margins | Sprint 6-8 |
| Financial Control | Revenue-tracking | Invoice matching, revenue recognition | Sprint 8 |
| Procurement | Cost center | PO processing (reduces cost, does not generate revenue) | Sprint 9 |
| HR | Cost center | Employee management (operational cost) | Sprint 19-20 |

### Cash Flow Impact

Building commercial capabilities first means:

1. **Revenue recognition begins at Sprint 5** (contracts + sales orders)
2. **Milestone billing operational by Sprint 8** (project delivery + financial control)
3. **Procurement savings delayed to Sprint 9+** (cost optimization, not revenue)
4. **HR payroll savings delayed to Sprint 20+** (cost center automation)

### Cost of Delay Comparison

| Capability | Cost of Delay per Sprint | Revenue Impact |
|-----------|-------------------------|---------------|
| Commercial (Contracts) | High | Lost revenue recognition |
| Financial Control (Invoicing) | High | Delayed cash collection |
| Procurement (PO) | Medium | Missed procurement savings |
| HR (Payroll) | Low | Manual payroll processing |
| Mobile (Field) | Low | Delayed field productivity |

## Build Order Justification

### Sprint 1-4: Foundation (Shared Kernel + Commercial Core)

```
Rationale: No revenue can be processed without tenant identity,
customer records, and sales order capabilities.
```

### Sprint 5-8: Revenue Cycle (Commercial + Delivery + Financial)

```
Rationale: The revenue cycle (order → project → invoice) is the
fastest path to cash. Financial control at Sprint 8 enables
invoice matching and revenue recognition.
```

### Sprint 9-12: Operations (Procurement → Inventory → Maintenance)

```
Rationale: Operational domains are cost centers that manage
spend. They consume commercial data (contracts, POs) and
project data (budgets). Building them after revenue ensures
the cash-generating engine is operational first.
```

### Sprint 13-16: Intelligence (Documents → Dashboards → AI)

```
Rationale: Intelligence layer adds value on top of operational
data. AI copilots require document corpus and KPI definitions
that are produced by earlier domains.
```

### Sprint 17-20: People (Mobile + HR)

```
Rationale: Mobile and HR are important but do not directly
generate revenue. They are additive capabilities that extend
reach and reduce operational cost.
```

### Sprint 21-24: Scale (Performance + Multi-Region + Security)

```
Rationale: Scale capabilities are enablers for growth. They
are scheduled last because they enhance rather than create
capability.
```

## Mapping to Program 1 Revenue-First Principle

| Program 1 Principle | Program 2.5 Application |
|---------------------|------------------------|
| Revenue before cost | Commercial (S1-5) before Procurement (S9) and HR (S19) |
| Customer before internal | Customer-facing sales before internal supplier management |
| Cash before efficiency | Invoice matching (S8) before inventory optimization (S11) |
| Value before polish | Working revenue cycle (S8) before scale/hardening (S21-24) |
