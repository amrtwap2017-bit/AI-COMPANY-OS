# 46 Production Gates

| Gate | Evidence | Status | Blocker |
|---|---|---|---|
| Docker | config only; daemon denied | PARTIAL | no deployment evidence |
| VM/firewall/DNS/TLS | none | NOT TESTED | no environment |
| Secrets | tracked defaults/history | FAIL | rotate/manage required |
| DB/Redis/storage | config only | NOT TESTED | unavailable |
| Health | routes/config | PARTIAL | contract/runtime failure |
| Security/tenant/firewall | source gaps | FAIL | P0 isolation |
| Backups/restore/monitoring/rollback | scripts only | NOT TESTED | no drill |
| Smoke/Playwright/certification | type/OpenAPI fail | FAIL | quality/runtime |
