# Repository and Documentation Inventory

## Top-level implementation areas

| Area | Current purpose | Classification |
|---|---|---|
| `src/` | active FastAPI backend and commercial modules | primary runtime candidate |
| `portal/` | primary operations Next.js portal (239 pages) | primary UI candidate |
| `client-portal/`, `admin-portal/` | separate role-specific Next.js applications | active compatibility applications |
| `domain/`, `application/`, `infrastructure/`, `api/` | root-level Python architecture experiments | legacy/parallel; ownership must be explicitly classified |
| `agent/` | local developer AI agent, Chroma index and executor | internal AI tooling, not governed product AI |
| `alembic/` | database migration history | active but unsafe baseline pending validation |
| `tests/` | Python API/live-test suite | incomplete release gate |
| `00-ARCHITECT` through `13-ARCHIVE`, `99-META` | documented strategy, design, governance and history | reference corpus with implementation drift |

## Documentation corpus

The repository has approximately 810 Markdown documents across enterprise architecture, business, design, governance, operations, evolution, AI, knowledge and meta layers. This is a major asset, but it is not an executable source of truth.

### Conflicts requiring an ADR

| Documented claim | Current executable evidence | Required decision |
|---|---|---|
| NestJS/Prisma backend and schema-per-tenant model | FastAPI/SQLAlchemy runtime; shared tables with optional `hotel_id` filtering | designate current FastAPI modular monolith as baseline and define tenant migration path. |
| Redis, queues, workers, tracing and event bus | no active broker/worker runtime topology in compose | mark as target architecture, not current state. |
| DDD/CQRS/event-driven modules | most logic remains router/raw-SQL driven | define incrementally enforceable context template. |
| Single authoritative architecture set | named root authority files are absent | approve a canonical documentation hierarchy and ADR process. |

## Existing architectural references

- `00-ARCHITECT/*`: principles, Clean Architecture and future architecture.
- `02-GOVERNANCE/*`: architecture principles, quality, risk and traceability.
- `03-BUSINESS/DOMAIN/*` and `03-BUSINESS/WORKFLOWS/*`: bounded contexts and operating workflows.
- `04-DESIGN/*`, `06-DOMAINS/*`, `07-INTEGRATION/*`, `10-AI/*`: design, domain, integration and AI intent.
- `docs/enterprise-blueprint-v4/*`: approved architecture baseline produced in the preceding audit.

## Required inventory governance

Every future module must register its owner, runtime status, public API, configuration keys, migration history, workflows, data classification, test suite and deprecation status in this inventory family.

