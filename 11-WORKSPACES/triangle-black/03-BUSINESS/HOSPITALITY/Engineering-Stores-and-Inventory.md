# Engineering Stores & Inventory

| Field | Value |
|---|---|
| Document ID | 04-Hospitality-Knowledge-23 |
| Document Purpose | Define engineering stores and inventory management for hotel operations |
| Version | 1.0 |
| Status | Review |

---

## Overview

The engineering store is the heartbeat of hotel maintenance operations. Without the right spare part at the right time, a simple repair becomes a guest complaint. Proper stores management reduces downtime, controls costs, and improves engineering efficiency.

---

## Store Organization

### Categories
| Category | Examples |
|---|---|
| HVAC spares | Filters, belts, capacitors, contactors, thermostats, fan motors |
| Electrical spares | Circuit breakers, relays, lamps, ballasts, switches, sockets |
| Plumbing spares | Valves, gaskets, seals, pipes, fittings, faucet cartridges |
| Fire safety spares | Detectors, alarm panels, batteries, sprinkler heads |
| Kitchen spares | Thermostats, gaskets, heating elements, pumps |
| Laundry spares | Belts, seals, valves, circuit boards, bearings |
| Pool spares | Pump seals, filter cartridges, chemical test kits |
| Hardware | Screws, nuts, bolts, anchors, adhesives, tapes |
| Tools | Hand tools, power tools, test equipment, safety equipment |

### Storage Standards
- Shelving: Industrial grade, labeled, and zone-mapped
- Bin system: Every item has a fixed location
- Labeling: Bin label with item code, description, and min/max levels
- FIFO: First-in-first-out for perishable items (chemicals, seals, gaskets)
- Security: Engineering store locked. Key register maintained.
- Climate control: Humidity and temperature monitoring for sensitive items

---

## Inventory Management

### Stock Levels
| Classification | Definition | Examples | Review Frequency |
|---|---|---|---|
| A-Item | High value, critical spares | Chiller compressor, control board | Monthly |
| B-Item | Medium value, regular usage | Fan motor, pump seal, filter | Quarterly |
| C-Item | Low value, high consumption | Lamps, gaskets, screws | Semi-annual |

### Reorder Process
1. Minimum stock level reached (automatic alert)
2. Requisition created
3. Approved by chief engineer
4. PO issued per procurement process
5. Goods received and stocked
6. Inventory updated

### Stock Count
| Item Class | Frequency | Tolerance |
|---|---|---|
| A-Items | Monthly | ±1% |
| B-Items | Quarterly | ±3% |
| C-Items | Annual | ±5% |

---

## Key KPIs

| KPI | Target | Formula |
|---|---|---|
| Inventory Accuracy | > 97% | (Counted value / System value) × 100 |
| Stockout Rate | < 2% | (Stockouts / Total requests) × 100 |
| Slow-moving Inventory | < 10% | (Items with no movement in 12 months / Total items) × 100 |
| Inventory Turnover | 4-6× per year | (Annual consumption / Average inventory) |
| Emergency Purchase % | < 5% | (Emergency PO value / Total PO value) × 100 |
| Order-to-Shelf Time | < 7 days | Receipt date - Order date |

---

## AI Opportunities

- Demand forecasting based on historical consumption, occupancy, and season
- Automated reorder suggestions when stock reaches min level
- Slow-moving and obsolete item identification
- Supplier lead time prediction for order timing optimization
- Cross-property inventory sharing optimization for multi-property groups
- Consumption pattern analysis for bulk purchasing decisions

## Traceability

| Relation | Reference |
|---|---|
| Related Business Capability | Procurement, Supply Chain |
| Related Workflow | 06-Operations/Inventory.md |
| Related Database Tables | inventory, purchase_orders, goods_receipts |
| Related APIs | GET/POST /v1/inventory, /v1/purchase-orders |
| Related Roles | Storekeeper, Chief Engineer, Procurement Manager |
| Related KPIs | Inventory accuracy, Stockout rate, Turnover |
