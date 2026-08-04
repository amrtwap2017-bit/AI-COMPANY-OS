# Enterprise Architecture Registry v5

This registry is a machine-readable architecture layer above the existing repository. It is additive and descriptive. It does not replace runtime code or authorize deletion.

## Metadata contract

Every registry item uses, where applicable: `id`, `name`, `status` (`Existing`, `Partial`, `Planned`), `owner`, `source_paths`, `purpose`, `dependencies`, `interfaces`, `data_ownership`, `workflows`, `permissions`, `compatibility`, `lifecycle` and `last_verified`.

## Registry areas

| Directory | Contents |
|---|---|
| capabilities | enterprise business capabilities |
| domains | bounded contexts and ownership |
| workflows | process definitions and state contracts |
| entities | information model records |
| services | application/platform services |
| events | domain/integration event catalog |
| apis | API surface metadata |
| integrations | external boundaries and ACLs |
| ai | agent and AI capability metadata |
| decisions | architecture decision references |

Current implementation is intentionally classified; an architecture entry does not imply runtime implementation.
