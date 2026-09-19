# Production Gate Matrix

| Gate | Result | Evidence |
|---|---|---|
| VM / OS / firewall / DNS / TLS | NOT TESTED | no deployed environment evidence |
| Docker / compose | PARTIAL | files exist; not deployed |
| staging / production separation | PARTIAL | config files exist; no environments verified |
| secrets | FAIL | development/historical values tracked; no rotation proof |
| DB / migrations | PARTIAL | Alembic head exists; DB unavailable |
| Redis / storage | NOT TESTED | config only |
| health checks | PARTIAL | routes/config exist |
| security / tenant isolation / customer exposure | FAIL | missing V15 routes, unused firewall, fallback tenant |
| backups / restore | NOT TESTED | scripts only |
| monitoring / rollback | NOT TESTED | artifacts only |
| smoke tests / Playwright / certification | FAIL | no current successful evidence; TS error/OpenAPI failure |

Overall production gate: **FAIL**.
