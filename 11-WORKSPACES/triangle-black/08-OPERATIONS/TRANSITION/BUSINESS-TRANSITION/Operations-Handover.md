# 03 — Operations Handover

> Handover of day-to-day operations from build to operations team.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | DevOps-Architecture.md | DevOps setup |
| Phase 8 | 07-OPERATIONS | Operations documentation |

## Operations Handover Items

| Item | Build Contact | Ops Contact | Documentation | Status |
|------|--------------|-------------|---------------|--------|
| VPS access (SSH keys) | CTO | DevOps Lead | VPS.md | ❌ |
| DNS provider access | CTO | DevOps Lead | DNS.md | ❌ |
| SSL certificate management | CTO | DevOps Lead | SSL.md | ❌ |
| Docker Compose files | CTO | DevOps Lead | Docker.md | ❌ |
| Database access | CTO | DevOps Lead | PostgreSQL.md | ❌ |
| CI/CD pipeline (GitHub) | CTO | DevOps Lead | CI-CD.md | ❌ |
| Container registry | CTO | DevOps Lead | Release.md | ❌ |
| Monitoring tools | CTO | DevOps Lead | Monitoring.md | ❌ |
| Backup scripts | CTO | DevOps Lead | Backup.md | ❌ |
| Support email/phone | CTO | Support Lead | Support.md | ❌ |
| Knowledge base | CTO | Support Lead | KnowledgeBase.md | ❌ |
| Customer contacts | CTO | COO | — | ❌ |
| Vendor contacts | CTO | COO | — | ❌ |

## Access Transfer Process

1. **Inventory** — List all systems requiring access
2. **Account creation** — Create accounts for ops team
3. **Permission grant** — Grant minimum required permissions
4. **Credential handover** — Transfer credentials via secure channel
5. **Verification** — Ops team confirms access works
6. **Revocation** — Build team access removed (or restricted)
7. **Documentation** — Access list documented in operations manual

## Operations Dashboard

Operations team gets access to:
- VPS (SSH, monitoring dashboard)
- DNS provider
- GitHub (read-only to main, write to deploy)
- Docker Compose management
- Database monitoring
- Support ticket system
- Email support account
- Monitoring alerts

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |
| DevOps Lead | | | |

**Status:** ❌ NOT HANDED OVER
