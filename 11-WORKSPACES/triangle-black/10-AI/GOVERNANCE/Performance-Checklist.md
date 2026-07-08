# Performance Review Checklist

This checklist is used during performance reviews to verify that all performance targets and best practices are met. Items are organized by performance domain.

## Query Optimization

- [ ] Database queries are analyzed with EXPLAIN / query plan analysis
- [ ] Indexes cover all query patterns (no sequential scans on large tables)
- [ ] Composite indexes are designed for the most common query filters
- [ ] SELECT queries specify only required columns (no SELECT *)
- [ ] JOIN operations are optimized (appropriate join types, indexed foreign keys)
- [ ] Subqueries are evaluated for performance and converted to JOINs where beneficial
- [ ] UNION and UNION ALL usage is justified and optimized
- [ ] Full-text search uses dedicated search indexes (not LIKE '%...%')
- [ ] Query timeouts are configured to prevent long-running queries

## N+1 Query Detection

- [ ] ORM-generated queries are reviewed for N+1 patterns
- [ ] Eager loading is used where related data is always needed
- [ ] Batch loading is implemented for data loaders (e.g., GraphQL DataLoader)
- [ ] Lazy loading is intentional and does not cause cascading queries
- [ ] Query count per request is within acceptable thresholds
- [ ] Database round-trips are minimized where possible

## Caching Strategy

- [ ] Caching layers are identified and implemented (in-memory, distributed, CDN)
- [ ] Cache invalidation strategy is defined and tested
- [ ] Cache hit ratio targets are established and monitored
- [ ] HTTP caching headers (Cache-Control, ETag, Last-Modified) are configured
- [ ] Static assets are cached with appropriate TTL and versioning
- [ ] API responses are cached where idempotent and cacheable
- [ ] Database query result caching is applied for expensive queries
- [ ] Session data caching strategy is defined (not stuck in process memory)
- [ ] Cache stampede / thundering herd protection is in place

## Bundle Size & Asset Optimization

- [ ] JavaScript and CSS bundles are minified and tree-shaken
- [ ] Bundle size is within defined limits (check with analysis tools)
- [ ] Code splitting is implemented for route-level and component-level chunks
- [ ] Images are optimized (compressed, modern formats, responsive sizes)
- [ ] Font subsetting is used where applicable
- [ ] Unused dependencies and dead code are removed
- [ ] Asset compression (gzip, brotli) is enabled at the server/CDN level

## Lazy Loading

- [ ] Lazy loading is implemented for images and off-screen content
- [ ] Route-based lazy loading is used for front-end applications
- [ ] Virtual scrolling or pagination is used for large lists and tables
- [ ] Heavy libraries are loaded only when needed (dynamic imports)
- [ ] Web workers offload CPU-intensive tasks from the main thread
- [ ] Infinite scroll or progressive loading is optimized for performance

## Memory Usage

- [ ] Memory leaks are checked and ruled out (retained objects, closures, listeners)
- [ ] Large objects are not held in memory longer than necessary
- [ ] Object pooling is considered for frequently allocated objects
- [ ] Arrays and collections are pre-sized when the size is known
- [ ] File streams are properly disposed and not buffered entirely in memory
- [ ] Garbage collection pressure is minimized (avoid allocations in hot paths)
- [ ] Memory limits are configured for containers and processes
- [ ] Heap dumps are analyzed during load testing for leak detection

## Response Time Targets

- [ ] P50, P95, and P99 response time targets are defined for each endpoint
- [ ] API response times meet the defined SLA targets
- [ ] Database query response times meet the defined targets
- [ ] Page load times meet the defined targets (LCP, FID, CLS for web)
- [ ] Background job execution times meet the defined targets
- [ ] Response time targets are verified under expected load
- [ ] Slow endpoints are identified and optimized before release

## Load Test Results

- [ ] Load tests cover expected peak traffic with a safety margin (2x-5x)
- [ ] Load tests include realistic user behavior and think times
- [ ] Stress tests identify the breaking point of the system
- [ ] Soak/endurance tests verify stability over extended periods
- [ ] Spike tests verify recovery after traffic surges
- [ ] Throughput meets the defined SLA (transactions per second)
- [ ] Resource utilization (CPU, memory, disk I/O, network) stays within limits
- [ ] Auto-scaling triggers are validated during load tests
- [ ] No memory growth or degradation over the duration of soak tests
- [ ] Error rate under load is below the defined threshold (typically < 0.1%)
- [ ] Load test results are documented and compared against baselines
