# 03-PROCUREMENT — Database Schema

## purchase_requisitions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| number | VARCHAR(50) | REQ-{YYYY}-{XXXXX} |
| requested_by | UUID FK | Site engineer |
| status | ENUM | draft, submitted, approved, rejected, ordered |
| items | JSONB | [{item, qty, spec, needed_by}] |
| notes | TEXT | — |

## purchase_orders
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | — |
| supplier_id | UUID FK | — |
| number | VARCHAR(50) | PO-{YYYY}-{XXXXX} |
| status | ENUM | draft, pending_approval, approved, sent, confirmed, shipped, received, closed, cancelled |
| total | DECIMAL(12,2) | — |
| delivery_date | DATE | — |
| payment_terms | VARCHAR(100) | — |
| notes | TEXT | — |

## po_line_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| po_id | UUID FK | — |
| item_name | VARCHAR(255) | — |
| quantity | DECIMAL(10,2) | — |
| unit | VARCHAR(20) | — |
| unit_price | DECIMAL(12,2) | — |
| total | DECIMAL(12,2) | — |

## goods_receipts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| po_id | UUID FK | — |
| received_by | UUID FK | Storekeeper |
| received_date | DATE | — |
| status | ENUM | pending, inspected, accepted, partially_rejected, rejected |
| notes | TEXT | — |

## goods_receipt_lines
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| goods_receipt_id | UUID FK | — |
| po_line_id | UUID FK | — |
| quantity_received | DECIMAL(10,2) | — |
| quantity_accepted | DECIMAL(10,2) | — |
| quantity_rejected | DECIMAL(10,2) | — |
| reject_reason | TEXT | — |
