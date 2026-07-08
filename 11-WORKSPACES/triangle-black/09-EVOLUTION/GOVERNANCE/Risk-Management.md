# 12 — Risk Management

> Enterprise risk management framework.

## Reference Chain

| Source | Input |
|--------|-------|
| 06-RISK-REGISTER.md | Master risk register |

## Risk Management Process

```
Identify ──► Assess ──► Mitigate ──► Monitor ──► Review
   │          │          │            │          │
  Risk     Likelihood  Controls    Tracking   Quarterly
  register + impact   + action    + metrics   + update
```

## Risk Categories

| Category | Examples | Owner |
|----------|----------|-------|
| Strategic | Competitor entry, market shift | CTO + COO |
| Operational | System outage, data loss | Engineering |
| Financial | Cash flow, pricing pressure | CEO |
| Compliance | Regulatory change, data breach | COO |
| Technology | Technical debt, vendor dependency | CTO |
| People | Key person risk, hiring challenges | COO |
| Market | Economic downturn, COVID-like event | CTO + COO |

## Risk Assessment Matrix

```
                    Impact
              Low    Med    High   Critical
Likelihood   ┌──────────────────────────┐
    High     │ Med  │ High │ Crit │ Crit │
             ├──────┼──────┼──────┼──────┤
    Med      │ Low  │ Med  │ High │ Crit │
             ├──────┼──────┼──────┼──────┤
    Low      │ Low  │ Low  │ Med  │ High │
             ├──────┼──────┼──────┼──────┤
    Rare     │ Low  │ Low  │ Low  │ Med  │
             └──────────────────────────┘
```

## Top Risks (H1)

| Risk | Category | L | I | Score | Mitigation | Owner |
|------|----------|---|---|-------|------------|-------|
| Revenue delay | Financial | M | H | High | Bootstrap runway, consult | CTO |
| Key person departure | People | M | H | High | Cross-training, docs | COO |
| Data breach | Security | L | C | High | Security controls | CTO |
| Competitor launch | Strategic | M | M | Med | Speed, focus on niche | CTO |
| Tech debt accumulation | Technology | H | M | Med | 20% time for debt | CTO |

## Risk Monitoring

| Cadence | Activity | Owner |
|---------|----------|-------|
| Weekly | Risk review in team sync | CTO |
| Monthly | Risk register update | CTO |
| Quarterly | Risk assessment refresh | Exec team |
| Annually | Full risk management review | All |
