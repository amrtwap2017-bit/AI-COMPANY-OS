# False Completion Register

| ID | Looks complete | Actual evidence | Severity |
|---|---|---|---|
| FC-01 | V15 docs say all gaps closed | runtime logs 11 critical V15 routes missing | P0 |
| FC-02 | startup validation exists | wired at import, non-fatal, reports failures and app continues | P0 |
| FC-03 | routers/modules exist | grouped registration NameError prevents mounting | P0 |
| FC-04 | OpenAPI/docs endpoints exist | OpenAPI generation crashes on Pydantic forward reference | P1 |
| FC-05 | customer data firewall exists | no production caller uses `CustomerDataScope` | P0 |
| FC-06 | recommendation approval closes adoption loop | approval does not emit adoption event | P1 |
| FC-07 | evidence ledger is a migrated ledger | schema created dynamically at runtime and route absent | P1 |
| FC-08 | pilot baseline exists | recalculated live; no immutable snapshot/version | P1 |
| FC-09 | TypeScript gate exists | direct type check fails; build errors are ignored | P1 |
| FC-10 | backup/restore scripts equal DR | no execution/remote/restore proof; variants unsafe | P1 |
