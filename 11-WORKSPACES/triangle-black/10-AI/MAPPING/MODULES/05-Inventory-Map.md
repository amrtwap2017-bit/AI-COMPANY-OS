# Inventory Module Map

## Scope
Warehouse management, stock tracking, inter-warehouse transfers, stock consumption and issuance, stock adjustments and counts, inventory reservations.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Warehouse Management | 5 | 200 |
| Stock Management | 6 | 280 |
| Stock Transfer Management | 5 | 210 |
| Stock Consumption | 5 | 190 |
| Stock Adjustment | 5 | 220 |
| Inventory Reservation | 4 | 160 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/05-Inventory-Domain.md` — Full inventory domain spec
- `03-FEATURES/14-Inventory-Management.md` — Inventory management feature spec
- `03-FEATURES/15-Stock-Control.md` — Stock control feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 6 |
| Frontend pages | Next.js pages | 16 |
| Database tables | Prisma models | 14 |
| API endpoints | REST routes | 40 |
| Test files | spec/test files | 50 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| Warehouse | Warehouse | Physical/named warehouse |
| WarehouseLocation | WarehouseLocation | Bin/rack location in warehouse |
| StockItem | StockItem | Stock keeping unit |
| StockBatch | StockBatch | Lot/batch tracked stock |
| StockMovement | StockMovement | Stock transaction log |
| StockTransfer | StockTransfer | Inter-warehouse transfer |
| StockConsumption | StockConsumption | Material usage record |
| StockAdjustment | StockAdjustment | Inventory adjustment |
| InventoryReservation | InventoryReservation | Stock reservation |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /warehouses | GET/POST | List and create warehouses |
| /warehouses/:id/zones | POST | Add zone to warehouse |
| /inventory/stock | GET/POST | List and create stock items |
| /inventory/stock/:id/movements | GET | Get stock movement history |
| /inventory/transfers | GET/POST | List and create transfers |
| /inventory/transfers/:id/ship | POST | Ship transfer |
| /inventory/transfers/:id/receive | POST | Receive transfer |
| /inventory/consumption | GET/POST | List and create consumption |
| /inventory/adjustments | GET/POST | List and create adjustments |
| /inventory/adjustments/:id/reconcile | POST | Reconcile adjustment |
| /inventory/reservations | GET/POST | List and create reservations |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /inventory/warehouses | WarehouseList, WarehouseForm, LayoutView | Warehouse management |
| /inventory/stock | StockList, StockForm, StockDetail | Stock management |
| /inventory/stock/:id/movements | MovementLogView | Stock movement history |
| /inventory/transfers | TransferList, TransferForm | Transfer management |
| /inventory/consumption | ConsumptionList, ConsumptionForm | Stock consumption |
| /inventory/adjustments | AdjustmentList, AdjustmentForm, CountSession | Stock adjustment |
| /inventory/reservations | ReservationList, ReservationForm | Inventory reservation |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| DemandForecastAI | Forecast stock demand |
| ReorderPredictionAI | Predict reorder points |
| TransferOptimizationAI | Optimize transfer routes |
| ConsumptionPatternAI | Analyze consumption patterns |
| AnomalyDetectionAI | Detect stock anomalies |
| AllocationOptimizationAI | Optimize stock allocation |

## Estimated Sprint Allocation: 4 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Procurement — Weak (goods receipt → stock update)
- Project Delivery — Weak (stock → project consumption)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for transfer → receive flow
- Prisma — Schema validation
