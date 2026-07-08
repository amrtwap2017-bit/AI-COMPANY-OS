# Performance Testing

| Field | Value |
|---|---|
| Document ID | 19-Testing-05 |
| Document Purpose | Define performance and load testing standards |
| Version | 1.0 |
| Status | Approved |

## Framework

[k6](https://k6.io/) for load and performance testing.

```javascript
// tests/performance/api-load.k6.ts
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up
    { duration: '3m', target: 50 },  // Steady load
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.01'],             // Error rate below 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/hotels?city=Riyadh`],
    ['GET', `${BASE_URL}/api/hotels?city=Jeddah`],
    ['GET', `${BASE_URL}/api/health`],
  ]);

  responses.forEach((res) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(res.status !== 200);
    responseTime.add(res.timings.duration);
  });

  sleep(1);
}
```

Run:

```bash
k6 run tests/performance/api-load.k6.ts
```

## API Response Time Targets

| Endpoint | p50 | p95 | p99 |
|---|---|---|---|
| Health check | <50ms | <100ms | <200ms |
| GET list (hotels, users) | <200ms | <500ms | <1s |
| GET detail | <100ms | <300ms | <500ms |
| POST create | <300ms | <500ms | <1s |
| PUT update | <300ms | <500ms | <1s |
| DELETE | <200ms | <400ms | <800ms |
| Search (with filters) | <500ms | <1s | <2s |

## Database Query Performance

- All queries must be analyzed with `EXPLAIN ANALYZE`
- Queries returning >1000 rows must be paginated
- N+1 queries are forbidden — use Prisma `include` or `select` with joins
- Indexes must exist on all foreign keys and frequently queried columns

```sql
EXPLAIN ANALYZE SELECT * FROM "User" WHERE "email" = 'test@example.com';
-- Target: Index Scan, <10ms
```

Slow query log threshold: 100ms. Queries exceeding this are logged and reported.

## Load Testing Scenarios

| Scenario | Virtual Users | Duration | Target |
|---|---|---|---|
| Normal load | 50 | 5 min | p95 <500ms, errors <1% |
| Peak load | 200 | 3 min | p95 <1s, errors <2% |
| Stress test | 500 | 2 min | System doesn't crash |
| Soak test | 50 | 30 min | No memory leak, no degradation |

## When to Run

| Test Type | Frequency | Trigger |
|---|---|---|
| Baseline | Every release | CI on release branch |
| Peak load | Before major release | Manual trigger |
| Stress test | Quarterly | Scheduled |
| Soak test | Quarterly | Scheduled |
| DB query perf | Every PR with query changes | CI |

## Reporting

- k6 outputs results to console and optional JSON/CSV
- Results are compared against previous baseline
- Any regression >20% in p95 blocks release
- Historical results stored in `tests/performance/reports/`

## Cross-References

- [Strategy.md](Strategy.md) — Testing strategy overview
- [10-Database/](../10-Database/) — Database indexing and query patterns
- [17-Engineering/CI-CD.md](../17-Engineering/CI-CD.md) — CI integration
