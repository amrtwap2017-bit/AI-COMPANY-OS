# Phase 04 — Monorepo Architecture

> Monorepo organization using npm/pnpm workspaces.

## Workspace Structure

```
triangle-black (root)
├── apps/
│   ├── api/          # NestJS backend
│   │   ├── prisma/   # Schema + migrations
│   │   └── src/
│   └── web/          # Next.js frontend
│       └── src/
├── packages/
│   └── shared/       # @triangle-black/shared
│       ├── src/
│       │   ├── types/
│       │   ├── enums/
│       │   ├── constants/
│       │   └── validation/
│       └── package.json
└── package.json       # Workspace root
```

## Workspace Configuration

- **Package manager**: pnpm (preferred) or npm workspaces
- **TypeScript**: Project references for cross-package type checking
- **Build**: Turborepo for build caching and parallel execution
- **Shared types**: `@triangle-black/shared` for types, enums, validation schemas
- **No circular dependencies**: ESLint rule enforces this

## Build Order

```
shared → api (NestJS)
shared → web (Next.js)
```

See `02-MONOREPO-ARCHITECTURE/` for detailed monorepo configuration.
