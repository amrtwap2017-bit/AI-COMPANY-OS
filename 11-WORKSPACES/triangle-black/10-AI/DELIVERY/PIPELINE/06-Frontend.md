# Stage 06: Frontend

## Purpose

Implement the user-facing feature code including components, pages, state management, and API integration according to the API contracts and screen specifications.

## Agent Role

**Frontend Lead AI** — Responsible for all frontend implementation including UI components, state, and API integration.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| API Contracts | OpenAPI spec or GraphQL schema defining API endpoints and types |
| Screen Specs | UI mockups or screen descriptions from the requirement |
| Architecture Spec | Architecture artifact with status `APPROVED` (reference for data flow) |
| Backend Implementation | Backend artifact with status `APPROVED` (for API contract validation) |

## Process

### Step 1: Set Up Feature Structure
- Create the feature folder structure:
  - `src/features/<feature>/components/` — React components
  - `src/features/<feature>/pages/` — Route pages
  - `src/features/<feature>/hooks/` — Custom React hooks
  - `src/features/<feature>/services/` — API client functions
  - `src/features/<feature>/types/` — TypeScript types/interfaces

### Step 2: Define Types from API Contracts
- Generate TypeScript types from the OpenAPI spec or GraphQL schema.
- Ensure request/response types match the backend contracts exactly.
- Define any frontend-specific types (form state, UI state, etc.).

### Step 3: Implement API Services
- Create service functions for each API endpoint:
  - Use the shared HTTP client (axios/fetch wrapper).
  - Add request/response type annotations.
  - Handle error responses and transform them for UI consumption.

### Step 4: Implement State Management
- Choose the appropriate state pattern (React Query for server state, Context/Zustand for client state).
- Set up queries and mutations for data fetching.
- Define optimistic updates where appropriate for responsive UX.

### Step 5: Implement UI Components
- Build components following the project's design system.
- Use the component library (shadcn/ui, MUI, or equivalent).
- Implement responsive layouts using the project's breakpoint system.
- Handle all states: loading, empty, error, and success.

### Step 6: Implement Pages and Routing
- Create page components that compose feature components.
- Register routes in the application router.
- Implement navigation guards for authentication and authorization.

### Step 7: Write Tests
- Write unit tests for utility functions and hooks.
- Write component tests for UI components.
- Write integration tests for page-level behavior.

### Step 8: Verify Build and Lint
- Run `tsc --noEmit` to verify type correctness.
- Run `lint` and `format` to enforce code style.
- Run tests to confirm all pass.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Frontend Implementation Complete | All components, pages, hooks, services implemented |
| All Tests Pass | Unit and component tests pass |
| Type Check Passes | `tsc --noEmit` produces zero errors |
| Lint Clean | No linting violations |
| Build Succeeds | Application builds without errors |
| API Integration Verified | All API calls match backend contracts |
| Responsive Design Checked | Layouts work at all breakpoints |

## Artifact Template

```markdown
# Frontend Implementation: <Feature Title>

**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Files Created
| File | Purpose |
|------|---------|
| `components/OrderForm.tsx` | Order creation form |
| `components/OrderList.tsx` | Order list display |
| `pages/OrdersPage.tsx` | Orders route page |
| `hooks/useOrders.ts` | Order data fetching hook |
| `services/order.service.ts` | Order API client |
| `types/order.types.ts` | Order TypeScript types |

## Routes Added
| Path | Component | Auth Required |
|------|-----------|---------------|
| /orders | OrdersPage | Yes |
| /orders/new | OrderCreatePage | Yes |

## API Integration
| Method | Endpoint | Service Function |
|--------|----------|------------------|
| POST | /api/orders | createOrder() |
| GET | /api/orders/:id | getOrderById() |

## Test Summary
- Unit: 8 tests, 8 passed
- Component: 6 tests, 6 passed
- Coverage: 82%

## Build Status
- [x] TypeScript: no errors
- [x] Lint: clean
- [x] Build: successful
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| API type mismatch | Regenerate types from updated OpenAPI spec |
| Missing loading/error states | Add conditional rendering for all async states |
| Responsive layout broken | Test and fix at all breakpoints using CSS grid/flexbox |
| State management inconsistency | Verify single source of truth for all shared state |
| Accessibility violations | Run aXe or Lighthouse audit and fix violations |

## Cross-References

- [05-Backend.md](./05-Backend.md)
- [Standards: Coding Standards](../05-STANDARDS/Coding-Standards.md)
- [Standards: UX Standards](../05-STANDARDS/UX-Standards.md)
- [Standards: API Standards](../05-STANDARDS/API-Standards.md)
