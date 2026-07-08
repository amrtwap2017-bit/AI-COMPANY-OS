# Lead Time

## Purpose

Lead time measures the total elapsed time from when work is requested to when it is delivered to the user. While cycle time measures active work time, lead time includes the waiting time before work begins. Lead time is the true measure of how responsive the organization is to stakeholder needs.

## Definition

**Lead time**: The elapsed time between a request being made and the value being delivered to the end user.

- **Start**: When the request is formally captured (ticket created, feature requested, bug reported).
- **End**: When the change is deployed to production and available to users.

Lead time is always longer than cycle time. The difference represents time spent waiting in the backlog before work begins.

## Relationship to Cycle Time

```
Lead Time = Backlog Time + Cycle Time
```

Where:
- **Backlog Time**: Time from request creation to work start (ticket moves to "In Progress").
- **Cycle Time**: Time from work start to deployment completion.

```
Request Created ──→ Work Started ──→ Deployed
   [ Backlog Time ]   [ Cycle Time ]
   ←─────────── Lead Time ──────────→
```

### Why Both Matter

- **Lead time** measures responsiveness to stakeholders — how long before a request is fulfilled.
- **Cycle time** measures internal efficiency — how fast the team executes once work begins.
- Improving cycle time without reducing backlog time means stakeholders still wait too long.
- Reducing backlog time without addressing cycle time means work piles up once started.

## Measurement

### Lead Time by Epic

- **Definition**: Time from epic creation (initiative identified) to all associated stories delivered.
- **Measurement**: Timestamp of epic creation to timestamp of last associated story deployed.
- **Target**: Varies by epic size. Typically 1-3 months.
- **Purpose**: Measures the organization's ability to deliver large initiatives from concept to completion.

### Lead Time by Feature

- **Definition**: Time from feature request to feature deployed.
- **Measurement**: Timestamp of feature ticket creation to timestamp of feature deployment.
- **Target**: < 30 days for standard features. < 14 days for small features.
- **Purpose**: Measures responsiveness to product requirements and market demands.

### Lead Time by Story

- **Definition**: Time from story creation to story deployed.
- **Measurement**: Timestamp of story creation to timestamp of story deployment.
- **Target**: < 10 days for average story.
- **Purpose**: Measures day-to-day responsiveness of the team.

## Stages of Lead Time

Lead time can be broken down into distinct stages to identify where delays occur:

| Stage | Start | End | Typical % of Lead Time |
|-------|-------|-----|------------------------|
| **Backlog** | Request created | Sprint planning (committed) | 30-50% |
| **Sprint** | Sprint starts | Work started (in progress) | 5-10% |
| **Development** | Work started | PR opened | 20-30% |
| **Review** | PR opened | PR approved | 10-15% |
| **Deploy** | PR merged | Deployed to production | 5-10% |

### Backlog Time Breakdown

Backlog time can be further broken down:

| Sub-stage | Description |
|-----------|-------------|
| **Awaiting triage** | Time before the request is reviewed and categorized |
| **Awaiting refinement** | Time waiting for details, acceptance criteria, or design |
| **Awaiting prioritization** | Time before the request is prioritized against other work |
| **Awaiting capacity** | Time before the team has capacity to start the work |

## Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Story lead time (median) | < 10 days | For standard 3-5 point stories |
| Story lead time (P95) | < 20 days | Outliers should be rare |
| Feature lead time | < 30 days | From feature request to delivery |
| Epic lead time | < 3 months | Including backlog time |
| Backlog time percentage | < 40% of total lead time | Should not dominate lead time |
| Development-to-deploy time | < 50% of total lead time | The efficient portion |

## Lead Time vs. Cycle Time Comparison

| Aspect | Lead Time | Cycle Time |
|--------|-----------|------------|
| Stakeholder perspective | How long until my request is fulfilled? | How fast can you deliver once you start? |
| Includes backlog waiting | Yes | No |
| Best use | Measuring organizational responsiveness | Measuring team efficiency |
| Improvement focus | Prioritization, WIP limits, batch size | Automation, review process, deployment pipeline |

## Measurement and Reporting

### Data Collection

Lead time data is collected from:

1. **Project management tool** — ticket creation date, status changes.
2. **Version control** — commit timestamps.
3. **CI/CD pipeline** — deployment timestamps.

### Lead Time Dashboard

The lead time dashboard should display:

- Lead time by epic, feature, story (average, median, P95)
- Lead time breakdown by stage (stacked bar)
- Lead time vs. cycle time comparison (dual line chart)
- Lead time trend (30-day rolling)
- Backlog time distribution (histogram)
- Lead time by priority (low, medium, high, critical)

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Long backlog time | Reduce WIP limits, improve prioritization frequency, use cost of delay to rank work |
| Long lead time despite good cycle time | Address backlog management — work is waiting too long before being started |
| Long development or review time | See Cycle-Time.md improvement strategies |
| High lead time variability | Standardize request intake, implement consistent prioritization, use size-based service classes |
| Disconnected lead and cycle time trends | If cycle time is improving but lead time is not, focus on backlog and prioritization |
