# 08 — NPS Surveys

> Net Promoter Score survey program.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Customer-Health.md | Health scoring |
| Phase 10 — CS-Operations.md | CS operations |

## Survey Cadence

| Survey | Timing | Trigger | Audience | Response Target |
|--------|--------|---------|----------|----------------|
| Onboarding NPS | 14 days after go-live | Auto | New customers | > 60% |
| Relationship NPS | Quarterly | Calendar | All customers | > 40% |
| Transactional NPS | After support ticket | Auto | Ticket submitters | > 50% |
| Feature NPS | 30 days after feature launch | Auto | Feature users | > 30% |
| Churn NPS | On cancellation | Auto | Cancelling customers | > 70% |

## Survey Question

> "How likely are you to recommend Triangle Black to a colleague?"
>
> Scale: 0 (Not at all likely) - 10 (Extremely likely)
>
> Optional follow-up: "What is the primary reason for your score?"
> Optional follow-up: "What can we do better?"

## NPS Calculation

```
NPS = % Promoters (9-10) - % Detractors (0-6)
Passives (7-8) are counted but not scored.

Example: 50% Promoters, 30% Passives, 20% Detractors
NPS = 50 - 20 = 30
```

## Response Handling

| Score Category | Action | Owner | Timeline |
|---------------|--------|-------|----------|
| Promoter (9-10) | Thank you, referral request | Automated + CS | 24 hours |
| Passive (7-8) | Thank you, feedback review | Automated | 24 hours |
| Detractor (6) | Personalized follow-up | CS | 48 hours |
| Detractor (0-5) | Executive outreach | CS Lead + CTO | 24 hours |

## NPS Goals

| Metric | H1 Target | H2 Target | H3 Target |
|--------|-----------|-----------|-----------|
| Relationship NPS | 30 | 40 | 50 |
| Onboarding NPS | 40 | 50 | 60 |
| Support CSAT | 4.0/5 | 4.3/5 | 4.5/5 |
| Survey response rate | 40% | 50% | 60% |
| Detractor recovery rate | 30% | 50% | 70% |
