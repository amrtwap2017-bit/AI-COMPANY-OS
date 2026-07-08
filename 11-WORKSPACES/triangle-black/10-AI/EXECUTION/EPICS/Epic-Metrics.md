# Epic Metrics

## Overview

Epic-level metrics provide visibility into the health, progress, and value of epics within the program portfolio. These metrics enable data-driven decision making, early identification of issues, and continuous improvement of epic delivery capabilities.

## Core Metrics

### 1. Epic Cycle Time

**Definition:** The total elapsed time from epic approval (Approved state) to epic acceptance (Closed state).

**Formula:**
```
Cycle Time = Acceptance Date - Approval Date
```

**Measurement:** Calendar days or business days.

| Benchmark | Duration |
|-----------|----------|
| Excellent | ≤ 60 days |
| Good | 61-90 days |
| Needs Improvement | 91-150 days |
| Poor | > 150 days |

**Segment by:** Effort size, priority tier, business capability.

**Use:** Identify delivery bottlenecks, improve estimation accuracy, set stakeholder expectations.

### 2. Epic Throughput

**Definition:** The number of epics completed within a given time period.

**Formula:**
```
Throughput = Count of epics closed in period
```

**Measurement:** Epics per quarter or per month.

| Benchmark | Throughput |
|-----------|-----------|
| Excellent | ≥ 6 per quarter |
| Good | 4-5 per quarter |
| Needs Improvement | 2-3 per quarter |
| Poor | ≤ 1 per quarter |

**Segment by:** Priority tier, epic size, business capability.

**Use:** Measure delivery capacity, plan portfolio throughput, trend analysis for continuous improvement.

### 3. Epic Value Realization

**Definition:** The degree to which expected business value is achieved after epic completion.

**Formula:**
```
Value Realization Rate = (Realized Value / Expected Value) × 100
```

**Measurement:** Percentage, measured 90 days post-acceptance.

| Benchmark | Rate |
|-----------|------|
| Excellent | ≥ 90% |
| Good | 75-89% |
| Needs Improvement | 50-74% |
| Poor | < 50% |

**Segment by:** Value dimension (revenue, cost, satisfaction, etc.).

**Use:** Validate value estimation accuracy, demonstrate program ROI, adjust value forecasting models.

### 4. Epic Quality Score

**Definition:** Composite measure of epic quality based on defects, rework, and acceptance outcomes.

**Components and Weights:**
| Component | Weight | Measurement |
|-----------|--------|-------------|
| Defect Density | 30% | Defects per feature delivered |
| Rework Ratio | 25% | Effort spent on rework / total effort |
| Acceptance Rate | 25% | Epics accepted on first review / total completed |
| Quality Gate Pass Rate | 20% | Quality gates passed / total quality gates |

**Formula:**
```
Quality Score = (Defect Score × 0.30) + (Rework Score × 0.25) + (Acceptance Score × 0.25) + (Gate Score × 0.20)
```

Each component scored 0-100.

| Benchmark | Score |
|-----------|-------|
| Excellent | ≥ 90 |
| Good | 75-89 |
| Needs Improvement | 50-74 |
| Poor | < 50 |

### 5. Epic Predictability

**Definition:** How accurately epic delivery timelines and effort were estimated.

**Schedule Predictability:**
```
Schedule Predictability = (Actual Duration / Planned Duration) × 100
```

**Effort Predictability:**
```
Effort Predictability = (Actual Effort / Estimated Effort) × 100
```

**Measurement:** Percentage. 100% = perfect prediction.

| Benchmark | Range |
|-----------|-------|
| Excellent | 90-110% |
| Good | 80-89% or 111-125% |
| Needs Improvement | 65-79% or 126-150% |
| Poor | < 65% or > 150% |

## Derived Metrics

### Epic Value per Effort Unit
```
Value per Effort = Value Score / Story Points (or Sprint Count)
```

**Use:** Compare value efficiency across epics to inform prioritization.

### Epic Risk-Adjusted Value
```
Risk-Adjusted Value = Value Score × (1 - Risk Factor)
```
Risk Factor: High=0.3, Medium=0.15, Low=0.05

**Use:** Make risk-informed prioritization decisions.

### Epic Aging
```
Aging = Current Date - Date Entered Current State
```

**Use:** Identify stalled epics requiring attention.

## Dashboard Views

### Executive Dashboard
- Epic portfolio summary (count by status)
- Throughput trend (last 4 quarters)
- Value realization snapshot
- Epic cycle time trend

### Program Manager Dashboard
- Detailed epic list with status and priority
- Aging report (epics stalled in any state)
- Predictability metrics (planned vs. actual)
- Quality score trend
- At-risk epic watchlist

### Epic Owner Dashboard
- Individual epic progress and status
- Feature completion breakdown
- Risk and dependency status
- Actual vs. planned timeline
- Value tracking

## Dashboard Refresh Cadence

| Dashboard | Refresh Frequency | Data Source |
|-----------|------------------|-------------|
| Executive Dashboard | Weekly | Epic Catalog, Metrics Store |
| Program Manager Dashboard | Daily | Epic Catalog, Feature System |
| Epic Owner Dashboard | Real-time | Epic Catalog, Sprint Tracking |
| Portfolio Report | Monthly | All sources |

## Metric Collection Standards

- Cycle time is calculated in calendar days (excluding planned hold periods)
- Throughput is measured on a rolling quarterly basis
- Value realization is assessed at 30, 60, and 90 days post-acceptance
- Quality data is sourced from the defect tracking and CI/CD systems
- Predictability data is captured at epic approval (planned) and closure (actual)

## Continuous Improvement Targets

| Metric | Current Baseline | 6-Month Target | 12-Month Target |
|--------|-----------------|---------------|-----------------|
| Epic Cycle Time (M-size) | {Baseline} | -15% | -25% |
| Throughput per Quarter | {Baseline} | +20% | +40% |
| Value Realization Rate | {Baseline} | +5% | +10% |
| Quality Score | {Baseline} | +5 | +10 |
| Schedule Predictability | {Baseline} | ±10% improvement | ±20% improvement |

*Baselines are established after the first two quarters of measurement.*
