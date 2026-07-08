# Feature Business Value

## Overview

Business value is the core criterion for feature prioritization and investment decisions. This framework defines how feature value is assessed, scored, and communicated. Consistent value assessment ensures objective prioritization and clear expectations about feature outcomes.

## Value Dimensions

Each feature is evaluated across six value dimensions:

### 1. Revenue Impact (Weight: 25%)

| Score | Description |
|-------|-------------|
| 5 | Directly generates significant new revenue stream (≥10% increase) |
| 4 | Enables new revenue opportunity or significant upsell |
| 3 | Improves conversion, retention, or average revenue per user |
| 2 | Minor revenue improvement or indirect revenue support |
| 1 | No measurable revenue impact |

**Examples:** New monetization feature, checkout optimization, pricing engine enhancement

### 2. Cost Savings (Weight: 20%)

| Score | Description |
|-------|-------------|
| 5 | Eliminates significant operational cost (≥20% reduction) |
| 4 | Major automation of manual processes with clear cost reduction |
| 3 | Moderate efficiency improvement with measurable savings |
| 2 | Minor cost reduction or efficiency gain |
| 1 | No measurable cost impact |

**Examples:** Process automation, infrastructure optimization, manual task elimination

### 3. Customer Satisfaction (Weight: 15%)

| Score | Description |
|-------|-------------|
| 5 | Transformational improvement in customer experience |
| 4 | Major reduction in friction or pain points |
| 3 | Measurable improvement in satisfaction scores or NPS |
| 2 | Minor experience improvement |
| 1 | No customer-facing impact |

**Examples:** UX redesign, self-service capability, response time improvement

### 4. Operational Efficiency (Weight: 15%)

| Score | Description |
|-------|-------------|
| 5 | Enables step-change in team throughput or capability |
| 4 | Significant reduction in time-to-complete key processes |
| 3 | Measurable improvement in operational metrics |
| 2 | Minor operational improvement |
| 1 | No operational impact |

**Examples:** Developer tooling, CI/CD pipeline improvement, monitoring enhancement

### 5. Risk Reduction (Weight: 15%)

| Score | Description |
|-------|-------------|
| 5 | Eliminates critical security, privacy, or business continuity risk |
| 4 | Significantly reduces high-priority risk exposure |
| 3 | Addresses medium-risk items with clear mitigation |
| 2 | Minor risk reduction or documentation improvement |
| 1 | No risk impact |

**Examples:** Security vulnerability fix, data privacy enhancement, disaster recovery improvement

### 6. Compliance (Weight: 10%)

| Score | Description |
|-------|-------------|
| 5 | Required for regulatory compliance with deadline |
| 4 | Addresses compliance gap with regulatory alignment |
| 3 | Improves compliance posture or reporting capability |
| 2 | Minor compliance documentation or process improvement |
| 1 | No compliance impact |

**Examples:** Regulatory reporting feature, data retention compliance, audit logging enhancement

## Value Scoring Model

### Dimension Scores

Each dimension is scored 1-5 using the rubrics above. Scores are based on evidence and stakeholder input, not subjective preference.

### Composite Value Score

```
Composite Value Score = (Revenue × 0.25) + (Cost × 0.20) + (Satisfaction × 0.15) + (Efficiency × 0.15) + (Risk × 0.15) + (Compliance × 0.10)
```

The composite score ranges from 1.0 to 5.0. For catalog display, normalize to 0-100:
```
Normalized Score = Composite Score × 20
```

### Score Interpretation

| Composite | Normalized | Category |
|-----------|-----------|----------|
| 4.0 - 5.0 | 80-100 | High Value — critical feature |
| 3.0 - 3.9 | 60-79 | Medium-High Value — important feature |
| 2.0 - 2.9 | 40-59 | Medium Value — worthwhile feature |
| 1.0 - 1.9 | 20-39 | Low Value — marginal feature |

## Value Assessment Process

### Step 1: Value Identification (Feature Definition)
- Feature Owner identifies expected value across dimensions
- Based on research, data, and stakeholder input
- Initial scores documented in Feature Template

### Step 2: Value Validation (Feature Review)
- Product Owner and stakeholders review and challenge scores
- Evidence is assessed for each dimension score
- Scores are adjusted based on validation discussion
- Final scores are recorded in Feature Catalog

### Step 3: Value Monitoring (During Delivery)
- Value metrics are tracked as stories are completed
- Course corrections made if value indicators diverge
- Assumptions are validated with real data where possible

### Step 4: Value Realization (Post-Deployment)
- Post-deployment measurement against target outcomes
- Actual value is compared to expected value
- Value realization data informs future scoring accuracy

## Value Scorecard Template

```yaml
Feature: FEAT-{NNN}: {Feature Title}

Value Assessment:
  Revenue Impact:
    Score: {1-5}
    Evidence: {Supporting data or rationale}
  Cost Savings:
    Score: {1-5}
    Evidence: {Supporting data or rationale}
  Customer Satisfaction:
    Score: {1-5}
    Evidence: {Supporting data or rationale}
  Operational Efficiency:
    Score: {1-5}
    Evidence: {Supporting data or rationale}
  Risk Reduction:
    Score: {1-5}
    Evidence: {Supporting data or rationale}
  Compliance:
    Score: {1-5}
    Evidence: {Supporting data or rationale}

Composite Score: {1.0-5.0}
Normalized Score: {0-100}
Assessed By: {Name}
Date: {YYYY-MM-DD}
```

## Value Communication

Feature value is communicated in standard formats:

- **One-line:** "Feature X delivers $Y in annual savings by automating Z"
- **Elevator pitch:** "This feature enables [outcome] by [capability], resulting in [value]"
- **Detailed value case:** Full scorecard with evidence and expected ROI

## How Value Drives Decisions

- **Prioritization:** Higher-value features are prioritized over lower-value features
- **Scope decisions:** Low-value scope items are candidates for deferral
- **Investment decisions:** Value/effort ratio determines feature feasibility
- **Trade-off discussions:** Value scores provide objective basis for scope trade-offs
- **Success measurement:** Value scores define what "good" looks like for each feature
