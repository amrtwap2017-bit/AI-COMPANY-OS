# Architecture Checklist

- [ ] Bounded context identified (matches 06-DOMAINS/)
- [ ] Aggregate root identified
- [ ] Aggregate size under 5 entities
- [ ] Domain events named EntityPastTenseVerb
- [ ] No direct calls between contexts (events only)
- [ ] Layer boundaries respected
- [ ] No infrastructure imports in service layer
- [ ] No business logic in router.py
- [ ] Multi-tenant: tenant_id on every table
- [ ] ADR created if new pattern introduced

Reviewer: Architect Agent
