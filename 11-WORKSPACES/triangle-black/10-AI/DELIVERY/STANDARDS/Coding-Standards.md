# Coding Standards

## Language & Runtime

- TypeScript 5.x with strict mode enabled (`strict: true` in `tsconfig.json`).
- Target Node.js 20 LTS.
- Use ES2022 modules (`"module": "ES2022"`, `"moduleResolution": "bundler"`).

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Classes | PascalCase | `OrderService` |
| Interfaces | PascalCase with `I` prefix | `IOrderRepository` |
| Types | PascalCase | `OrderStatus` |
| Enums | PascalCase, members UPPER_CASE | `OrderStatus.PENDING` |
| Functions/Variables | camelCase | `getOrderById` |
| Private properties | camelCase with `#` prefix | `#cache` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files | kebab-case | `order.service.ts` |
| Test files | `<name>.test.ts` | `order.service.test.ts` |
| Directories | kebab-case | `order-management/` |

## File Structure

Each feature module follows Clean Architecture:

```
src/domains/<feature>/
  domain/
    entities/
    value-objects/
    events/
    repository-interfaces/
  application/
    use-cases/
    dtos/
    ports/
  infrastructure/
    repositories/
    adapters/
    config/
  presentation/
    controllers/
    request-models/
    response-models/
    routes/
    middleware/
```

## Import Order

1. Built-in modules (`node:*`)
2. Third-party packages (`express`, `zod`, `prisma`)
3. Internal absolute imports (`@/domains/...`, `@/shared/...`)
4. Relative imports (`./`, `../`)
5. Type-only imports (`import type { ... }`)

Each group separated by a blank line. No barrel/index imports.

```typescript
import { createHash } from 'node:crypto';

import { z } from 'zod';
import type { Request, Response } from 'express';

import { IOrderRepository } from '@/domains/orders/domain/repository-interfaces/order-repository.interface';
import { CreateOrderDTO } from '@/domains/orders/application/dtos/create-order.dto';

import { OrderMapper } from './order.mapper';
```

## Error Handling

- Use custom error classes extending `AppError`:
  ```typescript
  export class NotFoundError extends AppError {
    constructor(resource: string, id: string) {
      super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
    }
  }
  ```
- Domain errors are thrown in the domain/application layers.
- Infrastructure errors are caught and wrapped in domain errors.
- Controllers use a global error-handling middleware.
- Never catch and swallow errors without logging.
- Use `Result` pattern for recoverable errors instead of exceptions.

## Async Patterns

- Use `async/await` exclusively (no raw `.then()` chains).
- All async functions must have explicit return types.
- Use `Promise.all` for independent concurrent operations.
- Use `Promise.allSettled` when partial failures are acceptable.
- Avoid `Promise.race` — use `AbortController` with timeout instead.

```typescript
async function processOrders(ids: string[]): Promise<void> {
  const results = await Promise.allSettled(
    ids.map(id => processOrder(id))
  );
  
  const failures = results.filter(
    (r): r is PromiseRejectedResult => r.status === 'rejected'
  );
  
  if (failures.length > 0) {
    logger.error(`Failed orders: ${failures.length} of ${ids.length}`);
  }
}
```

## TypeScript Strictness

- `strict: true` — mandatory.
- Prefer `interface` over `type` for object shapes.
- Use `type` for unions, intersections, and utility types.
- Avoid `any` — use `unknown` and type guards.
- Use `as const` for literal types and enum-like constants.
- Use branded types for domain primitives:

```typescript
type Brand<T, B> = T & { __brand: B };
type OrderId = Brand<string, 'OrderId'>;

function createOrderId(value: string): OrderId {
  if (!isValidUUID(value)) throw new Error('Invalid order ID');
  return value as OrderId;
}
```

## Testing Patterns

See [Testing Standards](./Testing-Standards.md) for full details.

- Unit tests cover domain entities, value objects, and use cases.
- Integration tests cover repository implementations.
- All tests use factories from `@/test/factories/`.
- No HTTP calls in unit tests — mock all external dependencies.
- Each `describe` block tests one module; each `it` tests one behavior.

## Code Formatting

- **Formatter**: Prettier with `printWidth: 100`, `singleQuote: true`, `trailingComma: all`.
- **Linter**: ESLint with `@typescript-eslint/strict` config.
- Format on save enabled.
- Run `lint` and `format` before every commit.

## Logging

- Use structured JSON logging (Pino or equivalent).
- Log levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`.
- Include correlation ID on every log entry.
- Never log sensitive data (PII, tokens, passwords).

```typescript
logger.info({ orderId: order.id, status: order.status }, 'Order processed');
```

## Dependencies

- Pin exact versions in `package.json`.
- Use `npm audit` and `snyk` (or equivalent) for vulnerability scanning.
- No cyclic dependencies between feature modules.
- Shared code goes in `src/shared/` or `src/common/`.
