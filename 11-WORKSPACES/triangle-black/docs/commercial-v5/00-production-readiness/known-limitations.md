# Known Limitations (N-001 Verified)

## Critical Gaps
1. **Backup/Restore:** No automated backup cron or restore procedure verified in production.
2. **Monitoring/Alerting:** No external APM, log aggregation, or alerting integration active.
3. **Disaster Recovery:** No DR runbook or failover procedure documented.
4. **Observability Dashboard:** No Grafana/Datadog/Prometheus integration for runtime metrics.

## Moderate Gaps
5. **CI/CD Pipeline:** No GitHub Actions or automated deployment pipeline verified.
6. **Staging Environment:** No separate staging deployment for pre-production validation.
7. **Customer Onboarding Wizard:** Organization provisioning is manual (no self-service flow).
8. **Data Import Engine:** No CSV/Excel bulk import for customer migration.

## Low Gaps
9. **Predictive Maintenance API:** Router registered but endpoint returns 404 (prefix mismatch).
10. **Marketing Landing Page:** Root `/` route may redirect to `/login` via Next.js auth guard.
