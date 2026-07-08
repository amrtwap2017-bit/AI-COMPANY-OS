# 16 — Documentation

## Documentation Rules

| Rule | Description |
|------|-------------|
| D1 | Documentation lives in the repository |
| D2 | Documentation follows the same review process as code |
| D3 | Every major feature has a README in its directory |
| D4 | Every API endpoint has OpenAPI annotations |
| D5 | Every database table has documented columns |
| D6 | Every environment variable is documented in `.env.example` |
| D7 | All docs use Markdown, version alongside code |

## Document Types

| Type | Location | Purpose |
|------|----------|---------|
| README | Every directory | What, why, how for every component |
| ADR | `docs/adr/` | Architecture decisions |
| API docs | OpenAPI (code annotations) | Auto-generated API reference |
| Runbooks | `docs/runbooks/` | Operational procedures |
| Standards | `docs/standards/` | Frozen Phase 4 standards |
| Diagrams | `docs/diagrams/` | Mermaid diagrams |
| Templates | `docs/templates/` | PR, ADR, issue templates |

## ADR Index

```
docs/adr/
├── index.md                          # ADR registry
├── adr-001-modular-monolith.md       # Initial architecture decision
├── adr-002-schema-per-tenant.md      # Multi-tenancy approach
├── adr-003-nextjs-app-router.md      # Frontend framework
└── templates/adr-template.md         # ADR template
```

## Cross-Reference System

Every documentation file may contain cross-references using:

```
Related: Phase 3 Screen Registry → LS-01 (Lead List)
Source: Architecture Baseline v1.0 → ADR-002
Depends on: Standard 06 → Database naming conventions
```

## Versioning

| Artifact | Version | Location |
|----------|---------|----------|
| Engineering Constitution | v1.0.0 | `00-MASTER-ENGINEERING-CONTEXT/` |
| Phase 3 Digital Twin | v1.0.0 (frozen) | `PHASE-03-DIGITAL-TWIN-DESIGN/` |
| API Contracts | v1.0.0 | OpenAPI spec |
| Database Schema | v1.0.0 | Prisma schema + migration history |
