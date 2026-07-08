# Phase 03 — API Specifications

> API inventory and specification overview across all domains.

## API Inventory

| Domain | Endpoints | Key Operations |
|--------|-----------|---------------|
| Auth | 6 | login, register, refresh, logout, forgot-password, reset-password |
| Users | 5 | CRUD + profile update |
| Tenants | 3 | create, get, update |
| Roles | 4 | CRUD + assign users |
| Commercial | 12 | Lead CRUD + score/qualify/convert, Opportunity CRUD, Survey CRUD, Quotation CRUD + approve/reject, Contract CRUD + sign/amend |
| Project | 8 | Project CRUD, Milestone CRUD + approve, NCR CRUD + classify, Report submit |
| Procurement | 6 | Requisition CRUD, PO CRUD + approve, GR create |
| Supplier | 4 | Supplier CRUD + rate card + evaluate |
| Inventory | 6 | Stock CRUD + transfer + adjust, Warehouse CRUD |
| Financial | 8 | Invoice CRUD + submit ETA, Revenue recognize, 3-way match, GL query |
| Maintenance | 4 | Service Request CRUD + assign + resolve, SLA query |
| Document | 4 | Document upload/download + folder management |
| Reports | 4 | Dashboard query, KPI data, export CSV/PDF |
| AI | 2 | Lead score, NCR classify |
| Integration | 4 | Webhook config, health check, sync triggers |
| Health | 2 | Liveness, readiness |
| **Total** | **~82** | |

## API Versioning

- All endpoints: `/api/v1/{resource}`
- Breaking changes → `/api/v2/{resource}`
- Deprecation header in response: `Sunset: Sat, 01 Jan 2028 00:00:00 GMT`

## Pagination

All list endpoints support cursor-based pagination:

```json
{
  "data": [...],
  "meta": {
    "cursor": "next_cursor_value",
    "hasMore": true
  }
}
```

See `13-API/` for complete API specifications with request/response schemas.
