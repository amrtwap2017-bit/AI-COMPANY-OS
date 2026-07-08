# Go-Live Criteria

> Complete checklist of criteria required before Triangle Black can go live.

## Gate 1: Business Readiness

- [ ] Business model validated against Egypt hospitality market
- [ ] Revenue projections confirmed with pilot customers
- [ ] Hospitality domain expertise validated
- [ ] Business rules verified against actual workflows
- [ ] Capability coverage sufficient for pilot scope
- [ ] Executive sign-off obtained

## Gate 2: Product Readiness

- [ ] MVP scope frozen and agreed with pilot customers
- [ ] All P0 (Critical) features implemented and tested
- [ ] All P1 (High) features implemented and tested
- [ ] Acceptance criteria verified for all features
- [ ] UX validated with hospitality engineering users
- [ ] Accessibility baseline met (WCAG 2.1 A)
- [ ] Mobile screens tested on target devices
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)
- [ ] Product sign-off obtained

## Gate 3: Engineering Readiness

- [ ] Architecture review completed (no critical findings)
- [ ] Repository clean (no secrets, no dead code, no large files)
- [ ] All dependencies up to date with no critical vulnerabilities
- [ ] Code quality metrics meet thresholds
- [ ] All documentation up to date and accurate
- [ ] Technical debt documented with remediation plan
- [ ] All ADRs reviewed and enforced
- [ ] Engineering sign-off obtained

## Gate 4: Quality Assurance

- [ ] Test strategy documented and approved
- [ ] Unit test coverage >= 80%
- [ ] Integration tests passing for all API endpoints
- [ ] E2E tests passing for critical workflows (Lead→Contract, Project→Invoice)
- [ ] UAT completed with pilot customers (all critical paths)
- [ ] Regression suite passing
- [ ] Smoke tests passing on staging environment
- [ ] Performance tests show acceptable response times (P99 < 2s)
- [ ] Security penetration tests passed
- [ ] QA sign-off obtained

## Gate 5: Security Readiness

- [ ] Security audit completed (no high/critical findings)
- [ ] Threat model documented for all attack vectors
- [ ] No secrets in codebase (verified by automated scan)
- [ ] Encryption in transit (TLS 1.3) enforced
- [ ] Access control model verified (RBAC + tenant isolation)
- [ ] Backup strategy tested (restore verified)
- [ ] Disaster recovery plan documented and tested
- [ ] Incident response runbook ready
- [ ] Compliance requirements met (ETA E-Invoice, data privacy)
- [ ] Security sign-off obtained

## Gate 6: Infrastructure Readiness

- [ ] VPS provisioned and hardened (Ubuntu 24.04)
- [ ] Docker Compose verified (all 5 services start)
- [ ] Nginx configured (reverse proxy, SSL, rate limiting)
- [ ] PostgreSQL configured (connections, backups, performance)
- [ ] Storage configured (volumes, backups, retention)
- [ ] DNS configured (A records, subdomain for each tenant)
- [ ] SSL certificates issued and auto-renewal configured
- [ ] Monitoring and alerting configured
- [ ] Scaling plan documented
- [ ] Infrastructure sign-off obtained

## Gate 7: Operations Readiness

- [ ] Standard Operating Procedures documented
- [ ] Incident management process defined
- [ ] Escalation matrix documented
- [ ] Change management process defined
- [ ] Release management process defined
- [ ] Maintenance windows scheduled
- [ ] Support team trained and staffed
- [ ] Knowledge base populated with known issues
- [ ] AI operations process documented
- [ ] Operations sign-off obtained

## Gate 8: Customer Success Readiness

- [ ] Client onboarding process documented and tested
- [ ] Hotel onboarding process documented
- [ ] Training materials prepared (admin, user, field)
- [ ] User guides published (online help)
- [ ] FAQ published
- [ ] Support process documented (ticketing, SLAs)
- [ ] SLAs defined and agreed with operations
- [ ] Customer success sign-off obtained

## Gate 9: Commercial Readiness

- [ ] Sales playbook documented
- [ ] Proposal templates created
- [ ] Pricing published and communicated
- [ ] Contract templates created (legal review complete)
- [ ] Pilot program defined (scope, duration, success criteria)
- [ ] Customer journey mapped
- [ ] Marketing assets prepared (website, brochures, case studies)
- [ ] Commercial sign-off obtained

## Gate 10: Financial Readiness

- [ ] Infrastructure costs validated ($6-40/mo VPS + add-ons)
- [ ] Budget approved for first 12 months
- [ ] ROI projections confirmed
- [ ] Cashflow model verified (subscription revenue vs costs)
- [ ] Subscription billing process operational
- [ ] Vendor contracts in place (DO, domain, email, WhatsApp)
- [ ] Financial sign-off obtained

## Gate 11: AI Governance Readiness

- [ ] AI usage policy documented
- [ ] AI decision audit mechanism operational
- [ ] Prompt governance guidelines published
- [ ] Human approval required for AI decisions above threshold
- [ ] AI risk assessment completed
- [ ] AI sign-off obtained

## Gate 12: Executive Go/No-Go

- [ ] All 11 gates passed (score >= 7.0 each)
- [ ] Overall readiness score >= 9.0 / 10.0
- [ ] Launch checklist complete
- [ ] Rollback plan documented and rehearsed
- [ ] Hypercare team staffed and ready
- [ ] Success metrics defined and baselined
- [ ] Pilot hotels confirmed
- [ ] First 90 days plan documented
- [ ] Lessons learned process established
- [ ] Final approval obtained from Executive Committee

## Final Go/No-Go Decision

| Criteria | Status |
|----------|--------|
| All Gate 1-11 Passed | ❌ Pending |
| Overall Readiness >= 9.0 | ❌ Pending |
| Executive Approval | ❌ Pending |
| **Decision** | **❌ NOT APPROVED** |

This document is updated after each gate review. The final go/no-go decision is recorded here.
