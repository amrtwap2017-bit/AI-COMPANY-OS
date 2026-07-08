# 00-SHARED-KERNEL — Database Schema

## Base Entity Pattern (all tables)

```prisma
model BaseEntity {
  id         String   @id @default(uuid())
  tenant_id  String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  created_by String?
  updated_by String?
  deleted_at DateTime?
  deleted_by String?
}
```

## Master Data Tables

### currencies
| Column | Type | Notes |
|--------|------|-------|
| code | VARCHAR(3) PK | EGP, USD, EUR, SAR |
| name | VARCHAR(100) | Egyptian Pound |
| symbol | VARCHAR(5) | £, $, € |
| is_default | BOOLEAN | Exactly one per tenant |
| exchange_rate | DECIMAL(10,6) | To default currency |

### units_of_measure
| Column | Type | Notes |
|--------|------|-------|
| code | VARCHAR(20) PK | m, m2, unit, day, hour, kg, ton |
| name | VARCHAR(100) | Meter, Square Meter |
| category | ENUM | length, area, count, time, weight |

### tax_rates
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| name | VARCHAR(100) | VAT, Withholding |
| rate | DECIMAL(5,2) | 14.00 for Egypt VAT |
| is_active | BOOLEAN | — |
| effective_from | DATE | — |
| effective_to | DATE | Nullable |

### countries
| Column | Type | Notes |
|--------|------|-------|
| code | VARCHAR(3) PK | EGY, SAU, ARE |
| name | VARCHAR(100) | Egypt |
| phone_code | VARCHAR(5) | +20 |
| currency_code | VARCHAR(3) FK | EGP |

## Event Log Table

### domain_events
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| event_type | VARCHAR(100) | lead.created, contract.activated |
| entity_type | VARCHAR(50) | lead, contract |
| entity_id | UUID | — |
| payload | JSONB | Event data |
| occurred_at | TIMESTAMPTZ | — |
| processed | BOOLEAN | Default false |
| error | TEXT | Nullable |
