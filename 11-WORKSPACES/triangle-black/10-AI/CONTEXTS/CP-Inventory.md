# Context Pack: Inventory Management

**Pack ID:** CP-Inventory
**Version:** 1.0
**Domain:** Inventory
**Sprint:** 012

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/04-Inventory/Inventory-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/04-Inventory/Warehouse-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Inventory-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Inventory-Rules.md` | Backend Lead AI |
| 5 | Stock Tracking | `../02-DOMAIN-DOCS/04-Inventory/Stock-Tracking.md` | Backend Lead AI |
| 6 | Inventory Transfers | `../02-DOMAIN-DOCS/04-Inventory/Inventory-Transfers.md` | Solution Architect AI |
| 7 | Material Consumption | `../02-DOMAIN-DOCS/04-Inventory/Material-Consumption.md` | Backend Lead AI |
| 8 | Inventory Valuation | `../02-DOMAIN-DOCS/04-Inventory/Inventory-Valuation.md` | Business Analyst AI |
| 9 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 10 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Warehouse | `inv_warehouses` | id, name, code, location, type, status, capacity, manager_id | Database Architect AI |
| WarehouseZone | `inv_warehouse_zones` | id, warehouse_id, name, code, type, capacity | Database Architect AI |
| StockItem | `inv_stock_items` | id, product_id, sku, name, category, unit, current_quantity, min_quantity, max_quantity, location | Database Architect AI |
| StockBatch | `inv_stock_batches` | id, stock_item_id, batch_number, quantity, received_date, expiry_date, supplier_id | Database Architect AI |
| StockMovement | `inv_stock_movements` | id, stock_item_id, batch_id, movement_type, quantity, reference_type, reference_id, notes, created_at | Database Architect AI |
| InventoryTransfer | `inv_transfers` | id, number, from_warehouse_id, to_warehouse_id, status, created_by, created_at, completed_at | Database Architect AI |
| TransferLineItem | `inv_transfer_items` | id, transfer_id, stock_item_id, quantity, batch_id | Database Architect AI |
| MaterialConsumption | `inv_consumption` | id, project_id, stock_item_id, batch_id, quantity, consumed_date, consumed_by, reference_type, reference_id | Database Architect AI |
| StockAlert | `inv_stock_alerts` | id, stock_item_id, alert_type, threshold, triggered_at, resolved_at, status | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/inventory/warehouses` | GET/POST | Warehouse CRUD | Backend Lead AI |
| `/api/inventory/warehouses/{id}` | GET/PUT/DELETE | Warehouse detail | Backend Lead AI |
| `/api/inventory/warehouses/{id}/zones` | GET/POST | Zone management | Backend Lead AI |
| `/api/inventory/stock-items` | GET/POST | Stock items | Backend Lead AI |
| `/api/inventory/stock-items/{id}` | GET/PUT/DELETE | Item detail | Backend Lead AI |
| `/api/inventory/stock-items/{id}/batches` | GET/POST | Batch tracking | Backend Lead AI |
| `/api/inventory/stock-items/{id}/movements` | GET | Movement history | Backend Lead AI |
| `/api/inventory/transfers` | GET/POST | Inventory transfers | Backend Lead AI |
| `/api/inventory/transfers/{id}` | GET/PUT | Transfer detail | Backend Lead AI |
| `/api/inventory/transfers/{id}/receive` | POST | Receive transfer | Backend Lead AI |
| `/api/inventory/consumption` | GET/POST | Material consumption | Backend Lead AI |
| `/api/inventory/alerts` | GET | Stock alerts | Backend Lead AI |
| `/api/inventory/valuation` | GET | Inventory valuation | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/inventory/warehouses` | Warehouse list | Frontend Lead AI |
| `/inventory/warehouses/new` | Create warehouse | Frontend Lead AI |
| `/inventory/warehouses/{id}` | Warehouse detail with zones | Frontend Lead AI |
| `/inventory/stock-items` | Stock item catalog | Frontend Lead AI |
| `/inventory/stock-items/new` | Create stock item | Frontend Lead AI |
| `/inventory/stock-items/{id}` | Item detail with batches | Frontend Lead AI |
| `/inventory/stock-items/{id}/movements` | Movement history | Frontend Lead AI |
| `/inventory/transfers` | Transfer list | Frontend Lead AI |
| `/inventory/transfers/new` | Create transfer | Frontend Lead AI |
| `/inventory/transfers/{id}` | Transfer detail | Frontend Lead AI |
| `/inventory/consumption` | Consumption log | Frontend Lead AI |
| `/inventory/alerts` | Stock alert dashboard | Frontend Lead AI |
| `/inventory/valuation` | Valuation report | Frontend Lead AI |

### Dependencies
- CP-Procurement (goods receipt creates stock)

### Output Checklist
- [ ] Backend module with 13+ endpoints
- [ ] Frontend pages with 13+ components
- [ ] Database migration (9 tables)
- [ ] Unit tests (70 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 12
- **Frontend files:** 16
- **Test files:** 25
- **Document files:** 4
- **Total sprint effort:** 22 days
