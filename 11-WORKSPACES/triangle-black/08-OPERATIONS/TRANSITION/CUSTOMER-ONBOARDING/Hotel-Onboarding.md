# 04 — Hotel Onboarding

> Hotel onboarding within a customer tenant.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 08-CUSTOMER-SUCCESS/Hotel-Onboarding.md | Hotel onboarding |
| Phase 6 | Commercial-Domain.md | Hotel customer management |

## Hotel Onboarding Flow

```
Client Signed ──► Hotel Created ──► Config ──► Data Load ──► Train ──► Live
     │               │                │           │           │         │
  Contract        Tenant +         Rooms,     Import       Staff     Go-live
  signed          hotel setup      rates,     from         training  verified
                                   amenities  spreadsheet
```

## Hotel Configuration Checklist

- [ ] Hotel profile (name, address, contact info)
- [ ] Room types (Standard, Deluxe, Suite, etc.)
- [ ] Room inventory (room numbers, floors, categories)
- [ ] Rate plans (BAR, corporate, group, promotional)
- [ ] Amenities and services list
- [ ] Tax configuration (VAT 14%, tourism tax)
- [ ] Currency (EGP)
- [ ] Languages (Arabic, English)
- [ ] Housekeeping schedule (clean types, frequency)
- [ ] Notification preferences (SMS, email, in-app)
- [ ] User roles (front desk, housekeeping, manager)
- [ ] Custom fields (if needed)
- [ ] Payment gateway (if applicable)
- [ ] POS integration (if applicable)
- [ ] Channel manager integration (if applicable)

## Data Import

Data imported via spreadsheet template:
| Sheet | Columns |
|-------|---------|
| Rooms | Room number, floor, room type, rate, status |
| Rates | Rate plan name, room type, dates, price |
| Amenities | Name, description, category, price |
| Staff | Name, email, role, phone |

## Hotel Onboarding Timeline

| Size | Configuration | Data Import | Training | Total |
|------|--------------|-------------|----------|-------|
| Small (< 50 rooms) | 2 hours | 1 hour | 2 hours | 5 hours |
| Medium (50-200) | 4 hours | 2 hours | 4 hours | 10 hours |
| Large (> 200) | 8 hours | 4 hours | 8 hours | 20 hours |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
