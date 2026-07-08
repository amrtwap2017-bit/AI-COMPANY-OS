# 01 — Repository Engineering

## Purpose
Define the complete repository structure: folder layout, file naming, package organization, and workspace configuration.

## Repository Root

```
triangle-black/
├── apps/
│   ├── web/              # Next.js App Router — frontend
│   ├── api/              # NestJS — backend API
│   ├── admin/            # Next.js Admin Portal (separate app)
│   └── worker/           # Background job processor (NestJS standalone)
├── packages/
│   ├── ui/               # Shared React components (shadcn/ui)
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configuration (eslint, tsconfig, prettier)
│   ├── utils/            # Shared utility functions
│   └── database/         # Prisma schema, migrations, seeds
├── docs/                 # Phase 3 Digital Twin Design (frozen reference)
├── scripts/              # Build, deploy, utility scripts
├── docker/               # Docker Compose files per environment
├── .github/              # GitHub Actions + issue/PR templates
├── configs/              # Tool configurations
├── tools/                # CLI tools, code generators
├── .gitignore
├── package.json          # Root workspace package.json
├── turbo.json            # Turborepo configuration
├── docker-compose.yml    # Development compose
└── README.md
```

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Turborepo | Workspace orchestration, caching, parallel tasks |
| pnpm workspaces | Fast, disk-efficient, strict dependency resolution |
| Single Prisma schema | Shared database types across all apps |
| Docker Compose for dev | Consistent environment, no local PostgreSQL install needed |

## Cross-References

- 02-MONOREPO-ARCHITECTURE: Detailed package design
- 03-GIT-STRATEGY: Branching for this structure
- 05-CODING-STANDARDS: Code conventions within each package
