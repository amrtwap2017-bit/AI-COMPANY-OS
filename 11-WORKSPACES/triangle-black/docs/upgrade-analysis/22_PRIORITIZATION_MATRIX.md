# Prioritization Matrix

## Scoring Model
Business Impact (BI) 1-5
User Impact (UI) 1-5
Security Risk (SR) 1-5
Technical Risk (TR) 1-5
Architecture Impact (AI) 1-5
Implementation Effort (IE) 1-5 (lower = easier)
Score = (BI + UI + SR + TR + AI) / IE

## Top 25 Gaps Prioritized

| Rank | Gap | BI | UI | SR | TR | AI | IE | Score | Priority |
|------|-----|----|----|----|----|----|----|-------|----------|
| 1 | No CI/CD quality gates | 5 | 3 | 5 | 5 | 4 | 2 | 11.0 | P0 |
| 2 | No RBAC enforcement | 5 | 4 | 5 | 4 | 4 | 3 | 7.3 | P0 |
| 3 | main.py 8265 lines monolith | 4 | 2 | 3 | 5 | 5 | 4 | 4.8 | P1 |
| 4 | 458 raw SQL in routers | 4 | 2 | 3 | 5 | 5 | 5 | 3.8 | P1 |
| 5 | hotel_id only tenancy | 5 | 3 | 4 | 4 | 5 | 4 | 5.3 | P1 |
| 6 | 238 ts-nocheck directives | 3 | 3 | 2 | 4 | 3 | 3 | 5.0 | P1 |
| 7 | 7 notification modules | 3 | 4 | 2 | 3 | 4 | 3 | 5.3 | P2 |
| 8 | 3 approval modules | 3 | 3 | 2 | 3 | 4 | 3 | 5.0 | P2 |
| 9 | 1223 inline styles | 2 | 4 | 1 | 2 | 3 | 3 | 4.0 | P2 |
| 10 | 732 hardcoded colors | 2 | 3 | 1 | 2 | 3 | 2 | 5.5 | P2 |
| 11 | No design token system | 3 | 4 | 1 | 2 | 4 | 3 | 4.7 | P2 |
| 12 | No contract tests FE/BE | 4 | 3 | 2 | 3 | 3 | 2 | 7.5 | P1 |
| 13 | No staging environment | 4 | 2 | 3 | 4 | 3 | 2 | 8.0 | P1 |
| 14 | Stale NestJS documentation | 2 | 2 | 1 | 3 | 3 | 1 | 11.0 | P2 |
| 15 | No SLO enforcement | 3 | 3 | 2 | 3 | 3 | 2 | 7.0 | P2 |
| 16 | Duplicate invoice model | 3 | 2 | 2 | 3 | 4 | 3 | 4.7 | P2 |
| 17 | No audit trail UI | 2 | 4 | 2 | 2 | 3 | 2 | 6.5 | P2 |
| 18 | No domain unit tests | 4 | 2 | 2 | 4 | 4 | 3 | 5.3 | P1 |
| 19 | No health check dashboard | 2 | 3 | 2 | 2 | 2 | 1 | 11.0 | P3 |
| 20 | No AI evaluation pipeline | 3 | 2 | 3 | 3 | 4 | 3 | 5.0 | P2 |
| 21 | Executive read model not wired | 2 | 3 | 1 | 2 | 3 | 1 | 11.0 | P3 |
| 22 | No disaster recovery test | 3 | 1 | 4 | 3 | 2 | 2 | 6.5 | P2 |
| 23 | No secrets management | 3 | 1 | 5 | 3 | 2 | 2 | 7.0 | P1 |
| 24 | No rate limit per API key | 2 | 2 | 3 | 2 | 2 | 2 | 5.5 | P3 |
| 25 | No onboarding flow | 4 | 4 | 1 | 2 | 3 | 3 | 4.7 | P2 |
