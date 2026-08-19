# ADR-001: Tenancy Architecture — hotel_id → organization_id Migration

**Date:** August 2026
**Status:** ACCEPTED
**Sprint:** T-009

## Context

Triangle Black was initially built for a single hotel-centric model where
`hotel_id` is the sole tenant boundary. As the platform moves toward
multi-tenant SaaS, we need a proper organizational hierarchy.

## Decision

Implement a **progressive compatibility migration**:

### Phase 1 — Current (T-009)
- `hotel_id` remains the active tenant key in JWT, DB, and all queries
- `organization_id` added as a column alias (same value as `hotel_id`)
- `TenantContext` object introduced — carries both IDs
- `get_organization_id()` dependency added as alias for `get_hotel_id()`
- Zero breaking changes

### Phase 2 — Future (T-009+)
- Organization table created: `organizations (id, name, plan, ...)`
- User → Organization membership table
- `organization_id` becomes the JWT claim
- `hotel_id` maintained as `site_id` under the organization

### Phase 3 — Long-term
- Full hierarchy: Company → Organization → Site → Building → Area → Asset
- `hotel_id` deprecated but maintained for backward compat

## Target Hierarchy
Company (future)
└─ Organization ← new primary tenant boundary
└─ Site ← was hotel location
└─ Building
└─ Floor
└─ Area
└─ Asset

## Rationale

1. Cannot change hotel_id overnight — 165+ tables reference it
2. Must maintain backward compatibility for all existing endpoints
3. Progressive migration reduces risk
4. TenantContext provides clean API for future expansion

## Security Invariant

**NEVER** trust a client-provided hotel_id or organization_id in query parameters.
The server ALWAYS determines tenant scope from the authenticated JWT.

## Acceptance Criteria

- [ ] organization_id column exists on key tables (same value as hotel_id)
- [ ] get_organization_id() dependency available in all routers
- [ ] TenantContext object available as FastAPI dependency
- [ ] All existing queries continue working unchanged
- [ ] 10 tests passing
- [ ] Zero regression on existing 2176+ backend tests
