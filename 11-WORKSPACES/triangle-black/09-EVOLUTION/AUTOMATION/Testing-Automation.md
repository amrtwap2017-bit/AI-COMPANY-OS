# 05 — Testing Automation

> Automated testing evolution for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — Testing-Strategy.md | Testing baseline |
| Phase 4 — CI-CD.md | CI pipeline |

## Test Pyramid

```
         ╱    ╲
        ╱ E2E ╲
       ╱ (5%)  ╲
      ╱───────────╲
     ╱ Integration ╲
    ╱    (20%)      ╲
   ╱──────────────────╲
  ╱     Unit Tests     ╲
 ╱       (75%)          ╲
╱────────────────────────╲
```

## Automated Test Types

| Type | Tool | Coverage Target | Run Frequency | Time Budget |
|------|------|----------------|---------------|-------------|
| Unit | Vitest / Jest | 80%+ | On commit | < 2 min |
| Component | Vitest / Testing Library | 70%+ | On commit | < 3 min |
| Integration | Supertest / Testcontainers | 60%+ | On PR | < 10 min |
| E2E | Playwright | Critical paths | On merge to main | < 15 min |
| Visual | Percy / Chromatic | Key screens | On PR | < 5 min |
| API | Postman / Newman | All endpoints | On PR | < 5 min |

## H1 Testing Automation Targets

| Initiative | Description | Timeline | Tool |
|------------|-------------|----------|------|
| Unit test baseline | All new code 80%+ coverage | Q1 | Vitest |
| Integration test suite | API + database integration | Q1 | Testcontainers |
| E2E critical paths | Login, booking, invoice | Q2 | Playwright |
| Visual regression | Key UI screens | Q2 | Percy |
| Performance tests | API load testing | Q2 | k6 |
| Security tests | SAST + dependency scan | Q1 | Semgrep |
| AI evaluation tests | Prompt consistency, safety | Q2 | Custom |

## Test Automation Metrics

| Metric | Current | H1 Target | H2 Target |
|--------|---------|-----------|-----------|
| Total automated tests | — | 500 | 2,000 |
| Test coverage (unit) | — | 80% | 85% |
| Test coverage (integration) | — | 60% | 75% |
| CI build time | — | < 15 min | < 10 min |
| Flaky test rate | — | < 1% | < 0.5% |
| Defect escape rate | — | < 10% | < 5% |
