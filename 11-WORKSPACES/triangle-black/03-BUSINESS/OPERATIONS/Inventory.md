# Inventory — Materials and Equipment Inventory Management

## Overview

The inventory management process covers stock tracking, warehousing, stock movements, reordering, and inventory valuation across warehouse and project sites.

---

## BPMN Description

**Start Event:** Goods received, stock movement required, or stock check initiated

1. **Receive Goods into Inventory** — Record incoming items from procurement or returns
2. **Inspect and Verify** — Check quantity, quality, and condition against delivery note
3. **Assign Storage Location** — Determine warehouse, aisle, rack, bin
4. **Update Stock Records** — Record quantity, batch, expiry, location
5. **Monitor Stock Levels** — Continuous tracking of quantities and reorder points
6. **Replenishment Alert** — Trigger when stock falls below reorder level
7. **Initiate Reorder** — Create procurement request for replenishment
8. **Process Stock Movements** — Handle transfers between warehouses or to project sites
9. **Issue Materials to Project** — Record materials issued to active projects
10. **Conduct Cycle Counts** — Regular partial inventory counts
11. **Conduct Physical Count** — Periodic full inventory count
12. **Reconcile Discrepancies** — Adjust records for variances
13. **Identify Obsolete Stock** — Flag slow-moving or expired items
14. **Process Stock Adjustments** — Write-offs, damage, loss adjustments
15. **Compute Inventory Valuation** — Calculate value (FIFO/weighted average)
16. **Generate Inventory Reports** — Stock status, valuation, movement reports

**End Event:** Inventory managed and recorded

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Store Keeper / Warehouse Manager | Manages stock and storage | Inventory |
| Goods Receiver | Receives and inspects incoming goods | Inventory |
| Procurement Officer | Initiates reorder | Procurement |
| Project Manager | Requests materials for project | Project |
| Inventory Clerk | Updates stock records | Inventory |
| Finance / Accountant | Valuates inventory | Finance |
| Auditor | Verifies physical counts | Audit |
| Site Supervisor | Receives materials at site | Inventory |

---

## Inputs

| Input | Source |
|-------|--------|
| Goods receipt note | Procurement |
| Delivery note / packing slip | Vendor |
| Purchase order | Procurement |
| Stock transfer request | Project, Warehouse |
| Inventory count sheets | Physical count |
| Reorder point settings | Inventory configuration |
| Material return notes | Project |

---

## Outputs

| Output | Description | Destination |
|--------|-------------|-------------|
| Updated stock records | Current stock levels by location | Inventory |
| Stock movement record | Movement history | Inventory, Audit |
| Replenishment request | Reorder trigger | Procurement |
| Inventory valuation report | Stock value | Finance |
| Cycle count report | Count results and variances | Management |
| Stock adjustment record | Write-off/adjustment | Inventory, Finance |
| Materials issued record | Project consumption | Project, Finance |
| Obsolete stock report | Items for disposal | Management |

---

## Business Rules

- Stock levels cannot go negative (system-enforced)
- FEFO (First Expiry, First Out) for items with expiry dates
- Cycle counts: A-items (high value) monthly, B-items quarterly, C-items annually
- Full physical count required annually
- Discrepancies > 2% require investigation and manager approval for adjustment
- Obsolete stock (no movement in 12 months) flagged for review quarterly
- Materials issued to projects are transferred from inventory asset to project cost
- Stock transfers between locations require authorized request

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Goods receipt note | Incoming goods record |
| Stock card / ledger | Item-level stock history |
| Stock transfer form | Movement authorization |
| Material issue note | Issue to project |
| Cycle count sheet | Count recording |
| Physical inventory sheet | Full count record |
| Stock adjustment form | Write-off/adjustment |
| Inventory valuation report | Financial valuation |
| Obsolete stock report | Slow-moving items |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Inventory accuracy | > 98% | System qty / Physical qty (sampled) |
| Cycle count completion rate | 100% | Counts completed / Counts scheduled |
| Stockout incidents | < 1 per quarter per category | Stockout events |
| Reorder lead time compliance | > 90% | Orders placed within lead time / Total |
| Inventory turnover ratio | Per category target | COGS / Average inventory |
| Obsolete stock value | < 5% of total | Obsolete value / Total inventory value |
| Discrepancy resolution time | < 5 business days | Identified - Resolved |
| Stock adjustment value (shrinkage) | < 1% of total | Adjustments / Total inventory value |
