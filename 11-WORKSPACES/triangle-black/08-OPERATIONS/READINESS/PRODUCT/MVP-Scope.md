# 02 — MVP Scope

> Validating the MVP scope is defined, frozen, and agreed by stakeholders.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-05 | MVP-Validation.md | MVP exit criteria |
| PHASE-03 | Product-Decomposition.md | Feature breakdown |
| PHASE-06 | All domains | Domain specifications |

## MVP Scope Definition

The MVP includes the **Lead-to-Contract** end-to-end workflow (Sprint 4 target):

| Scope Item | Domain | Priority | Status |
|-----------|--------|----------|--------|
| User Authentication | Platform | P0 | ✅ Built |
| Role-Based Access Control | Platform | P0 | ✅ Built |
| Lead Management | Commercial | P0 | Specified |
| Opportunity Management | Commercial | P0 | Specified |
| Site Survey | Commercial | P0 | Specified |
| Quotation Builder | Commercial | P0 | Specified |
| Contract Management | Commercial | P0 | Specified |
| Project Setup | Project | P0 | Specified |
| Milestone Tracking | Project | P0 | Specified |
| Purchase Order | Procurement | P0 | Specified |
| Goods Receipt | Procurement | P0 | Specified |
| Invoice Creation | Financial | P0 | Specified |
| Infrastructure (Docker/CI-CD) | Platform | P0 | ✅ Built |

## Out of Scope (V2)

| Feature | Domain | Reason |
|---------|--------|--------|
| Mobile native apps | Mobile | PWA sufficient for V1 |
| AI Copilots (ML-based) | AI | Rule-based only V1 |
| Payment gateway | Financial | V2 integration |
| Advanced reporting | Executive | Dashboard sufficient |
| PMS integration | Integration | Manual CSV V1 |
| SSO (OIDC) | Platform | JWT auth sufficient |

## Scope Freeze Confirmation

- [ ] MVP scope documented and frozen
- [ ] All stakeholders agreed to scope
- [ ] No scope changes without formal change request
- [ ] Out-of-scope items documented with V2 timeline

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| CTO | | | |

**Status:** ❌ NOT CONFIRMED
