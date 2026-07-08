# Phase 00 — Strategic Roadmap

> Long-term strategic direction from V1 to V3.

## Strategic Horizons

```
Horizon 1 (V1: Year 1)          Horizon 2 (V2: Year 2)           Horizon 3 (V3: Year 3-5)
─────────────────────────        ─────────────────────────        ─────────────────────────
Egypt market validation          MENA regional expansion          Multi-region platform
Core platform delivery           Advanced features                Partner marketplace
5-10 customers                   20-40 customers                  100+ customers
$15K-50K ARR                     $100K-250K ARR                   $500K-2M+ ARR
```

## Horizon 1: Egypt Market Validation (Months 1-12)

### Phase 0-4: Foundation (Months 1-3)
- ✅ Vision, business model, architecture defined
- ✅ Design freeze on strategic foundation
- ✅ Engineering standards established

### Phase 5: Platform (Months 3-5)
- ✅ Working NestJS auth (JWT, bcrypt, refresh tokens)
- ✅ Prisma ORM with schema-per-tenant
- ✅ Docker Compose (5 services)
- ✅ GitHub Actions CI/CD

### Phase 6: Business Domains (Months 5-9)
- ✅ 13 domain modules specified
- ✅ 285 files across all domains
- ✅ Lead-to-contract workflow traced

### Phase 7: Integration (Months 9-12)
- ✅ Integration boundaries designed
- ✅ ETA E-Invoice integration specified
- ✅ SMTP, WhatsApp, Calendar integrations specified

### Go-Live Checklist
- [ ] Production VPS configured ($6-40/mo)
- [ ] SSL/HTTPS enabled
- [ ] Monitoring and alerts configured
- [ ] Backup pipeline operational
- [ ] UAT completed with pilot customer
- [ ] Training materials prepared
- [ ] Support runbook documented

## Horizon 2: MENA Regional Expansion (Year 2)

### Product
- Payment gateway integration (Fawry/Paymob)
- SSO (Google/Azure AD)
- Advanced reporting (custom dashboards)
- Mobile native apps (iOS/Android)
- AI Copilot enhancement (predictive models)

### Market
- Saudi Arabia hospitality market entry
- UAE hospitality market entry
- Arabic language support
- Multi-currency support
- Regional data residency options

### Business
- 20-40 customers across Egypt + MENA
- Channel partner program
- Industry conference presence
- Case studies and testimonials

## Horizon 3: Multi-Region Platform (Year 3-5)

### Product
- Partner marketplace (third-party service providers)
- IoT integration (equipment monitoring)
- Advanced ML models (maintenance prediction, pricing optimization)
- White-label option for enterprise customers

### Market
- 100+ customers globally
- Multiple data center regions
- SOC2 / ISO 27001 certification
- Enterprise sales team

### Business
- $500K-2M+ ARR
- Series A funding consideration
- 20+ team members
- International partner network

## Strategic Assumptions

| Assumption | Validation Method | Timeline |
|------------|-------------------|----------|
| Egypt hospitality firms need integrated platform | Pilot customer interviews | Month 1-3 |
| Willing to pay EGP 3,000-15,000/mo | Pricing A/B test with pilot | Month 6-9 |
| ETA compliance is a key purchasing driver | Customer discovery calls | Month 1-3 |
| Lead-to-contract workflow is highest priority | Sales process analysis | Month 1-3 |
| Mobile offline capability differentiates | Competitor analysis | Month 3-6 |

## Strategic Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Market not ready for integrated platform | High | Build MVP, validate with pilot |
| Price sensitivity higher than expected | Medium | Introduce starter tier at EGP 3,000 |
| Competitor launches similar product | Medium | Focus on hospitality domain depth |
| Regulatory changes in Egypt | Medium | Configurable compliance engine |
| Talent retention for niche domain | Low | AI-assisted development, documentation |
