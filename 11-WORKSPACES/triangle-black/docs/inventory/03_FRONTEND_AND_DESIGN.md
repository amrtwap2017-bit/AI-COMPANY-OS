# Frontend, UX and Design Inventory

## Applications

| Application | Scope | Current inventory |
|---|---|---|
| `portal/` | primary operations platform | 239 `page.tsx` routes, 120 components, 39 API modules, 9 unit-test files. |
| `client-portal/` | client-facing contract/quote/invoice/project activity | 10 page routes and separate axios/auth implementation. |
| `admin-portal/` | legacy/admin management | 7 page routes and separate axios/auth implementation. |

## Portal workspace families

Supply Chain (51 pages), Operations (28), Maintenance (18), Commercial (15), Executive (12), Projects Center (9), Engineering (9), Administration (9), Analytics (6), Customers (6), and several legacy routes for inventory, invoices, quotes, contracts, work orders and technicians.

## Components, hooks and providers

- Component families: `components/ui`, `components/workspace`, `components/documents`, `components/shell`, plus older root components.
- Shared UI export surface exists in `portal/components/ui/index.ts`, but consumers also use direct components and hard-coded layouts/styles.
- Hooks include API/domain hooks, safe-query/auth hooks, search/pagination and workflow hooks; backup hook files (`*.p1bak`, `*.q1bak`) remain in source paths.
- Auth/token state exists in `auth-context`, `token-manager`, `token-store`, `tb-client`, auth middleware, `AuthGuard`, raw local-storage usage and separate portal implementations.

## UX/design observations

- Global CSS tokens, TypeScript token constants and `platform-config.ts` provide three partially overlapping design/configuration authorities.
- 694 hard-coded style color occurrences and 499 `@ts-nocheck` files were found.
- 25 direct page-level fetch implementations bypass canonical API clients.
- 61 pages explicitly contain placeholder/mock/TODO language; many duplicate page bodies are compatibility redirects.
- State coverage is incomplete: 25 loading boundaries, 19 error boundaries and one not-found boundary for 239 pages.

## Accessibility and responsiveness inventory

The design system provides focus styles and reusable primitives, but there is no verified accessibility test suite, keyboard/semantic contract, contrast gate, responsive acceptance matrix or route-level accessibility audit. These become mandatory for canonical pages; existing pages remain functional through compatibility layouts.

## Required frontend registry

Every page must declare route, workspace, workflow, primary entity, roles, feature flag, API contract, loading/empty/error coverage, accessibility owner, lifecycle (`canonical`, `redirect`, `experimental`, `deprecated`) and replacement route.

