# Data, Model and Migration Inventory

## Current persistence baseline

- SQLAlchemy is the active ORM/runtime abstraction, supplemented heavily by raw SQL.
- `src/core/base.py` is the primary declarative base, but at least one separate declarative base exists in the legacy domain invoice model.
- Tenant-related implementation uses `hotels` and `hotel_id`; this is a transitional site/tenant approach, not a complete organization/membership model.

## Entity/model families

| Family | Implemented records |
|---|---|
| Identity/tenant | users, roles, hotels, preferences, tenant audit |
| Commercial | leads, agents, activities, quotes, contracts, pipeline, invoices/payments |
| Operations | sites, technicians, assets, service requests, work orders, service reports |
| Supply | items, warehouses, vendors, stock movements, purchase requests/orders, goods receipts, RFQs and scorecards |
| Platform | documents, notifications, webhooks, cache, search, pagination, audit |
| Analytics/AI | derived router/query outputs; limited first-class models |

## Migration inventory and risks

- Alembic includes initial-schema, invoices, notifications, multi-hotel isolation and a generated full-schema revision.
- Initial and some feature revisions are no-ops while runtime code creates tables in requests.
- The full-schema revision contains drops of numerous tables; it must not be treated as a safe production upgrade without an audited migration baseline.
- `invoice_payments` and several other tables are created dynamically by router code, which must be captured in formal migrations before production hardening.

## Data standards required

All future aggregates require immutable ID, organization scope, lifecycle version, created/updated actor/time, audit correlation, classification and retention policy. Money requires decimal/currency value objects; status strings require versioned state-machine mapping; documents and graph/vector data require provenance and tenant scope.

## Compatibility migration policy

Add canonical columns/tables and backfill beside legacy schemas. Expose compatibility repositories/views/adapters. Dual-read/dual-write only with reconciliation metrics and expiry. No destructive migration without tested backup restore, data reconciliation, API consumer migration and explicit ADR.

