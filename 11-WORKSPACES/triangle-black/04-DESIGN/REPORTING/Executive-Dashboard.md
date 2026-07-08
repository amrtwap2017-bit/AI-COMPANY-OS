# Executive Dashboard

## Design Principle
Decision support, not reporting. Each section answers a specific business question.

## Section 1: Pipeline Health

### Question: What is our sales pipeline looking like?

| Metric | Query | Format |
|--------|-------|--------|
| Total pipeline value | SUM(opportunities.value) WHERE stage IN (qualification..negotiation) | EGP 3,200,000 |
| Number of active deals | COUNT(opportunities) WHERE stage IN (qualification..negotiation) | 24 deals |
| Weighted pipeline | SUM(value × probability%) | EGP 1,640,000 |
| Conversion rate (30d) | won / (won + lost) × 100 | 67% |
| Avg deal size | AVG(value) WHERE stage = negotiation | EGP 280,000 |

### Visual: Funnel chart by stage

## Section 2: Revenue

### Question: What revenue is confirmed vs. forecast?

| Metric | Query | Format |
|--------|-------|--------|
| Won this month | SUM(value) WHERE stage = closed_won AND close_date THIS MONTH | EGP 850,000 |
| Forecast next month | SUM(value) WHERE probability >= 50 AND expected_close NEXT MONTH | EGP 1,200,000 |
| Quotations pending approval | COUNT WHERE status = sent | 8 quotes (EGP 1.5M) |
| Quotations expiring (7d) | COUNT WHERE validUntil < 7d | 3 quotes (EGP 420K) |

### Visual: Trend bar chart (monthly won revenue, 12-month)

## Section 3: Project Health

### Question: Are our projects on track?

| Metric | Query | Format |
|--------|-------|--------|
| Active projects | COUNT WHERE status = in_progress | 8 projects |
| On-track milestones | milestones WHERE dueDate > now AND status != completed | 12 / 20 (60%) |
| Overdue milestones | milestones WHERE dueDate < now AND status != completed | 3 overdue |
| Avg completion | AVG(completion_percent) WHERE status = in_progress | 45% |

### Visual: Gantt-style bar chart (projects × timeline)

## Section 4: Client Activity

### Question: How engaged are our clients?

| Metric | Query | Format |
|--------|-------|--------|
| Open service requests | COUNT WHERE status IN (submitted, acknowledged, in_progress) | 15 |
| Critical requests | COUNT WHERE priority = critical AND status != resolved | 2 |
| Avg resolution time | AVG(resolved_at - created_at) WHERE status = resolved | 2.4 days |
| Requests this month | COUNT WHERE created_at THIS MONTH | 22 |

### Visual: Stacked bar (requests by status, this month)

## Section 5: Team Performance

### Question: How is the team performing?

| Metric | Query | Format |
|--------|-------|--------|
| Closed this month | COUNT(opportunities WHERE stage = closed_won AND close_date THIS MONTH) | 4 deals |
| Quotations sent | COUNT(quotations WHERE sent_at THIS MONTH) | 12 quotes |
| Avg quotation value | AVG(total) WHERE sent_at THIS MONTH | EGP 125,000 |
| Milestones completed | COUNT(milestones WHERE completed_at THIS MONTH) | 8 |

### Visual: Leaderboard table (by user × deals closed + value)
