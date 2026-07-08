# MVP-001 — Acceptance Criteria

## MVP Validation Checklist

### Infrastructure
- [ ] `git clone` → `pnpm install` → `docker compose up` → app running
- [ ] PostgreSQL connects and migrations run
- [ ] Health endpoint returns 200 at `/api/v1/health`
- [ ] Nginx reverse proxy routes correctly
- [ ] SSL certificate valid (production)

### Authentication
- [ ] Login with valid credentials returns JWT
- [ ] Login with invalid credentials returns 401
- [ ] Login with inactive user returns 401
- [ ] Refresh token returns new access token
- [ ] Access token expires after 15 minutes
- [ ] Refresh token expires after 7 days
- [ ] Logout invalidates refresh token

### Authorization
- [ ] Unauthenticated requests return 401
- [ ] Forbidden resource returns 403
- [ ] Admin can access admin endpoints
- [ ] Sales rep cannot access admin endpoints
- [ ] Cross-tenant access denied

### User Management
- [ ] Admin can list users (paginated)
- [ ] Admin can create user
- [ ] Admin can update user
- [ ] Admin can deactivate user
- [ ] User can view own profile at `/auth/me`

### File Upload
- [ ] Can upload PDF, DOCX, XLSX, JPG, PNG
- [ ] Cannot upload .exe, .zip, .js
- [ ] Upload >50MB rejected
- [ ] File metadata stored in database
- [ ] File stored on disk

### Notifications
- [ ] Notifications created on business events
- [ ] User can list notifications (paginated)
- [ ] User can mark notification as read
- [ ] User can mark all as read
- [ ] Unread count returns correct number

### Audit
- [ ] CREATE operations logged
- [ ] UPDATE operations logged
- [ ] DELETE operations logged
- [ ] Audit log includes old/new values
- [ ] Admin can query audit logs
- [ ] Audit logs paginated

## Smoke Tests

```typescript
// test/smoke/api.smoke.ts
describe('API Smoke Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('health check returns 200', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('login succeeds', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@triangleblack.tech', password: 'Admin@123' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('unauthorized returns 401', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/admin/users');
    expect(res.status).toBe(401);
  });
});
```

## Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (p95) | < 300ms | Jest performance tests |
| Page load | < 2.5s | Lighthouse |
| Lighthouse performance | >= 90 | Lighthouse CI |
| Lighthouse accessibility | >= 90 | Lighthouse CI |
| Lighthouse best practices | >= 90 | Lighthouse CI |
| Lighthouse SEO | >= 90 | Lighthouse CI |
| Bundle size (initial) | < 200KB | next/bundle-analyzer |
| Time to first byte | < 200ms | Server timing |

## Architecture Review

- [ ] Module boundaries respected
- [ ] No circular dependencies
- [ ] Packages follow dependency rules
- [ ] Prisma schema follows naming conventions
- [ ] API endpoints follow REST conventions
- [ ] Error handling consistent
- [ ] Audit trail complete

## Startup Cost Review

| Item | Budgeted | Actual | Pass |
|------|----------|--------|------|
| VPS (DigitalOcean) | $6/mo | $6/mo | ✅ |
| Domain | ~$0.84/mo | ~$0.84/mo | ✅ |
| SSL | $0 | $0 | ✅ |
| DNS/CDN | $0 | $0 | ✅ |
| CI/CD | $0 | $0 | ✅ |
| Monitoring | $0 | $0 | ✅ |
| **Total** | **$25-40/mo** | **~$6.84/mo** | ✅ |

## Go / No-Go

```
☐ All infrastructure checks passed
☐ All auth checks passed
☐ All authorization checks passed
☐ CRUD operations verified
☐ File upload/download verified
☐ Notifications verified
☐ Audit trail verified
☐ Performance within budget
☐ Security headers present
☐ CI/CD pipeline green
☐ Documentation updated
☐ Budget confirmed at ~$6.84/mo

Decision: [GO / NO-GO]
Date: _______________
Signed: _______________
```

## Phase 6 Readiness

- [ ] MVP Foundation approved ✅
- [ ] Coding standards verified ✅
- [ ] CI/CD passing ✅
- [ ] Documentation updated ✅
- [ ] **Phase 6 authorized** ☐

## Next Steps (Phase 6)

Phase 6 builds the business modules in this order:
1. CRM Module (Leads, Opportunities, Companies)
2. Quotations Module (RFQs, Quotations, Contracts)
3. Projects Module (Milestones, Surveys, Assessments)
4. Client Portal Module (Service Requests)
5. Reporting Module (Pipeline, Revenue, Projects)
6. Procurement Module (V2)
7. Inventory Module (V2)
