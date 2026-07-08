# 04 — Data Onboarding

> Customer data migration and onboarding process.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 3 | Physical-Database.md | Database schema |
| Phase 5 | Data-Foundation.md | Data layer |

## Data Onboarding Scope

| Data Type | Source | Target | Migration Required |
|-----------|--------|--------|-------------------|
| Hotel profile | Legacy system / manual | Triangle Black tenant | ✅ |
| Room inventory | Legacy system / spreadsheet | PostgreSQL (rooms) | ✅ |
| Rate plans | Legacy system / spreadsheet | PostgreSQL (rates) | ✅ |
| Guest history | Legacy system export | PostgreSQL (guests) | Optional |
| Reservations (current) | Legacy system | PostgreSQL (reservations) | ✅ |
| Staff accounts | Manual creation | Auth system | ✅ |
| Financial data | Legacy system | PostgreSQL (invoices) | Optional |

## Data Migration Process

```
1. EXPORT ──► 2. VALIDATE ──► 3. TRANSFORM ──► 4. IMPORT ──► 5. VERIFY
    │             │              │               │             │
  CSV/JSON     Schema         Map fields      Run import    Record count
  from legacy  validation     to Triangle     script        + spot check
              rules           Black schema                 + data quality
```

## Data Validation Rules

| Check | Rule | Action on Failure |
|-------|------|-------------------|
| Room numbers unique | No duplicates | Flag and deduplicate |
| Rate amounts > 0 | Price > 0 | Set to default rate |
| Dates in range | Not in past | Correct or flag |
| Guest emails valid | Contains @ | Flag for manual review |
| Foreign keys exist | Hotel ID references valid hotel | Reject row |

## Import Script

```bash
# Run data import (example)
docker compose exec api npx ts-node scripts/import-hotel-data.ts \
  --tenant my-hotel \
  --file /data/import/hotel_data.csv

# Verify import
docker compose exec api npx ts-node scripts/verify-import.ts \
  --tenant my-hotel
```

## Rollback

If import fails or corrupts data:
```bash
# Restore tenant schema from pre-import backup
# Re-run import after fixing issues
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT DOCUMENTED
