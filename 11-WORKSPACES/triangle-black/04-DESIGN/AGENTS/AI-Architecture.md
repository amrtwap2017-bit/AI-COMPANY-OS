# AI Architecture

## Principles

1. **AI is horizontal** — AI agents integrate across all modules (CRM → Quotations → Projects → Portal)
2. **Decision support, not automation** — Agents recommend, humans decide
3. **V1 = rule-based** — No LLM calls, no external APIs, no GPU requirements
4. **V2+ evolution** — Add lightweight ML (linear regression, random forest) when data volume justifies it (>10,000 records)

## Agent Types

| Agent | Module | Input | Output | V1/V2 |
|-------|--------|-------|--------|-------|
| Lead Scorer | CRM | Lead fields, source, activity | Score (0-100), priority | V1 |
| Opportunity Router | CRM | Lead score, workload | Auto-assignment suggestion | V1 |
| Quotation Validator | Quotations | Line items, margin, history | Invalid flags, margin alert | V1 |
| Overdue Detector | All | Due dates, statuses | Overdue notifications | V1 |
| Pipeline Forecaster | Executive | Historical pipeline data | 30/60/90 day forecast | V2 |
| Anomaly Detector | Projects | Budget, timeline, milestones | Risk flags | V2 |
| Smart Prioritizer | Notifications | Request type, priority, SLA | Notification priority score | V1 |

## Decision Engine Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Trigger    │───►│  Agent       │───►│  Output      │
│  (Event/    │    │  (Rules/     │    │  (Score/     │
│   Cron)     │    │   Model)     │    │   Alert/     │
└─────────────┘    └──────────────┘    │   Action)    │
                                       └──────────────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │  Consumer    │
                                    │  (Notification│
                                    │   / Update)  │
                                    └──────────────┘
```

## Implementation

```typescript
// agents/lead-scorer.agent.ts
@Injectable()
export class LeadScoringAgent {
  score(lead: CreateLeadDto): { score: number; rationale: string[] } {
    let score = 0;
    const rationale: string[] = [];

    // Rule 1: Has phone number
    if (lead.phone) { score += 15; rationale.push('Phone provided (+15)'); }

    // Rule 2: Has company name
    if (lead.companyName) { score += 10; rationale.push('Company provided (+10)'); }

    // Rule 3: Email domain quality
    if (lead.email && !freeEmailDomains.includes(lead.email.split('@')[1])) {
      score += 20; rationale.push('Business email (+20)');
    }

    // Rule 4: Source weighting
    const sourceScores = { website: 10, referral: 25, event: 15, cold_outreach: 5, other: 5 };
    score += sourceScores[lead.source] || 5;

    // Rule 5: Job title seniority
    const seniorTitles = ['director', 'manager', 'head', 'vp', 'c-level', 'owner'];
    if (lead.jobTitle && seniorTitles.some(t => lead.jobTitle.toLowerCase().includes(t))) {
      score += 15; rationale.push('Senior title (+15)');
    }

    return { score: Math.min(score, 100), rationale };
  }
}
```

## V2 Considerations

| Component | V2 Approach | When |
|-----------|-------------|------|
| Pipeline forecast | Linear regression on historical closed-won dates | >1 year of data |
| Lead scoring | Random forest classifier | >5,000 labeled leads |
| Anomaly detection | Z-score on budget variance | >500 projects |
| Quotation pricing | Similarity-based recommendation | >2,000 quotations |
