# 05 — Robotic Process Automation (RPA)

> RPA for legacy system integration.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Automation-Roadmap.md | Automation scope |
| Phase 7 — Integration | Legacy system connectors |

## RPA Principles

1. **API-first** — Prefer API integration over screen scraping
2. **Temporary bridge** — RPA is transitional, not permanent
3. **Structured logging** — Every RPA action logged
4. **Error recovery** — Retry with exponential backoff
5. **Human exception** — Escalate if cannot auto-resolve

## RPA Use Cases

| Process | System | Automation | Frequency | Complexity |
|---------|--------|-----------|-----------|------------|
| Legacy PMS data import | Third-party PMS | CSV → API import | Daily | Medium |
| Bank reconciliation | Banking portal | Statement download → match | Daily | Low |
| Supplier invoice entry | Supplier portal | PDF → extract → enter | Weekly | Medium |
| Tax filing data export | Gov portal | Extract → format → upload | Monthly | High |
| Employee data sync | HR system | Bi-directional sync | Hourly | Medium |

## RPA Technology

| Tool | Use Case | Cost |
|------|----------|------|
| Custom Python scripts | Structured API/CSV | Free |
| Selenium/Puppeteer | Web automation | Free |
| n8n / Node-RED | Low-code workflows | Free/OSS |
| Browser extension | Manual trigger automation | Free |

## RPA Governance

| Aspect | Policy |
|--------|--------|
| Bot access | Dedicated service accounts, no human credentials |
| Logging | All bot actions logged to central audit |
| Monitoring | Bot health dashboard, failure alerts |
| Fallback | Manual process documented for each bot |
| Testing | Dry-run mode before production |
| Security | No RPA on critical financial systems without dual control |
