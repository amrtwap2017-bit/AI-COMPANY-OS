# Authentication and Security Audit

## Verified implementation

`src/core/auth.py` uses bcrypt, JWT HS256, eight-hour access tokens and 30-day refresh tokens. `get_current_user` queries active users; role helpers exist. `src/core/tenant.py` resolves a token hotel ID, then database lookup, allows header override for elevated roles **or when no user hotel ID exists**, then falls back to a shared default hotel.

## Findings

| Severity | Finding | Evidence |
|---|---|---|
| P0 | Active V15 customer endpoints are not mounted; security tests for source routers do not prove the deployed runtime | runtime validator / `src/main.py` |
| P0 | Default tenant fallback and header acceptance without a bound hotel permit ambiguous tenant context | `src/core/tenant.py` |
| P0 | Development database credentials/defaults and test credentials remain tracked in code, scripts, docs, CI, and README | redacted secret scan |
| P1 | Registration accepts a client-supplied role and is unauthenticated | `src/commercial/auth/router.py` |
| P1 | Logout is stateless only; refresh tokens are not persisted/revoked | same |
| P1 | OpenAPI endpoint fails; contract/error exposure cannot be certified | runtime import |
| P1 | Rate limiting defaults effectively to 1,000,000 requests/min and tenant limit is disabled unless env enabled | `src/main.py` |
| P2 | In-memory login limiting is process-local and the JSON login path does not invoke its limiter helpers | auth router |

CORS, CSRF, uploads, SSRF, XSS, mass assignment, all IDOR paths, and all production headers are **NOT VERIFIED** end-to-end. No secrets are reproduced in this report.
