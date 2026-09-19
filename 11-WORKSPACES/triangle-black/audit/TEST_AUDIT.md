# Test Audit

Read-only collection used `PYTHONDONTWRITEBYTECODE=1 pytest --collect-only -q -p no:cacheprovider`: **3,880 collected / 78 deselected**. This differs from the historical 3,835/3,834 claim. No full test run was performed because configured tests/migrations require a PostgreSQL service and may mutate test data; no local PostgreSQL was reachable.

Tests cover many source modules, security paths and route-order regressions. They do not prove the imported production app because that app currently logs 11 missing critical routes and OpenAPI failure. The CI workflow runs migrations and tests against an ephemeral DB, but its Ruff and Bandit gates explicitly tolerate failures (`|| true`), and its type gate accepts up to 50 errors. Passing historical counts are therefore PARTIALLY VERIFIED only.
