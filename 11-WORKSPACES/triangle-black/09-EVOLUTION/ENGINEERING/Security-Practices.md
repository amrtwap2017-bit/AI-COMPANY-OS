# 09 — Security Practices

> Security practices evolution for engineering.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — Security-Standards.md | Security baseline |
| Phase 8 — 05-Security-Readiness.md | Security readiness |

## Security Evolution

```
L1: BASIC (V1.0)                   L2: STRUCTURED (H1)
├── HTTPS enforced                  ├── SAST in CI
├── Basic auth (JWT)               ├── Dependency scanning
├── Environment secrets            ├── Secret scanning
├── Basic CORS                     ├── Security review process
└── SQL injection prevention       ├── Penetration testing (manual)
                                    └── Incident response plan

L3: ADVANCED (H2)                  L4: PROACTIVE (H3+)
├── DAST in staging                 ├── Threat modeling
├── Bug bounty program              ├── Continuous security validation
├── Security Champions program      ├── AI-powered threat detection
├── Compliance automation           ├── Zero-trust architecture
├── Regular third-party audit       ├── Automated compliance
└── WAF + DDoS protection          └── Security as code
```

## Security Practices

| Practice | Tool | H1 | H2 |
|----------|------|----|----|
| SAST (Static Analysis) | Semgrep | ✅ | ✅ |
| SCA (Dependency scan) | Dependabot + Snyk | ✅ | ✅ |
| Secret scanning | git-secrets + CI | ✅ | ✅ |
| DAST (Dynamic) | OWASP ZAP | — | ✅ |
| Container scanning | Trivy | ✅ | ✅ |
| Infrastructure scanning | Checkov | — | ✅ |
| Penetration testing | External | Quarterly | Monthly |
| Bug bounty | Private | — | H2+ |

## Incident Response

| Phase | Activity | Owner | Timeline |
|-------|----------|-------|----------|
| Detection | Monitoring alerts / user report | Ops | Immediate |
| Triage | Severity assessment | Security lead | < 15 min |
| Containment | Isolate affected systems | Engineering | < 1 hour |
| Eradication | Remove cause | Engineering | < 4 hours |
| Recovery | Restore to normal | Engineering | < 8 hours |
| Post-mortem | Root cause, lessons learned | All | < 1 week |

## Security Training

| Training | Audience | Frequency | Format |
|----------|----------|-----------|--------|
| Security awareness | All employees | Annually | Online |
| Secure coding | Developers | Quarterly | Workshop |
| Incident response | Engineering | Bi-annually | Tabletop |
| Phishing simulation | All employees | Monthly | Automated |
