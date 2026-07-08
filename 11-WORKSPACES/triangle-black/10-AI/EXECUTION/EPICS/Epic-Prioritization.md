# Epic Prioritization Framework

## Overview

The Epic Prioritization Framework provides a structured, objective method for ranking epics based on their expected value and alignment with strategic objectives. Prioritization ensures the program delivers maximum business value within available capacity.

## Prioritization Criteria

Each epic is evaluated against five weighted criteria:

### 1. Business Value (Weight: 35%)

| Score | Definition |
|-------|-----------|
| 5 | Transformational — fundamentally changes business operations or competitive position |
| 4 | Major — significant revenue, cost, or experience improvement |
| 3 | Moderate — measurable improvement in existing operations |
| 2 | Minor — incremental improvement with limited impact |
| 1 | Negligible — minimal measurable business impact |

**Assessment dimensions:** Revenue impact, cost savings, customer satisfaction, operational efficiency, risk reduction, compliance

### 2. Effort (Weight: 20%)

| Score | Definition |
|-------|-----------|
| 5 | Very Low — XS effort, single sprint, < 50 story points |
| 4 | Low — S effort, 2-3 sprints, 50-150 story points |
| 3 | Medium — M effort, 3-5 sprints, 150-350 story points |
| 2 | High — L effort, 5-8 sprints, 350-600 story points |
| 1 | Very High — XL/XXL effort, 8+ sprints, 600+ story points |

**Note:** Higher effort scores (lower effort) are better for prioritization.

### 3. Strategic Alignment (Weight: 25%)

| Score | Definition |
|-------|-----------|
| 5 | Directly enables a top strategic objective |
| 4 | Strongly supports a top strategic objective |
| 3 | Contributes to a strategic objective |
| 2 | Indirectly supports strategic objectives |
| 1 | No clear strategic alignment |

### 4. Dependency (Weight: 10%)

| Score | Definition |
|-------|-----------|
| 5 | No dependencies; fully independent |
| 4 | Few internal dependencies, easily managed |
| 3 | Moderate dependencies, manageable within normal planning |
| 2 | Significant dependencies requiring coordination |
| 1 | Critical external dependencies with high uncertainty |

### 5. Risk (Weight: 10%)

| Score | Definition |
|-------|-----------|
| 5 | Very Low Risk — well-understood, proven technology |
| 4 | Low Risk — familiar domain, minor unknowns |
| 3 | Medium Risk — some unknowns, manageable |
| 2 | High Risk — significant unknowns or complexity |
| 1 | Very High Risk — unproven approach, major uncertainty |

## Scoring Model

### Composite Score Calculation

```
Composite Score = (Value × 0.35) + (Effort × 0.20) + (Alignment × 0.25) + (Dependency × 0.10) + (Risk × 0.10)
```

Each criterion is scored 1-5, producing a composite score from 1.0 to 5.0.

### Score Tiers

| Composite Score | Priority Tier | Description |
|----------------|--------------|-------------|
| 4.0 - 5.0 | P0 - Critical | Must-do; immediate execution priority |
| 3.0 - 3.9 | P1 - High | Important; plan for near-term execution |
| 2.0 - 2.9 | P2 - Medium | Valuable; schedule when capacity permits |
| 1.0 - 1.9 | P3 - Low | Nice-to-have; deprioritize or defer |

### Tie-Breaking Rules

When epics have equal composite scores, use the following tie-breakers in order:

1. Higher business value score
2. Higher strategic alignment score
3. Lower effort score (i.e., faster delivery)
4. Earlier submission date
5. Epic Owner discretion (escalated to Program Manager)

## Priority Tiers

### P0 — Critical
- **Definition:** Epics that are critical to business operations, regulatory compliance, or top strategic objectives. Failure to deliver has severe consequences.
- **Governance:** Steering committee approval required. Weekly executive reporting. Dedicated resources.
- **Examples:** Regulatory mandate, revenue-critical platform capability, security vulnerability remediation

### P1 — High
- **Definition:** Epics that deliver significant business value and strongly align with strategic objectives.
- **Governance:** Program Manager approval. Monthly stakeholder reporting. Prioritized resource allocation.
- **Examples:** Major capability enhancement, significant cost reduction initiative, strategic customer requirement

### P2 — Medium
- **Definition:** Epics that deliver measurable value but are not time-critical or strategic imperatives.
- **Governance:** Portfolio-level planning. Fit within available capacity after P0/P1 commitments.
- **Examples:** Operational improvement, feature enhancement, technical debt reduction

### P3 — Low
- **Definition:** Epics with limited business value, indirect strategic alignment, or high uncertainty.
- **Governance:** Backlog. Reviewed quarterly for promotion or retirement.
- **Examples:** Nice-to-have features, speculative innovation, low-impact optimizations

## Prioritization Cadence

### Quarterly Portfolio Review
- **When:** First week of each quarter
- **Scope:** Entire epic portfolio
- **Activities:**
  - Strategic alignment check against updated business objectives
  - Full reprioritization using scoring model
  - New epic intake evaluation
  - P0/P1 capacity allocation
  - P2/P3 backlog grooming
  - Epic retirement decisions

### Monthly Adjustment
- **When:** Third week of each month
- **Scope:** Active and near-term epics
- **Activities:**
  - Priority micro-adjustments based on latest data
  - New P0/P1 candidate evaluation
  - At-risk epic reassessment
  - Dependency-driven reprioritization
  - Resource reallocation decisions

### Weekly Triage
- **When:** Every week
- **Scope:** Active epics and urgent new candidates
- **Activities:**
  - Urgent P0 candidate intake (requires escalation)
  - Blocker-driven reprioritization
  - At-risk epic review

## Prioritization Outputs

### Priority Queue
A ranked list of all epics ordered by composite score. The queue is used for:
- Resource allocation decisions
- Release planning
- Stakeholder communication
- Capacity modeling

### Value/Effort Matrix
Epics plotted on a 2x2 matrix:

```
                    High
                     |
    Deprioritize     |    Priority Invest
    (Low Value,      |    (High Value,
     High Effort)    |     Low Effort)
                     |
    -----------------+------------------
                     |
    Low Priority     |    Consider
    (Low Value,      |    (High Value,
     Low Effort)     |     High Effort)
                     |
    Value        High
```

### Capacity Allocation Report
Shows planned vs. available capacity by priority tier, used to identify over-commitment and guide reprioritization decisions.
