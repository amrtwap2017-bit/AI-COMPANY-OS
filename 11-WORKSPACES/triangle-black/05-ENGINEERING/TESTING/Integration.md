# Integration Testing

| Field | Value |
|---|---|
| Document ID | 19-Testing-03 |
| Document Purpose | Define integration testing standards with Supertest and Prisma |
| Version | 1.0 |
| Status | Approved |

## Framework

[Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) for HTTP integration tests. A separate configuration targets integration tests:

```typescript
// jest.integration.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.integration\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  setupFilesAfterSetup: ['../test/setup-integration.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  globalSetup: '../test/global-setup.ts',
  globalTeardown: '../test/global-teardown.ts',
};

export default config;
```

Run with:

```bash
npm run test:integration
```

## What to Test

| Test | Examples |
|---|---|
| API endpoints | `POST /api/users`, `GET /api/users/:id` |
| Request validation | Missing fields, invalid types, out-of-range values |
| Authentication | Valid token, expired token, missing token, invalid token |
| Authorization | User cannot access admin endpoints |
| Error responses | 400, 401, 403, 404, 500 format and body |
| Database operations | CRUD through Prisma in test database |
| Middleware & guards | Rate limiting, logging, correlation ID |

## Test Database

Integration tests use a dedicated PostgreSQL database.

```typescript
// test/setup-integration.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Run migrations on test database
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Database Test Fixtures

```typescript
// test/fixtures/user.fixture.ts
import { PrismaClient } from '@prisma/client';

export async function createUserFixture(prisma: PrismaClient, overrides = {}) {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: '$2b$10$hashedpassword',
      role: 'USER',
      ...overrides,
    },
  });
}
```

Fixtures should be:
- Reusable across tests
- Overridable with partial data
- Cleaned up after each test suite

## Test Lifecycle

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('UserController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  describe('POST /api/users', () => {
    it('should create a user and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'new@example.com', name: 'New User', password: 'Str0ng!Pass' })
        .expect(201);

      expect(response.body).toMatchObject({
        email: 'new@example.com',
        name: 'New User',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'invalid', name: 'Test', password: 'Str0ng!Pass' })
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      await createUserFixture(prisma, { email: 'dup@example.com' });

      await request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'dup@example.com', name: 'Dup', password: 'Str0ng!Pass' })
        .expect(409);
    });
  });
});
```

## Isolation

- Each test suite gets a clean database state
- Use `prisma.$transaction` to wrap and roll back if needed
- Or truncate all tables between suites:

```typescript
async function cleanDatabase(prisma: PrismaClient) {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
}
```

## Coverage Targets

- Lines: 60%+ (lower than unit because integration covers fewer files)
- Focus: API endpoints, auth flows, error responses

## Cross-References

- [Strategy.md](Strategy.md) — Testing strategy overview
- [Unit.md](Unit.md) — Unit test specifics
- [10-Database/](../10-Database/) — Database schema reference
- [13-API/](../13-API/) — API contract definitions
