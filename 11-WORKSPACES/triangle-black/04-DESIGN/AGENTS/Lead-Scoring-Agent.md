# Lead Scoring Agent

## Purpose
Assign a numerical score (0-100) to each incoming lead to prioritize sales efforts.

## Scoring Rules

| Rule | Weight | Condition |
|------|--------|-----------|
| Phone provided | +15 | lead.phone IS NOT NULL |
| Company name provided | +10 | lead.companyName IS NOT NULL |
| Business email | +20 | Email domain NOT in free list (gmail.com, yahoo.com, hotmail.com, etc.) |
| Senior title | +15 | jobTitle contains: director, manager, head, vp, c-level, owner |
| Referral source | +25 | source = 'referral' |
| Event source | +15 | source = 'event' |
| Website source | +10 | source = 'website' |
| Cold outreach | +5 | source = 'cold_outreach' |
| Has notes | +5 | notes IS NOT NULL AND length > 50 |

## Score Interpretation

| Range | Priority | Action |
|-------|----------|--------|
| 0-30 | Low | Add to nurture sequence |
| 31-60 | Medium | Assign to available sales rep within 24h |
| 61-85 | High | Assign to senior sales rep within 4h |
| 86-100 | Hot | Immediate assignment to manager + notification |

## Auto-Assignment

```typescript
@Injectable()
export class LeadAutoAssigner {
  constructor(
    private leadScoringAgent: LeadScoringAgent,
    private userService: UserService,
  ) {}

  async assign(lead: Lead): Promise<string | null> {
    if (lead.score < 30) return null; // No assignment, goes to nurture

    // Find sales rep with lowest active lead count
    const salesReps = await this.userService.findByRole('sales_rep');
    const workloads = await Promise.all(
      salesReps.map(async (rep) => ({
        userId: rep.id,
        leadCount: await this.leadService.countActiveByAssignee(rep.id),
      }))
    );

    workloads.sort((a, b) => a.leadCount - b.leadCount);
    return workloads[0]?.userId || null;
  }
}
```
