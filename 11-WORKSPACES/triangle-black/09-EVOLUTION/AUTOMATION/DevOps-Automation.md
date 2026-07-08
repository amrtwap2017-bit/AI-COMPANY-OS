# 05 — DevOps Automation

> DevOps automation for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — DevOps-Architecture.md | DevOps baseline |
| Phase 4 — CI-CD.md | CI/CD pipeline |

## CI/CD Automation

| Stage | Automation | Trigger | Duration Target |
|-------|-----------|---------|-----------------|
| Code commit | Lint, typecheck, format check | Git push | < 2 min |
| Unit tests | Run unit tests | PR create | < 5 min |
| Integration tests | Run integration tests | PR merge to main | < 10 min |
| Build | Docker image build | Main branch | < 5 min |
| Deploy staging | Auto-deploy to staging | Main branch | < 3 min |
| E2E tests | Run E2E tests | Staging deploy | < 15 min |
| Deploy production | Manual approval + auto-deploy | Release tag | < 5 min |
| Post-deploy | Smoke tests, health check | Deploy complete | < 2 min |

## Infrastructure Automation

| Resource | Automation Tool | Provisioning Time |
|----------|---------------|-------------------|
| VPS instance | Terraform | < 10 min |
| Database | Terraform + Ansible | < 15 min |
| DNS | Terraform | < 2 min |
| SSL certificate | Certbot + cron | < 1 min |
| Firewall rules | Ansible | < 1 min |
| Monitoring | Ansible + Prometheus | < 5 min |
| Backup | Cron + script | < 1 min |

## Automated Security

| Security Task | Automation | Frequency |
|--------------|-----------|-----------|
| Dependency scanning | Dependabot, Snyk | On commit + weekly |
| Secrets scanning | git-hooks + CI | On commit |
| Container scanning | Trivy in CI | On build |
| SAST | Semgrep in CI | On PR |
| DAST | OWASP ZAP in staging | Weekly |
| Compliance check | Custom scripts | Monthly |

## DevOps Metrics

| Metric | Target |
|--------|--------|
| Deployment frequency | Multiple times/day |
| Lead time from commit to deploy | < 30 min |
| Change failure rate | < 5% |
| Time to restore service | < 30 min |
| Build success rate | > 95% |
| Test coverage | > 80% |
