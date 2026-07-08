# 03 — Responsibility Matrix

> RACI matrix for post-transition operations.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 1 | Capability-Map.md | Capability ownership |
| Phase 9 | Process-Transition.md | Process ownership |

## RACI Key

- **R** — Responsible (does the work)
- **A** — Accountable (answerable for outcome)
- **C** — Consulted (provides input)
- **I** — Informed (kept up to date)

## Operations RACI

| Activity | DevOps | Support | Sales | Finance | COO | CTO |
|----------|--------|---------|-------|---------|-----|-----|
| Infrastructure monitoring | R | I | — | — | I | A |
| Incident response | R | C | — | — | I | A |
| Database maintenance | R | — | — | — | — | A |
| SSL renewal | R | — | — | — | — | I |
| Backup verification | R | — | — | — | — | A |
| Deployment | R | I | — | — | — | A |
| Customer onboarding | C | R | I | — | A | I |
| User training | C | R | — | — | A | I |
| Support tickets (T1) | — | R | — | — | A | I |
| Support tickets (T2) | R | C | — | — | I | A |
| Escalation | C | C | — | — | R | A |
| Sales lead | — | — | R | — | A | I |
| Proposals | — | — | R | — | A | I |
| Contracts | — | — | C | — | R | I |
| Billing | — | — | — | R | A | I |
| Revenue tracking | — | — | — | R | I | A |
| Customer satisfaction | — | R | — | — | A | I |
| Product feedback | C | R | C | — | A | R |
| Security monitoring | R | — | — | — | I | A |
| Compliance | R | — | — | — | I | A |

## Governance RACI

| Activity | DevOps | Support | Sales | Finance | COO | CTO | CEO |
|----------|--------|---------|-------|---------|-----|-----|-----|
| Strategic decisions | C | — | — | C | R | C | A |
| Budget approval | — | — | — | R | C | A | I |
| Go-live decisions | C | — | — | — | R | A | I |
| Architecture changes | R | — | — | — | I | A | I |
| Risk acceptance | C | — | — | — | C | R | A |
| SLA management | C | R | — | — | A | I | — |
| Vendor management | R | — | — | I | A | C | I |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT APPROVED
