# 05-INVENTORY — Database Schema

## warehouses
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| name | VARCHAR(255) | Main warehouse, Site A storage |
| type | ENUM | central, site, supplier |
| location | TEXT | — |
| is_active | BOOLEAN | — |

## inventory_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| warehouse_id | UUID FK | — |
| item_name | VARCHAR(255) | — |
| sku | VARCHAR(100) | Unique per tenant |
| category | VARCHAR(100) | — |
| unit | VARCHAR(20) | — |
| quantity | DECIMAL(10,2) | Current stock |
| min_level | DECIMAL(10,2) | Reorder threshold |
| max_level | DECIMAL(10,2) | — |
| unit_cost | DECIMAL(12,2) | Weighted average |
| location | VARCHAR(100) | Bin/zone |

## stock_transactions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| type | ENUM | receipt, issue, transfer_out, transfer_in, adjustment, return |
| item_id | UUID FK | — |
| warehouse_id | UUID FK | — |
| quantity | DECIMAL(10,2) | Positive or negative |
| reference_type | VARCHAR(50) | po, project, adjustment |
| reference_id | UUID | — |
| unit_cost | DECIMAL(12,2) | At time of transaction |
| notes | TEXT | — |
| created_by | UUID FK | — |
