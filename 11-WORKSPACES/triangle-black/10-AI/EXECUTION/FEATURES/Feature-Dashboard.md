# Feature Dashboard

## Overview

The Feature Dashboard provides real-time visibility into feature delivery health, progress, and outcomes. It consolidates key metrics from across the feature lifecycle into actionable views for different stakeholder groups.

## Core Metrics

### 1. Feature Completion Rate

**Definition:** Percentage of planned features completed within a given time period.

**Formula:**
```
Completion Rate = (Features Completed / Features Planned) × 100
```

**Measurement:** Per sprint, per month, per release.

| Benchmark | Rate |
|-----------|------|
| Excellent | ≥ 90% |
| Good | 75-89% |
| Needs Improvement | 60-74% |
| Poor | < 60% |

**Segment by:** Epic, priority, owner, feature type.

### 2. Feature Cycle Time

**Definition:** Time from feature development start to deployment.

**Formula:**
```
Cycle Time = Deployment Date - Development Start Date
```

**Measurement:** Calendar days, segmented by feature size (XS, S, M, L).

| Size | Excellent | Good | Needs Improvement | Poor |
|------|-----------|------|-------------------|------|
| XS | ≤ 5 days | 6-10 days | 11-15 days | > 15 days |
| S | ≤ 10 days | 11-15 days | 16-25 days | > 25 days |
| M | ≤ 15 days | 16-25 days | 26-40 days | > 40 days |
| L | ≤ 25 days | 26-40 days | 41-60 days | > 60 days |

### 3. Feature Quality

**Definition:** Percentage of features passing all acceptance criteria without critical defects.

**Components:**
| Metric | Description |
|--------|-------------|
| First-Pass Yield | Features accepted on first review |
| Defect Density | Defects per feature |
| Acceptance Criteria Pass Rate | Criteria passed / total criteria |
| Reject Rate | Features rejected during review |

**Formula:**
```
Quality Score = (First-Pass Yield × 0.40) + ((1 - Defect Density Normalized) × 0.30) + (Criteria Pass Rate × 0.30)
```

### 4. Value Delivery Rate

**Definition:** Cumulative value delivered through completed features.

**Formula:**
```
Value Delivery Rate = Sum of Value Scores for Completed Features / Time Period
```

**Measurement:** Value points per sprint or per month.

**Trend:** Increasing rate indicates improving delivery velocity and/or value focus.

### 5. Feature Count by Status

**Definition:** Distribution of features across lifecycle states.

**View:**
```
Status Distribution
Identified:     ████████████ 15 (25%)
Defined:        ████████     10 (17%)
Planned:        █████        6 (10%)
In Progress:    ██████████   12 (20%)
Completed:      ████████     10 (17%)
Deployed:       ████         5 (8%)
Measured:       ██           2 (3%)
Total:                      60
```

### 6. Feature Count by Priority

**Definition:** Distribution of features across priority tiers.

**View:**
```
Priority Distribution
P0 (Critical):  ████████████ 10 (17%)
P1 (High):      ████████████████ 15 (25%)
P2 (Medium):    ██████████████████████ 22 (37%)
P3 (Low):       █████████████ 13 (22%)
Total:                      60
```

### 7. Feature Count by Epic

**Definition:** Feature breakdown per epic for portfolio-level tracking.

## Dashboard Views

### Executive View

**Target Audience:** Steering Committee, Program Sponsors

**Content:**
- Feature portfolio summary (total features, epic count, active count)
- Feature completion rate trend (last 4 sprints/quarters)
- Value delivery rate trend
- Feature cycle time (average, trend)
- Red/Yellow/Green status for key metrics
- Features at risk (count with mitigation status)

**Refresh:** Weekly
**Format:** High-level summary with trend charts

### Program Management View

**Target Audience:** Program Manager, Epic Owners

**Content:**
- Complete feature list with status, priority, owner
- Completion rate by epic
- Cycle time by feature size
- Quality metrics (first-pass yield, defect density)
- Feature aging report (features in each state beyond expected duration)
- Value delivery by epic and priority tier
- Dependency impact on feature delivery
- Resource utilization per feature area

**Refresh:** Daily
**Format:** Detailed tables, trend charts, heatmaps

### Delivery Team View

**Target Audience:** Product Owners, Delivery Leads, Team Members

**Content:**
- Current sprint feature status
- Feature completion forecast vs. sprint goal
- Features-by-status breakdown (sprint-level)
- Blocked features with blocker details
- Feature quality metrics (acceptance criteria pass rate)
- Impediments and risks
- Team velocity against feature completion

**Refresh:** Real-time
**Format:** Sprint board, burndown charts, status tables

## Dashboard Filters

| Filter | Options | Applies To |
|--------|---------|------------|
| Time Period | Current sprint, last 4 sprints, custom range | All metrics |
| Epic | All, specific epic(s) | Feature list, metrics |
| Priority | All, P0, P1, P2, P3 | Feature list, metrics |
| Status | All, specific status | Feature list |
| Owner | All, specific owner | Feature list |
| Risk Level | All, High, Medium, Low | Feature list |

## Dashboard Components

### Trend Charts

- **Completion Rate Trend:** Line chart showing completion rate over time
- **Cycle Time Trend:** Line chart with average, median, and 85th percentile
- **Value Delivery Trend:** Cumulative value over time, segmented by priority
- **Quality Trend:** First-pass yield and defect density over time

### Distribution Charts

- **Status Distribution:** Bar chart or donut chart
- **Priority Distribution:** Bar chart or donut chart
- **Epic Distribution:** Horizontal bar chart
- **Risk Distribution:** Heatmap

### Detail Tables

- **Feature List:** Sortable, filterable table with all features
- **Aging Report:** Features sorted by time in current state
- **Blocked Features:** Features with active blockers
- **At-Risk Features:** Features with high-risk indicators

## Dashboard Refresh Cadence

| View | Refresh Mechanism | Latency | Data Source |
|------|-------------------|---------|-------------|
| Executive | Scheduled | 24 hours | Feature Catalog, Metrics Store |
| Program Management | Scheduled | 4 hours | Feature Catalog, Sprint System |
| Delivery Team | Real-time | < 1 minute | Feature Catalog, Sprint System, CI/CD |
| Export/Report | On-demand | < 5 minutes | All sources |

## Data Sources

- **Feature Catalog:** Feature metadata, status, priority, owner, epic linkage
- **Sprint Tracking System:** Sprint assignments, completion status, blocked items
- **CI/CD Pipeline:** Deployment dates, build status, quality gate results
- **Test Management System:** Test results, acceptance criteria pass/fail
- **Defect Tracking System:** Defect counts, severity, resolution status
- **Value Tracking:** Value scores, realized value metrics

## Alerting

Automated alerts are triggered when key thresholds are breached:

| Alert Condition | Threshold | Notification Sent To |
|----------------|-----------|---------------------|
| Feature completion rate below target | < 70% | Program Manager, Epic Owner |
| Feature cycle time exceeds target | > 2x expected | Delivery Lead, Feature Owner |
| Feature quality below threshold | First-pass yield < 60% | QA Lead, Feature Owner |
| Feature blocked for > 2 days | > 48 hours blocked | Program Manager |
| P0 feature at risk | Any P0 feature at risk | Program Manager, Steering Committee |
| Aging feature in same state > 14 days | > 14 days | Epic Owner, Feature Owner |
