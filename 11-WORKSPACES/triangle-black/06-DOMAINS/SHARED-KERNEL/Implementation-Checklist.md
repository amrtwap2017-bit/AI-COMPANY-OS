# 00-SHARED-KERNEL — Implementation Checklist

- [ ] Base entity interface/class with tenant, audit, soft delete
- [ ] Prisma global middleware: soft delete filter, audit fields
- [ ] Master data seed script (currencies, UOM, tax rates, countries)
- [ ] Master data API endpoints (read-only for users, CRUD for admins)
- [ ] Event bus module with typed events
- [ ] Notification service (in-app + email)
- [ ] Audit service (auto-log all entity changes)
- [ ] Report engine (Handlebars → PDF)
- [ ] Shared validation schemas (Zod)
- [ ] Consistent API error format
- [ ] Health check endpoint
