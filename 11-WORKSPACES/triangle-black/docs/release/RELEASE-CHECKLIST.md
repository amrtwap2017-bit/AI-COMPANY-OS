# Production Release Checklist
Execute these steps before promoting any release candidate (RC) to production.

- [ ] Run Build Guard verification locally (`git commit` triggers automatically).
- [ ] Run full backend unit and integration test suite: `pytest tests/`.
- [ ] Run Playwright E2E browser tests: `npx playwright test`.
- [ ] Execute pre-deployment DB backup: `python scripts/backup_db.py`.
- [ ] Check Alembic migration integrity: `alembic current` matches head.
- [ ] Verify environment variables are set in production environment matrix.
- [ ] Deploy Release Candidate to isolated Staging environment.
- [ ] Perform live health status check: `/api/v1/health/ready` returns 200.
