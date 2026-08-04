# Repository Refactoring Plan Without Deletion

| Area | Legacy | Bridge | Target | Compatibility layer | Removal criteria | Owner / priority |
|---|---|---|---|---|---|---|
| API composition | `src/main.py` orchestration and direct routes | route registry/application facade | thin composition root | preserve imports and routes | zero direct business/DDL logic; migration telemetry complete | Backend / P0 |
| Persistence | raw SQL and ad-hoc engines | repository adapters/mappers | context repositories and ports | legacy repository facade | all consumers use ports; query/error parity | Data / P0 |
| Domain | root `domain/application/infrastructure/api` plus `src/domain` | anti-corruption adapters | context-local Clean Architecture | import shims | no active consumer; approved ADR | Architecture / P1 |
| Identity | `core.auth`, main RBAC, portal token stores | verified identity facade | Identity Platform | login/token adapters | all clients on canonical contract | Security / P0 |
| Tenant | hotel/default/header paths | tenant context/membership mapper | Organization/Site/Tenant Platform | `hotel_id` compatibility | all tenant routes policy-scoped | Platform / P0 |
| Approvals | approval center/chain/requests | workflow policy adapter | Workflow Engine | route facades | all active processes versioned | Workflow / P1 |
| Notifications | notifications/email/SSE variants | channel/template facade | Notification Platform | existing endpoints/templates | delivery telemetry and consumers migrated | Platform / P1 |
| Invoices | duplicate Invoice models | Finance mapper/read model | Finance aggregate | legacy table and response mapper | data reconciliation and consumer migration | Finance / P0 |
| Frontend | three portals and 39 API clients | shared packages/wrappers | platform UI/client package | URL/import redirects | parity and consumer migration | Frontend / P1 |
| AI | feature-local Ollama/Qdrant/Chroma calls | gateway/tool adapters | AI Operating Layer | existing endpoints as tools | gateway coverage and evaluation | AI / P1 |
| Graph | knowledge graph/digital twin variants | event projection adapter | Digital Twin service | legacy query facade | replay/reconciliation evidence | Data/AI / P2 |

