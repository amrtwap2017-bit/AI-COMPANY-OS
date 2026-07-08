# 02 — Monorepo Architecture

## Workspace Configuration

```jsonc
// pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {},
    "test": {},
    "typecheck": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Package Dependency Graph

```
apps/web ──┬── packages/ui
           ├── packages/types
           ├── packages/utils
           └── packages/database

apps/api ──┬── packages/types
           ├── packages/utils
           └── packages/database

apps/admin ──┬── packages/ui
             ├── packages/types
             ├── packages/utils
             └── packages/database

apps/worker ──┬── packages/types
              ├── packages/utils
              └── packages/database
```

## Package Specifications

| Package | Tech | Build Output | Purpose |
|---------|------|-------------|---------|
| apps/web | Next.js App Router | .next | Public website + Client Portal |
| apps/api | NestJS | dist | REST API server |
| apps/admin | Next.js App Router | .next | Operations + Executive Portals |
| apps/worker | NestJS standalone | dist | Background job processor |
| packages/ui | React + shadcn/ui | dist | Shared component library |
| packages/types | TypeScript | types | Shared type definitions |
| packages/config | — | json | ESLint, Prettier, tsconfig bases |
| packages/utils | TypeScript | dist | Shared utilities |
| packages/database | Prisma | generated | Schema, migrations, client |

## Shared Type System

```
packages/types/src/
├── index.ts
├── crm/
│   ├── lead.types.ts
│   ├── opportunity.types.ts
│   └── company.types.ts
├── quotations/
│   ├── quotation.types.ts
│   ├── contract.types.ts
│   └── rfq.types.ts
├── projects/
│   ├── project.types.ts
│   └── milestone.types.ts
├── portal/
│   └── service-request.types.ts
├── admin/
│   ├── user.types.ts
│   └── tenant.types.ts
├── api.types.ts              # Generic API response types
├── pagination.types.ts       # Pagination types
└── errors.types.ts           # Error types
```

## Cross-References

- 01-REPOSITORY-ENGINEERING: Repository root structure
- 05-CODING-STANDARDS: TypeScript conventions
- 06-DATABASE-STANDARDS: Prisma schema conventions
