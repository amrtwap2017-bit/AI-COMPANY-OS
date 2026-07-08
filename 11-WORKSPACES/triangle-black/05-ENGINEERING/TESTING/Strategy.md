# Testing Strategy

| Field | Value |
|---|---|
| Document ID | 19-Testing-01 |
| Document Purpose | Define the overall testing strategy using the testing pyramid model |
| Version | 1.0 |
| Status | Approved |

## Testing Pyramid

```
        /\
       /E2E\
      /------\
     /Integr. \
    /----------\
   /   Unit     \
  /--------------\
```

| Level | Count | Speed | Purpose | Who Writes |
|---|---|---|---|---|
| Unit (bottom) | Many | Milliseconds | Validate individual functions/classes in isolation | Developers |
| Integration (middle) | Some | Seconds | Validate module interactions, API contracts, database | Developers |
| E2E (top) | Few | Minutes | Validate critical user journeys end to end | Developers + QA |

## Distribution

- **70%** Unit tests — fast, focused, high coverage of business logic
- **20%** Integration tests — API contract, database, middleware
- **10%** E2E tests — critical paths only

## Risk-Based Testing

Not all code is equal. Test effort is proportional to risk:

| Risk Level | Definition | Test Coverage Required | Example |
|---|---|---|---|
| Critical | Revenue-impacting, security, data integrity | 95%+ line coverage, full integration, E2E | Payment processing, authentication, booking |
| High | Core business logic, user-facing features | 85%+ line coverage, integration | User registration, search, profile |
| Medium | Support features, internal tools | 70%+ line coverage, unit tests | Admin dashboard, reporting |
| Low | Cosmetic, experimental, rarely used | Smoke tests only | Landing page, internal utilities |

## What to Test at Each Level

### Unit Tests
- Service methods with all dependencies mocked
- Pure functions and helpers
- Validation logic and DTO transformations
- Error handling paths and edge cases

### Integration Tests
- HTTP endpoints (request/response/status/headers)
- Database CRUD operations
- Authentication guards and middleware
- Request validation pipes
- Error response formatting

### E2E Tests
- User registration and login
- Hotel search and booking flow
- Payment processing (sandbox)
- Profile management
- Logout and session expiry

## Test Isolation

- Unit tests: no network, no database, no filesystem
- Integration tests: isolated test database, no external services
- E2E tests: staging environment, sandbox external services
- Tests must not depend on execution order
- Each test cleans up after itself

## Configuration

Test configuration is environment-specific:

```env
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/triangle_test
JWT_SECRET=test-secret
LOG_LEVEL=silent
```

## Cross-References

- [Unit.md](Unit.md) — Unit test specifics
- [Integration.md](Integration.md) — Integration test specifics
- [E2E.md](E2E.md) — E2E test specifics
- [Performance.md](Performance.md) — Performance test specifics
- [Security.md](Security.md) — Security test specifics
