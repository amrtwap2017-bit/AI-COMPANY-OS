# ADR-001: Tenant Model Migration — hotel_id to organization_id

## Status
PROPOSED

## Context
Triangle Black currently uses `hotel_id` as the sole tenant boundary on all 165+ tables.
The enterprise blueprint requires: Company → Organization → Site → Building → Asset.
hotel_id cannot represent multi-site organizations or non-hotel businesses.

## Decision
Add `organization_id` column as a compatibility alias for `hotel_id`.
Do NOT remove or rename `hotel_id` — it remains the runtime tenant field.
`organization_id` defaults to `hotel_id` value for all existing rows.
`get_hotel_id()` in `src/core/tenant.py` continues to work unchanged.
Future queries can use either field — they resolve to the same value.

## Migration Strategy
1. Add organization_id column to 5 core tables first (work_orders, service_requests, assets, invoices, contracts)
2. Backfill organization_id = hotel_id for all existing rows
3. Add index on organization_id
4. Do NOT change get_hotel_id() — no runtime behavior change
5. Do NOT change any existing API contracts
6. Future sprints can progressively use organization_id in new code

## Rollback
DROP COLUMN organization_id — zero impact on existing functionality.

## Consequences
- New column added to 5 tables — no schema break
- No API changes — backward compatible
- No auth changes — JWT still uses hotel_id resolution
- Foundation for future Company/Organization/Site hierarchy
- No performance impact (nullable column with index)

## Risk
LOW — additive only, no behavior change, full rollback possible.
