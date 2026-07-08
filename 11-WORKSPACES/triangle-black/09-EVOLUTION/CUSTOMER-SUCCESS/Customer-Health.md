# 08 — Customer Health

> Customer health scoring and monitoring.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Customer-Journey.md | Journey stages |

## Health Score Components

| Component | Weight | Metric | Data Source |
|-----------|--------|--------|-------------|
| Product usage | 30% | DAU/MAU ratio, feature adoption | Analytics |
| Support engagement | 20% | Ticket volume, CSAT, response time | Support system |
| Business impact | 20% | Revenue, bookings processed | Billing |
| NPS/Satisfaction | 15% | NPS score, survey responses | NPS system |
| Relationship | 15% | QBR attendance, communication | CRM |

## Health Score Calculation

```
Health Score = (Usage × 0.30) + (Support × 0.20) + 
               (Business × 0.20) + (NPS × 0.15) + 
               (Relationship × 0.15)
```

## Health Categories

| Score | Category | Risk | Action |
|-------|----------|------|--------|
| 85-100 | Healthy | Low | Maintain, upsell |
| 70-84 | Needs attention | Medium | Proactive check-in |
| 50-69 | At risk | High | Intervention required |
| < 50 | Critical | Critical | Executive escalation |

## Health Monitoring

| Cadence | Activity | Owner | Output |
|---------|----------|-------|--------|
| Real-time | Health score updates | Automated | Dashboard |
| Daily | At-risk customer alert | Automated | Alert to CS |
| Weekly | Health review | CS team | Action items |
| Monthly | Health trend analysis | CS lead | Report |
| Quarterly | Deep dive (bottom 20%) | CS + Exec | Recovery plan |

## Intervention Playbooks

| Risk Signal | Playbook | Timeline |
|-------------|----------|----------|
| Low usage (< 3 days/week) | Re-engagement campaign, training | 1 week |
| Multiple support tickets | Root cause analysis, dedicated support | 48 hours |
| Negative NPS feedback | Personalized outreach, exec call | 24 hours |
| Billing issue | Finance + CS joint call | Immediate |
| Churn intent | Executive intervention, retention offer | Immediate |
