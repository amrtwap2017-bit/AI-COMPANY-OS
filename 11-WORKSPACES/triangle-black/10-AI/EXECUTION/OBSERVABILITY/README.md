# Observability

## Purpose

Observability is the foundation of data-driven decision making and continuous improvement. If you cannot measure it, you cannot manage it — and you certainly cannot improve it. This section defines what we measure, how we measure it, and how we use those measurements to drive better outcomes.

The goal is not measurement for its own sake. Every metric defined here is chosen because it provides actionable insight into the health, velocity, quality, or efficiency of the delivery system.

## Metrics Categories

| Category | Focus | Key Questions |
|----------|-------|---------------|
| **Delivery** | Speed and flow of work through the system | How fast are we delivering? Is work flowing smoothly? |
| **Quality** | Correctness and reliability of what we produce | How many defects escape? Is the system stable? |
| **Performance** | System responsiveness and resource efficiency | How fast does the system respond? Are we using resources efficiently? |
| **Business** | Alignment with organizational goals | Are we delivering business value? Are we predictable? |
| **AI** | Effectiveness of AI agents in the delivery process | How productive are AI agents? Where do they need improvement? |

## Measurement Principles

| Principle | Description |
|-----------|-------------|
| **Measure outcomes, not outputs** | Focus on business results, not activity counts |
| **Trends over absolutes** | Watch direction of change, not isolated values |
| **Actionable** | Every metric should suggest a clear action if it goes wrong |
| **Automated** | Metrics are gathered automatically, never manually |
| **Transparent** | All metrics are visible to the entire team and organization |
| **Contextual** | Metrics are interpreted in context, never in isolation |

## Metric Hierarchy

Metrics are organized in a hierarchy from high-level indicators to granular diagnostic measurements:

1. **North Star Metrics** — The single most important indicator for each category.
2. **Key Performance Indicators** — Top-level metrics reviewed weekly.
3. **Diagnostic Metrics** — Detailed measurements used to investigate KPI trends.
4. **Operational Metrics** — Real-time measurements used for alerting and incident response.

## Related Documents

| Document | Description |
|----------|-------------|
| Build-Metrics.md | Build and CI performance measurements |
| Sprint-Metrics.md | Sprint velocity, completion, and scope metrics |
| Deployment-Metrics.md | Deployment frequency, success rate, and rollback metrics |
| Bug-Metrics.md | Bug counts, density, resolution time, and escaped defects |
| Coverage.md | Code, test, and documentation coverage metrics |
| Cycle-Time.md | Time from work start to completion |
| Lead-Time.md | Time from request to delivery |
| DORA-Metrics.md | The four key DevOps Research and Assessment metrics |
| AI-Productivity.md | AI agent generation and review productivity metrics |

## Reporting Cadence

| Report | Frequency | Audience |
|--------|-----------|----------|
| Build health dashboard | Real-time | Engineering team |
| Sprint metrics review | End of sprint | Scrum team |
| Deployment dashboard | Real-time | Engineering + DevOps |
| DORA metrics | Weekly | Engineering leadership |
| Quality report | Weekly | Engineering + QA |
| AI productivity report | Weekly | Program managers |
| Executive summary | Monthly | Leadership |
