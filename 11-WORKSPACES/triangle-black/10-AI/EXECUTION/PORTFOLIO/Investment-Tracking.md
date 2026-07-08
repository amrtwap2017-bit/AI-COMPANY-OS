# Investment Tracking

## Overview

Investment tracking provides the financial governance framework for the enterprise portfolio. It ensures that budget allocation, cost management, and return on investment (ROI) analysis are consistently applied across all programs. The tracking system enables data-driven decisions about where to invest, when to adjust, and when to exit.

## Budget Allocation per Program

Budget allocation follows a structured process aligned with portfolio planning cycles:

### Allocation Process

1. **Top-down guidance:** Executive leadership communicates total portfolio budget and strategic priorities.
2. **Bottom-up estimates:** Programs develop cost estimates based on scope, resources, and timeline.
3. **Reconciliation:** Portfolio management reconciles bottom-up estimates with top-down guidance, identifying gaps.
4. **Allocation approval:** Portfolio Review Board approves final allocations.
5. **Fund release:** Budgets are released in tranches aligned with lifecycle stage gates.

### Allocation Categories

| Category | Description | Typical % of Portfolio |
|----------|-------------|------------------------|
| **Operating Expense (OpEx)** | Ongoing operational costs, labor, subscriptions | 40-60% |
| **Capital Expense (CapEx)** | Long-term assets, software development, infrastructure | 20-40% |
| **Contingency** | Unforeseen risks and opportunities | 5-15% |
| **Innovation Fund** | Experimental initiatives, emerging technology | 5-10% |

### Budget Allocation Template

```
==========================================================================
BUDGET ALLOCATION RECORD
==========================================================================

PORTFOLIO:           {PORT-NNN} — {Portfolio Name}
FISCAL YEAR:         20XX
TOTAL PORTFOLIO BUDGET: ${Total}

PROGRAM ALLOCATIONS:
--------------------------------------------------------------------------
Program ID    | Program Name            | OpEx      | CapEx     | Total
--------------|-------------------------|-----------|-----------|----------
PROG-001      | {Program Name}          | $X,XXX    | $X,XXX    | $X,XXX
PROG-002      | {Program Name}          | $X,XXX    | $X,XXX    | $X,XXX

CONTINGENCY:                              $X,XXX
INNOVATION FUND:                          $X,XXX
TOTAL ALLOCATED:                          $X,XXX
==========================================================================
```

## Cost Tracking

Cost tracking captures actual expenditure against budget at the program and portfolio level.

### Cost Categories

| Cost Type | Examples |
|-----------|----------|
| **Labor** | Salaries, contractors, professional services |
| **Technology** | Software licenses, cloud services, hardware, tools |
| **Infrastructure** | Data centers, networking, facilities |
| **External Services** | Consulting, system integration, managed services |
| **Travel & Expenses** | Business travel, training, events |
| **Contingency** | Discretionary spending for unplanned needs |

### Tracking Cadence

- **Weekly:** Automated cost data ingestion from financial systems
- **Monthly:** Cost review with program and portfolio management
- **Quarterly:** Forecast update and budget reallocation
- **Annually:** Budget planning for next fiscal year

### Cost Variance Reporting

| Variance | Status | Action Required |
|----------|--------|-----------------|
| < 5% over budget | Green | Monitor, no action needed |
| 5-10% over budget | Yellow | Review forecast, identify corrective actions |
| > 10% over budget | Red | Escalate to portfolio review board, initiate remediation |
| > 5% under budget | Yellow | Review scope delivery, consider reallocation |

## ROI Calculation

ROI is calculated using a standardized methodology to enable comparison across programs:

### Basic ROI Formula

```
ROI (%) = (Net Benefits / Total Investment) × 100

Where:
- Net Benefits = Total Benefits — Total Investment
- Total Investment = All costs (OpEx + CapEx) over the program lifecycle
- Total Benefits = Quantified value across all value dimensions
```

### Adjusted ROI Metrics

| Metric | Formula | Purpose |
|--------|---------|---------|
| **Payback Period** | Total Investment / Annual Net Benefits | Time to recoup investment |
| **Net Present Value (NPV)** | Σ (Benefits_t — Costs_t) / (1 + r)^t | Time-adjusted value |
| **Internal Rate of Return (IRR)** | Rate where NPV = 0 | Investment efficiency |
| **Benefit-Cost Ratio (BCR)** | Total Benefits / Total Investment | Value per dollar invested |

### ROI Thresholds

| Program Type | Minimum ROI | Preferred ROI | Payback Period |
|--------------|-------------|---------------|----------------|
| Growth | 20% | >50% | < 3 years |
| Efficiency | 30% | >60% | < 2 years |
| Compliance | N/A (mandatory) | Cost minimization | As required |
| Innovation | 10% | >25% | < 4 years |

## Investment Review Cadence

Investment reviews ensure disciplined financial oversight throughout the portfolio lifecycle:

| Review Type | Frequency | Participants | Focus |
|-------------|-----------|--------------|-------|
| **Budget Review** | Monthly | Portfolio Manager, Program Managers, Finance | Actual vs plan, variance analysis, forecast |
| **Investment Review** | Quarterly | Portfolio Review Board | ROI assessment, portfolio rebalancing, funding decisions |
| **Stage Gate Review** | Per milestone | Sponsor, Portfolio Manager | Go/no-go decisions, funding release for next phase |
| **Annual Planning** | Annually | Executive Leadership, Portfolio Review Board | Budget allocation, strategic alignment, portfolio composition |

### Investment Review Template

```
==========================================================================
INVESTMENT REVIEW REPORT
==========================================================================

PORTFOLIO:             {PORT-NNN} — {Portfolio Name}
REVIEW PERIOD:         {Q1 20XX}
REVIEW DATE:           {Date}

PORTFOLIO FINANCIAL SUMMARY:
--------------------------------------------------------------------------
Metric                  | Budget     | Actual     | Variance   | Status
------------------------|------------|------------|------------|---------
Total Portfolio Budget  | $X,XXX     | $X,XXX     | +/- $XXX   | G/Y/R
Total OpEx              | $X,XXX     | $X,XXX     | +/- $XXX   | G/Y/R
Total CapEx             | $X,XXX     | $X,XXX     | +/- $XXX   | G/Y/R
Contingency Used        | $X,XXX     | $X,XXX     | +/- $XXX   | G/Y/R

PROGRAM FINANCIAL HEALTH:
--------------------------------------------------------------------------
Program     | Budget    | Actual    | Variance  | Forecast  | Status
------------|-----------|-----------|-----------|-----------|--------
PROG-001    | $X,XXX    | $X,XXX    | +/- $XXX  | $X,XXX    | G/Y/R
PROG-002    | $X,XXX    | $X,XXX    | +/- $XXX  | $X,XXX    | G/Y/R

PORTFOLIO ROI SUMMARY:
--------------------------------------------------------------------------
Program     | Investment | Benefits  | Net       | ROI %     | Status
------------|------------|-----------|-----------|-----------|--------
PROG-001    | $X,XXX     | $X,XXX    | $X,XXX    | XX%       | G/Y/R
PROG-002    | $X,XXX     | $X,XXX    | $X,XXX    | XX%       | G/Y/R

RECOMMENDATIONS:
- {Reallocation decisions, funding adjustments, program changes}

DECISIONS:
- {Record decisions made during the review}
==========================================================================
```

## Investment Governance Principles

1. **Transparency:** All investment data is visible to authorized stakeholders. No hidden budgets or off-book spending.
2. **Discipline:** Spending outside approved allocations requires formal change request and portfolio review board approval.
3. **Traceability:** Every dollar is traceable to a strategic objective, program, and value dimension.
4. **Predictability:** Forecast accuracy is measured and reported. Variance beyond thresholds triggers escalation.
5. **Optimization:** Underperforming investments are aggressively reallocated to higher-value opportunities.
