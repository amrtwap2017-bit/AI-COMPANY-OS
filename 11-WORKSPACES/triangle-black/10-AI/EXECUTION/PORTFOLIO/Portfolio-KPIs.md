# Portfolio-Level KPIs

## Overview

Portfolio-level Key Performance Indicators (KPIs) provide the quantitative basis for assessing the health, performance, and value of the enterprise portfolio. These KPIs enable leadership to make informed decisions about investment allocation, program prioritization, and strategic alignment.

KPIs are tracked across five categories: strategic progress, financial performance, execution efficiency, portfolio health, and value delivery.

## KPI Definitions

### 1. Strategic Objective Progress (%)

**Definition:** The weighted average completion percentage of all key results across active strategic objectives within the portfolio.

**Formula:**
```
Strategic Objective Progress = Σ (KR Score_i × KR Weight_i) / Σ KR Weight_i
```

**Target:** >70% average key result attainment per quarter

**Reporting Cadence:** Monthly (with quarterly formal scoring)

**Interpretation:**
- >80%: Excellent progress, objectives likely to be achieved
- 60-80%: Acceptable progress, some objectives need attention
- <60%: Significant gap, portfolio rebalancing may be required

### 2. Portfolio Velocity

**Definition:** The total number of initiatives (epics, projects, milestones) completed per month, trended over time.

**Formula:**
```
Portfolio Velocity = Σ (Completed Initiatives) per month
```

**Target:** Established baseline per portfolio (varies by portfolio size)

**Reporting Cadence:** Weekly

**Interpretation:**
- Velocity increasing: Portfolio capacity is improving or scope is being decomposed effectively
- Velocity decreasing: Blockers, resource constraints, or scope creep
- Velocity stable: Predictable delivery, healthy portfolio

### 3. Investment ROI

**Definition:** The weighted average return on investment across all active programs in the portfolio.

**Formula:**
```
Portfolio ROI = Σ (Program Net Benefits) / Σ (Program Total Investment) × 100
```

**Target:** Minimum 20% portfolio-level ROI (varies by portfolio type)

**Reporting Cadence:** Quarterly

**Interpretation:**
- >50%: High-performing portfolio with strong value delivery
- 20-50%: Acceptable performance aligned with targets
- <20%: Below target, review program composition and investment allocation

### 4. Initiative Throughput

**Definition:** The number of initiatives (programs, projects, epics) that move through each lifecycle stage per period.

**Formula:**
```
Initiative Throughput = Count of initiatives completing each stage gate per quarter
```

**Target:** Varies by portfolio (track trend, not absolute)

**Reporting Cadence:** Monthly

**Interpretation:**
- Throughput increasing: Portfolio pipeline is healthy
- Throughput decreasing: Bottlenecks at stage gates, governance delays
- Analyze by stage to identify specific bottlenecks (e.g., high propose rate but low approval rate)

### 5. Portfolio Health Score

**Definition:** A composite score combining schedule, budget, quality, and risk status across all active programs.

**Formula:**
```
Portfolio Health = (Number of Green Programs × 100 + Number of Yellow Programs × 50 + Number of Red Programs × 0) / Total Active Programs
```

**Target:** >80 (average score across all programs)

**Reporting Cadence:** Weekly

**Interpretation:**
- >85: Healthy portfolio, most programs on track
- 65-85: Moderate health, some programs need attention
- <65: Unhealthy portfolio, multiple programs at risk, escalation required

### 6. Risk Exposure

**Definition:** The total potential financial impact of identified risks across the portfolio, weighted by probability.

**Formula:**
```
Risk Exposure = Σ (Risk Impact_i × Risk Probability_i)
```

**Target:** Risk exposure < 15% of total portfolio budget

**Reporting Cadence:** Monthly

**Interpretation:**
- Exposure increasing: New risks emerging or existing risks materializing
- Exposure decreasing: Mitigation actions effective
- Exposure > 20% of budget: Portfolio-level risk response required

### 7. Value Realization Rate

**Definition:** The percentage of expected value that has been confirmed as realized across completed and active programs.

**Formula:**
```
Value Realization Rate = Σ (Achieved Value) / Σ (Target Value) × 100
```

**Target:** >80% of targeted value realized within 12 months of program completion

**Reporting Cadence:** Quarterly

**Interpretation:**
- >90%: Excellent value delivery, forecasting is accurate
- 70-90%: Acceptable, some programs underdelivering
- <70%: Value gaps need investigation, forecasting methodology may need revision

## KPI Dashboard

### Executive Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════════╗
║                   PORTFOLIO DASHBOARD — Q1 20XX                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  STRATEGIC PROGRESS              PORTFOLIO HEALTH                 ║
║  ┌───────────────────────┐      ┌───────────────────────┐        ║
║  │ Objective Progress    │      │ Health Score          │        ║
║  │ ████████████████░ 78% │      │ ████████████████░ 82  │        ║
║  └───────────────────────┘      └───────────────────────┘        ║
╠═══════════════════════════════════════════════════════════════════╣
║  VELOCITY & THROUGHPUT          INVESTMENT PERFORMANCE            ║
║  ┌───────────────────────┐      ┌───────────────────────┐        ║
║  │ Velocity: 24/mo       │      │ Portfolio ROI: 34%    │        ║
║  │ Throughput: 18/qtr    │      │ Risk Exposure: 12%    │        ║
║  └───────────────────────┘      └───────────────────────┘        ║
╠═══════════════════════════════════════════════════════════════════╣
║  VALUE REALIZATION              PROGRAM BREAKDOWN                 ║
║  ┌───────────────────────┐      ┌───────────────────────┐        ║
║  │ Realization Rate: 84% │      │  Green: 8  Yellow: 3  │        ║
║  │ On Track:  Yes        │      │  Red: 1    On-Hold: 2 │        ║
║  └───────────────────────┘      └───────────────────────┘        ║
╚═══════════════════════════════════════════════════════════════════╝
```

## KPI Review Cadence

| KPI | Weekly | Monthly | Quarterly | Annually |
|-----|--------|---------|-----------|----------|
| Strategic Objective Progress | | Review | Score | Refresh |
| Portfolio Velocity | Track | Trend | Review | Set target |
| Investment ROI | | | Calculate | Benchmark |
| Initiative Throughput | Track | Review | Trend | Set target |
| Portfolio Health Score | Track | Review | Review | Benchmark |
| Risk Exposure | Monitor | Report | Review | Assess |
| Value Realization Rate | | | Report | Forecast |

## KPI Accountability

| KPI | Primary Owner | Review Body |
|-----|---------------|-------------|
| Strategic Objective Progress | Portfolio Director | Executive Leadership |
| Portfolio Velocity | Portfolio Manager | Portfolio Review Board |
| Investment ROI | Investment Analyst | Investment Review Committee |
| Initiative Throughput | Portfolio Manager | Portfolio Review Board |
| Portfolio Health Score | Portfolio Manager | Portfolio Review Board |
| Risk Exposure | Portfolio Risk Lead | Portfolio Review Board |
| Value Realization Rate | Value Architect | Investment Review Committee |

## KPI Improvement Process

When KPIs fall below target thresholds, a structured improvement process is initiated:

1. **Identify:** Determine which KPI is below threshold and by how much
2. **Analyze:** Root cause analysis — is it a systemic issue or program-specific?
3. **Respond:** Develop corrective action plan with owner and timeline
4. **Monitor:** Track KPI recovery trajectory weekly
5. **Review:** Assess effectiveness of corrective actions at next portfolio review
6. **Learn:** Document lessons learned to prevent recurrence
