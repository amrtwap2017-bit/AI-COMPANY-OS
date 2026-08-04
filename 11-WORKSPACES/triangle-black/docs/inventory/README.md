# Enterprise Repository Inventory

Generated as the Phase 1 baseline for the Enterprise Repository Transformation. This is a documentation-only inventory of the current checkout, not a declaration that each component is production-ready.

## Authority note

The root files named in the transformation mission (`AGENTS.md`, `ARCHITECTURE.md`, `VISION.md`, `ROADMAP.md`, `WORKFLOWS.md`, `DESIGN_SYSTEM.md`, `AI_PLATFORM.md`, `SAAS.md`) do not exist at repository root. Until they are introduced and approved, the effective references are the existing architecture/governance folders and `docs/enterprise-blueprint-v4/`. This inventory records conflicts rather than silently resolving them.

## Inventory index

| File | Scope |
|---|---|
| [01_REPOSITORY_AND_DOCUMENTS.md](01_REPOSITORY_AND_DOCUMENTS.md) | repository roots, documentation and authority conflicts |
| [02_BACKEND_AND_API.md](02_BACKEND_AND_API.md) | routes, modules, services, repositories, schemas, jobs and integrations |
| [03_FRONTEND_AND_DESIGN.md](03_FRONTEND_AND_DESIGN.md) | pages, portals, components, hooks, clients and design artifacts |
| [04_DATA_AND_MIGRATIONS.md](04_DATA_AND_MIGRATIONS.md) | models, schema, migrations, events and data risks |
| [05_PLATFORM_SECURITY_AND_OPERATIONS.md](05_PLATFORM_SECURITY_AND_OPERATIONS.md) | configuration, secrets, permissions, runtime, DevSecOps and observability |
| [06_AI_KNOWLEDGE_AND_TWIN.md](06_AI_KNOWLEDGE_AND_TWIN.md) | agents, prompts, RAG, vector/graph, knowledge and AI services |

## Inventory method and limits

Inventories were created by static inspection of source, manifests, migrations, tests, deployment files and existing documentation. Credentials are inventoried by key/location only and are never reproduced. A runtime integration inventory must be revalidated in CI against an isolated database because the current tests rely materially on localhost services.

