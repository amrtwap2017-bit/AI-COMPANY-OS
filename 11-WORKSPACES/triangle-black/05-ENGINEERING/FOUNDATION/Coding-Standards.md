# Coding Standards

| Field | Value |
|---|---|
| Document ID | 17-Engineering-01 |
| Document Purpose | Define TypeScript coding conventions for all Triangle Black projects |
| Version | 1.0 |
| Status | Approved |

## Language

All backend (NestJS) and frontend (Next.js) code is written in **TypeScript** with `strict` mode enabled.

## Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| Files | kebab-case | `user-service.ts`, `api-client.ts` |
| Classes | PascalCase | `UserService`, `CreateUserDto` |
| Interfaces | PascalCase, no `I` prefix | `UserPayload`, `ApiResponse` |
| Types | PascalCase | `Nullable<T>`, `UserRole` |
| Enums | PascalCase, members PascalCase | `enum UserRole { Admin, Guest }` |
| Functions | camelCase | `getUserById()` |
| Variables | camelCase | `userName`, `isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Private fields | prefix with `_` (JS private `#` only when needed in classes) | `_cache` |
| Booleans | prefix with `is`, `has`, `can`, `should` | `isLoading`, `hasAccess` |
| DTOs | suffix `Dto` | `CreateUserDto` |
| Services | suffix `Service` | `AuthService` |
| Guards | suffix `Guard` | `JwtAuthGuard` |
| Interceptors | suffix `Interceptor` | `LoggingInterceptor` |
| Pipes | suffix `Pipe` | `ValidationPipe` |
| Modules | suffix `Module` | `UserModule` |
| Controllers | suffix `Controller` | `UserController` |

## File Structure

```
src/
  modules/
    user/
      user.module.ts
      user.controller.ts
      user.service.ts
      dto/
        create-user.dto.ts
        update-user.dto.ts
      entities/
        user.entity.ts
      interfaces/
        user-payload.interface.ts
      tests/
        user.service.spec.ts
        user.controller.spec.ts
  common/
    guards/
    interceptors/
    pipes/
    filters/
    decorators/
  config/
  database/
    prisma/
      schema.prisma
      migrations/
      seeds/
```

- One class per file, filename matches class name
- Tests live in `tests/` directory alongside the module
- Shared utilities go in `common/`
- Configuration in `config/`

## Imports

Order imports in groups separated by a blank line:

1. Node built-ins (`fs`, `path`)
2. External packages (`@nestjs/*`, `prisma`, `rxjs`)
3. Internal absolute imports (`@/modules/...`, `@/common/...`)
4. Relative imports (`./dto/...`, `../entities/...`)

```typescript
import { readFile } from 'node:fs';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/user/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
```

## Exports

- Prefer named exports over default exports
- Use `export type` for type-only exports
- Barrel `index.ts` files re-export public API of a module

```typescript
// user/index.ts
export * from './user.service';
export * from './user.controller';
export * from './dto/create-user.dto';
export * from './entities/user.entity';
```

## Error Handling

- Use NestJS exception filters (`@Catch()`) for HTTP error handling
- Domain errors extend `Error` with a `code` property
- Never swallow errors silently — log and rethrow or transform
- Use `Result` pattern or custom error types for expected failures

```typescript
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
```

- Catch at controller layer, translate to HTTP exceptions
- Unhandled exceptions fall through to global exception filter

## Async Patterns

- Prefer `async/await` over raw `.then()/.catch()`
- Parallel independent operations with `Promise.all()` or `Promise.allSettled()`
- Avoid promise constructor antipattern
- Use `AbortController` for cancellable operations
- Never pass async functions as callbacks without error handling

```typescript
// Good
const [user, posts] = await Promise.all([
  userService.findById(id),
  postService.findByUserId(id),
]);

// Good with error isolation
const results = await Promise.allSettled([task1(), task2()]);
```

## Configuration

- Environment variables accessed via validated config objects (`@nestjs/config`)
- Configuration validated at startup with `joi` or `zod`
- Never use `process.env` directly in business logic

## Linting & Formatting

- ESLint with `@typescript-eslint` rules — `npm run lint` must pass
- Prettier for formatting — `npm run format` before commit
- ESLint rules: `no-unused-vars` (error), `no-console` (error — use logger)
- `strict` TypeScript: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`

## Cross-References

- [Git.md](Git.md) — Commit conventions for lint hooks
- [PR-Review.md](PR-Review.md) — Code review standards
- [Testing.md](Testing.md) — Test requirements per level
