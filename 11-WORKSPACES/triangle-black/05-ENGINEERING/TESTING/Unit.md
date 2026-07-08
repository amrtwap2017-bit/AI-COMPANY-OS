# Unit Testing

| Field | Value |
|---|---|
| Document ID | 19-Testing-02 |
| Document Purpose | Define unit testing standards with Jest |
| Version | 1.0 |
| Status | Approved |

## Framework

[Jest](https://jestjs.io/) with `ts-jest` for TypeScript support.

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.interface.ts',
    '!main.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 85,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
```

## What to Unit Test

| Test | Examples |
|---|---|
| Service methods | `UserService.create()`, `BookingService.calculateTotal()` |
| Helper/utility functions | `dateUtils.formatDate()`, `priceUtils.calculateTax()` |
| Domain logic | `DiscountPolicy.apply()`, `RateLimitChecker.isAllowed()` |
| DTO validation | `CreateUserDto` validation rules |
| Error handling | Service throws correct error for invalid input |

## What Not to Unit Test

- Framework internals (NestJS DI, Prisma query building)
- Configuration loading
- Controllers (covered by integration tests)
- Database queries (covered by integration tests)
- Third-party library behavior

## Mocking Strategy

### Tools
- `jest.fn()` for simple functions
- `jest.spyOn()` for partial mocks
- Custom mocks in `tests/__mocks__/` directory

### Guidelines
- Mock external dependencies (database, HTTP clients, file system)
- Do not mock the system under test
- Use type-safe mocks with `jest.Mocked<T>` or `Partial<Record<keyof T, jest.Mock>>`
- Prefer dependency injection over manual mocking — inject mocks via `Test.createTestingModule`

```typescript
// Example service test
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  it('should create a user', async () => {
    const dto = { email: 'test@example.com', name: 'Test' };
    const expected = { id: '1', ...dto, createdAt: new Date() };
    prisma.user.create.mockResolvedValue(expected);

    const result = await service.createUser(dto);

    expect(result).toEqual(expected);
    expect(prisma.user.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should throw if email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' } as any);

    await expect(service.createUser({ email: 'exists@example.com', name: 'Test' }))
      .rejects.toThrow('Email already exists');
  });
});
```

## Coverage Targets

| Metric | Target | Enforcement |
|---|---|---|
| Lines | 80% | CI fail below threshold |
| Branches | 70% | CI fail below threshold |
| Functions | 85% | CI fail below threshold |
| Statements | 80% | CI fail below threshold |

## Test File Organization

```
src/modules/user/
  user.service.ts
  tests/
    user.service.spec.ts
    user.controller.spec.ts   # optional, prefer integration
    dto/
      create-user.dto.spec.ts
```

Test filenames mirror source filenames with `.spec.ts` suffix.

## Best Practices

1. **Arrange-Act-Assert**: Structure each test with clear sections
2. **One behavior per test**: Test one thing, assert one thing
3. **Descriptive names**: `it('should return error when email is invalid')`
4. **No logic in tests**: No conditionals, loops, or complex computation
5. **Deterministic**: No random values, no dates relative to "now" without control
6. **Fast**: Unit tests must complete in <30s total

## Cross-References

- [Strategy.md](Strategy.md) — Testing strategy overview
- [Integration.md](Integration.md) — Integration tests for controllers
- [17-Engineering/Testing.md](../17-Engineering/Testing.md) — Testing philosophy
