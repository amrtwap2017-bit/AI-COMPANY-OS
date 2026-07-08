# Domain Dependencies

## ASCII Dependency Diagram

```
                                    ┌──────────────────┐
                                    │  00 Shared       │
                                    │  Kernel          │
                                    └────────┬─────────┘
                                             │
                                             ▼
                    ┌─────────────────────────────────────────────┐
                    │              01 Commercial                  │
                    └──────┬──────┬───────────────┬──────────────┘
                           │      │               │
                           ▼      ▼               ▼
              ┌──────────────┐ ┌──────┐  ┌──────────────────┐
              │02 Project    │ │03    │  │05 Inventory      │
              │Delivery      │ │Proc  │  │                  │
              └──────┬───────┘ └──┬───┘  └────────┬─────────┘
                     │            │               │
                     ▼            ▼               ▼
              ┌──────────────┐ ┌──────┐  ┌──────────────────┐
              │04 Supplier   │ │06    │  │07 Maintenance    │
              │Management    │ │Fin   │  │                  │
              │              │ │Ctrl  │  │                  │
              └──────────────┘ └──────┘  └────────┬─────────┘
                                                   │
                                                   ▼
              ┌──────────────┐ ┌──────┐  ┌──────────────────┐
              │08 Document   │ │09    │  │10 AI Copilots    │
              │Management    │ │Exec  │  │                  │
              │              │ │Intel │  │                  │
              └──────────────┘ └──────┘  └────────┬─────────┘
                                                   │
                                                   ▼
              ┌──────────────┐ ┌──────┐  ┌──────────────────┐
              │11 Integrations│ │12    │  │13 Human          │
              │              │ │Mobile│  │Resources         │
              └──────────────┘ └──────┘  └──────────────────┘
```

## Dependency Table

| Domain | Depends On | Dependency Type | Rationale |
|--------|-----------|-----------------|-----------|
| 01 Commercial | 00 Shared Kernel | Hard | Uses shared identity, auth, tenant models |
| 02 Project Delivery | 01 Commercial | Hard | Projects are created from commercial agreements |
| 03 Procurement | 01 Commercial | Hard | POs are raised against commercial contracts |
| 04 Supplier Management | 03 Procurement | Hard | Supplier evaluations require PO history |
| 05 Inventory | 01 Commercial | Soft | Inventory valuation uses costing from Commercial |
| 05 Inventory | 02 Project Delivery | Hard | Stock is allocated to projects |
| 06 Financial Control | 03 Procurement | Hard | Financial reconciliation needs PO data |
| 06 Financial Control | 02 Project Delivery | Hard | Milestone-based billing needs project data |
| 06 Financial Control | 05 Inventory | Hard | Inventory valuation feeds financial reports |
| 07 Maintenance | 05 Inventory | Hard | Maintenance consumes spare parts from Inventory |
| 07 Maintenance | 02 Project Delivery | Hard | Maintenance schedules tie to project deliverables |
| 08 Document Management | 02 Project Delivery | Soft | Documents originate from project workflows |
| 08 Document Management | 03 Procurement | Soft | PO documents stored in document system |
| 08 Document Management | 04 Supplier Management | Soft | Supplier contracts stored as documents |
| 09 Executive Intelligence | 06 Financial Control | Hard | Financial dashboards require financial data |
| 09 Executive Intelligence | 02 Project Delivery | Hard | Project status requires delivery data |
| 09 Executive Intelligence | 05 Inventory | Hard | Inventory KPIs require inventory data |
| 10 AI Copilots | 09 Executive Intelligence | Hard | AI agents consume intelligence data |
| 10 AI Copilots | 08 Document Management | Hard | RAG pipelines require document corpus |
| 11 Integrations | 00 Shared Kernel | Hard | Integration framework needs shared models |
| 11 Integrations | All domains | Soft | Integrations connect all domains incrementally |
| 12 Mobile | 11 Integrations | Hard | Mobile app consumes integration APIs |
| 12 Mobile | 01 Commercial | Hard | Mobile ordering requires commercial data |
| 12 Mobile | 02 Project Delivery | Hard | Mobile field updates need project access |
| 12 Mobile | 07 Maintenance | Hard | Mobile maintenance workflows |
| 13 Human Resources | 00 Shared Kernel | Hard | Uses shared identity model |
| 13 Human Resources | 06 Financial Control | Soft | Payroll feeds financial systems (post-MVP) |

## Critical Path

The critical path for minimum viable delivery:

```
00 Shared Kernel → 01 Commercial → 02 Project Delivery → 06 Financial Control → 09 Executive Intelligence
```

This path determines the minimum sequence for a functioning enterprise system.
