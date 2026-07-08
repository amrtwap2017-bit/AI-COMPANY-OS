# Performance Review Gate

## Gate Keeper

**Performance Engineer AI** — Automated performance analysis that evaluates the performance impact of changes and validates against defined SLAs.

## When Triggered

This gate is triggered when any of the following occur:

- **API changes**: New or modified API endpoints.
- **New queries**: New database queries or modifications to existing queries.
- **UI changes**: New UI components, pages, or significant UI modifications.
- **Data processing changes**: New or modified data processing pipelines.
- **Infrastructure changes**: Changes to infrastructure that affect performance.
- **Any change with potential performance impact**: As determined by architecture review.

## Review Criteria

### 1. Query Performance (N+1 Detected?)

- All database queries are reviewed for the N+1 query problem.
- ORM-generated queries are inspected for efficiency.
- Query execution plans are analyzed for full table scans on large tables.
- Index usage is verified for new queries.
- Query response times are within defined thresholds.

### 2. Response Time Within SLA

- API endpoint response times are measured and compared to SLAs.
- P50, P95, and P99 latencies are recorded.
- Response time targets:
  - Simple read operations: < 100ms (P95)
  - Simple write operations: < 200ms (P95)
  - Complex queries/reports: < 500ms (P95)
  - File uploads: < 5s (P95)
- Any SLA violations are flagged for remediation.

### 3. Bundle Size Impact

- Frontend bundle size changes are measured.
- New dependencies contributing to bundle size are evaluated.
- Bundle size budget is enforced:
  - Initial load: < 200KB (gzipped)
  - Total application: < 500KB (gzipped)
  - Per-page budget: < 100KB incremental
- Code splitting is verified for new routes/modules.

### 4. Caching Strategy Applied

- Caching is implemented for frequently accessed data.
- Cache invalidation strategy is documented and correct.
- Cache hit ratios are estimated for new cache implementations.
- HTTP caching headers are properly configured for API responses.
- Redis/Memcached usage follows best practices.

### 5. Load Test Results Acceptable

- For significant changes, load tests are executed.
- Load test scenarios cover expected peak traffic plus 50% headroom.
- Key metrics:
  - Maximum throughput (requests/second)
  - Error rate under load (< 1%)
  - Response time degradation under load (< 50% increase at peak)
  - Resource utilization (CPU, memory, connection pools)
- Results are compared against baseline measurements.

### 6. Resource Utilization

- Memory usage is within limits (no memory leaks introduced).
- CPU utilization is reasonable for the workload.
- Connection pool sizes are appropriate and not exhausted.
- File descriptor and thread usage are within limits.

### 7. Concurrency Handling

- Code is thread-safe where shared state exists.
- Lock contention is minimized.
- Asynchronous operations are properly bounded.
- Rate limiting is in place for external service calls.

### 8. Scalability Assessment

- The change does not negatively affect horizontal scalability.
- Stateful components are identified and their scaling characteristics documented.
- Database connection pooling is appropriate for the expected concurrency.

## Review Process

1. Change is submitted with performance impact assessment.
2. Performance Engineer AI runs automated performance tests (query analysis, bundle analysis, response time benchmarks).
3. For significant changes, load tests are triggered in a performance test environment.
4. Results are compared against baselines and SLAs.
5. Performance review report is generated with findings and recommendations.
6. Performance regressions must be addressed or justified.

## Gate Output

- **Approved**: Performance impact is acceptable.
- **Conditional Pass**: Non-critical performance issues found; must be addressed before production.
- **Failed**: Performance regression exceeds thresholds.
- **Blocked**: Significant performance issues prevent release.

## Performance Budgets

| Metric | Budget | Alert | Block |
|---|---|---|---|
| API response time (P95) | < SLA | > 80% of SLA | > SLA |
| Bundle size (initial) | < 200KB | > 150KB | > 200KB |
| Query execution time | < 100ms | > 50ms | > 200ms |
| Error rate under load | < 1% | > 0.5% | > 1% |
| Memory per request | < 50MB | > 30MB | > 50MB |

## Non-Compliance

Performance failures block the release. Performance regressions must be fixed, or a performance exception must be approved by the Engineering Lead. Repeated performance issues may trigger architectural review.
