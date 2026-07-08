# Testing Strategy

## Test Pyramid

```
    ╱\
   ╱ E2E ╲          3-5 critical user journeys
  ╱────────╲
 ╱ Integration ╲     Each service, controller, API endpoint
╱────────────────╲
╱   Unit Tests     ╲  Every service method, pure function, DTO validation
╱────────────────────╲
```

## Unit Tests (Jest)

| Scope | Coverage Target | What to Test |
|-------|----------------|-------------|
| Services | 90%+ | Business logic, rules, state transitions |
| Pure functions | 100% | Number generators, currency calc, validators |
| DTOs | 100% | Validation rules for each field |

Example:
```typescript
describe('LeadService', () => {
  let service: LeadService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LeadService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
        { provide: NotificationService, useValue: mockDeep<NotificationService>() },
      ],
    }).compile();
    service = module.get(LeadService);
    prisma = module.get(PrismaService);
  });

  describe('convertToOpportunity', () => {
    it('should create opportunity and update lead status', async () => {
      // Mock prisma.lead.findUnique to return active lead
      // Mock prisma.opportunity.create
      // Assert lead status = 'converted'
      // Assert opportunity stage = 'qualification'
    });
  });
});
```

## Integration Tests

| Scope | Approach |
|-------|----------|
| Controllers | Supertest + test database |
| API endpoints | HTTP requests against NestJS app |
| Database | Real PostgreSQL test container |
| File uploads | Temporary upload directory |

```typescript
describe('Leads (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('POST /api/v1/crm/leads', () => {
    return request(app.getHttpServer())
      .post('/api/v1/crm/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'John', lastName: 'Doe', source: 'website' })
      .expect(201)
      .expect(res => {
        expect(res.body.data.firstName).toBe('John');
      });
  });
});
```

## E2E Tests

| Journey | Steps |
|---------|-------|
| Lead-to-Project | Create lead → convert to opportunity → create quotation → send → approve → create contract → activate → create project → add milestones |
| Service Request | Client submits request → admin acknowledges → engineer works → resolves |
| User Management | Admin creates user → user logs in → updates profile → admin deactivates |

## CI Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: triangle_black_test
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/triangle_black_test
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:coverage
```

## Test Data Factories

```typescript
// test/factories/lead.factory.ts
export function buildLead(overrides?: Partial<Lead>): CreateLeadDto {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    source: 'website',
    ...overrides,
  };
}
```
