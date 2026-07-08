# Phase 04 — Coding Standards

> TypeScript, NestJS, React, and Prisma coding standards.

## TypeScript Standards

| Rule | Standard |
|------|----------|
| Strict mode | `strict: true` in tsconfig |
| Null checks | Use `??` over `||`, use optional chaining `?.` |
| No `any` | Use `unknown` if type is uncertain |
| Enums | Prefer `const enum` or union types |
| Async | Use `async/await`, avoid raw promises |
| Imports | Organized by: external → internal → relative |

## NestJS Standards

| Pattern | Standard |
|---------|----------|
| Module structure | One module per domain, one controller per resource |
| Validation | DTO validation with `class-validator` + Zod |
| Error handling | Domain-specific exceptions extending `HttpException` |
| Guards | JwtAuthGuard (global), RolesGuard (per endpoint), PermissionGuard (per action) |
| Interceptors | TransformInterceptor for response formatting |

## React/Next.js Standards

| Pattern | Standard |
|---------|----------|
| Components | Server components by default, client `'use client'` when needed |
| Data fetching | React Query for client-side, server fetch for SSR |
| State | Zustand for client state, React Query for server state |
| Forms | React Hook Form + Zod validation |
| Styling | Tailwind utility classes, no CSS-in-JS |

## Prisma Standards

| Pattern | Standard |
|---------|----------|
| Schema | PascalCase model names, snake_case column names |
| Migrations | Descriptive names (`add_lead_scoring_fields`) |
| Queries | Use Prisma Client, raw SQL only for complex queries |
| Relations | Always include `onDelete: Cascade` where appropriate |

See `05-CODING-STANDARDS/`, `09-BACKEND-STANDARDS/`, `08-FRONTEND-STANDARDS/` for detailed standards.
