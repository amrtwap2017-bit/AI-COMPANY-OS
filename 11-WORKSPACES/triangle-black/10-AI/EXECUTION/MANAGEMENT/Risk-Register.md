# Enterprise Risk Register

## Overview

The Risk Register is the central repository for all identified risks that could affect program outcomes. It provides a structured, consistent approach to risk identification, assessment, mitigation, and tracking. The risk register enables proactive risk management — identifying threats before they materialize and opportunities before they pass.

Risk management is a continuous process throughout the program lifecycle, not a one-time activity during planning.

## Risk Identification

Risks are identified through multiple channels and techniques:

### Identification Methods

| Method | Description | When Used |
|--------|-------------|-----------|
| **Brainstorming** | Structured sessions with program team and stakeholders | Program kickoff, quarterly reviews |
| **SWOT Analysis** | Assessment of Strengths, Weaknesses, Opportunities, Threats | Strategic planning phases |
| **Checklist Analysis** | Review of risk categories and historical risks | Ongoing |
| **Assumption Analysis** | Testing key assumptions for validity | At each stage gate |
| **Delphi Technique** | Anonymous expert consultation for independent risk identification | For complex or sensitive risks |
| **Root Cause Analysis** | Identifying underlying causes of potential issues | After incidents or near-misses |

### Risk Categories

Risks are categorized to support consistent management:

| Category | Description | Examples |
|----------|-------------|----------|
| **Technical** | Risks related to technology, architecture, integration, and performance | Technology obsolescence, integration failure, performance degradation, security vulnerability |
| **Schedule** | Risks related to timing, sequencing, and milestone achievement | Dependency delays, resource unavailability, estimation errors, scope creep |
| **Resource** | Risks related to people, skills, budget, and capacity | Staff turnover, skill gaps, budget cuts, contractor availability |
| **External** | Risks from outside the organization | Regulatory changes, vendor failure, market shifts, geopolitical events |
| **Business** | Risks related to business value, adoption, and stakeholder satisfaction | Low user adoption, benefit shortfall, stakeholder misalignment |
| **Data** | Risks related to data quality, availability, privacy, and governance | Data migration issues, data quality problems, privacy regulation changes |

## Risk Assessment

Each risk is assessed based on probability and impact to determine its severity:

### Probability Scale

| Rating | Probability | Description |
|--------|-------------|-------------|
| 1 - Rare | < 10% | Unlikely to occur |
| 2 - Unlikely | 10-25% | Could occur in some circumstances |
| 3 - Possible | 25-50% | Might occur at some point |
| 4 - Likely | 50-75% | Will probably occur in most circumstances |
| 5 - Almost Certain | > 75% | Expected to occur |

### Impact Scale

| Rating | Schedule | Cost | Quality | Value |
|--------|----------|------|---------|-------|
| 1 - Negligible | < 1 week delay | < $10K | Minor defect, no rework | < 1% value reduction |
| 2 - Minor | 1-2 weeks delay | $10K-$50K | Non-critical defect | 1-5% value reduction |
| 3 - Moderate | 2-4 weeks delay | $50K-$200K | Major defect requiring rework | 5-15% value reduction |
| 4 - Significant | 1-2 months delay | $200K-$1M | Critical defect, significant rework | 15-30% value reduction |
| 5 - Severe | > 2 months delay | > $1M | Program failure | > 30% value reduction |

### Risk Score Calculation

```
Risk Score = Probability × Impact (on 1-5 scale each)

Range: 1 (lowest) to 25 (highest)
```

### Risk Score Matrix

```
Impact →
            1       2       3       4       5
Prob   ┌─────────────────────────────────────
  5    │   5      10      15      20      25
  4    │   4       8      12      16      20
  3    │   3       6       9      12      15
  2    │   2       4       6       8      10
  1    │   1       2       3       4       5
```

### Risk Severity Levels

| Score | Severity | Response |
|-------|----------|----------|
| 1-3 | Low | Accept, monitor quarterly |
| 4-6 | Medium | Active monitoring, contingency plans |
| 8-12 | High | Proactive mitigation, regular review |
| 15-25 | Critical | Immediate action, executive escalation |

## Risk Register Template

```
==========================================================================
RISK REGISTER ENTRY
==========================================================================

RISK ID:            RIS-{NNN}
RISK NAME:          {Descriptive risk name}
PROGRAM:            {PROG-NNN} — {Program Name}
CATEGORY:           {Technical | Schedule | Resource | External | Business | Data}
RISK TYPE:          {Threat | Opportunity}
STATUS:             {Identified | Assessed | Mitigation Planned | Mitigation In Progress | Closed | Accepted}

IDENTIFICATION:
- Identified By:    {Name}
- Identification Date: {Date}
- Identification Method: {Brainstorming | SWOT | Checklist | Assumption Analysis | Delphi | RCA}

DESCRIPTION:
{Clear, specific statement of the risk using "If [cause], then [consequence]" format.
 Example: If the vendor delivers the API specification two weeks late, then the
 integration timeline will be compressed by 15%, increasing defect risk.}

CURRENT ASSESSMENT:
- Probability:       {1-5} — {Rare | Unlikely | Possible | Likely | Almost Certain}
- Impact:            {1-5} — {Negligible | Minor | Moderate | Significant | Severe}
- Risk Score:        {1-25} — {Low | Medium | High | Critical}
- Risk Owner:        {Name}
- Target Risk Score: {Target score after mitigation} (optional)

MITIGATION PLAN:
- Primary Response Strategy:   {Avoid | Transfer | Mitigate | Accept | Exploit | Share | Enhance | Accept}
- Mitigation Actions:
  1. {Action description, owner, due date}
  2. {Action description, owner, due date}
- Contingency Plan:  {What will be done if the risk materializes}
- Trigger Condition: {What indicates the risk is materializing}

RESIDUAL RISK:
- Residual Probability: {1-5}
- Residual Impact:      {1-5}
- Residual Score:       {1-25}

TRACKING:
- Last Review Date:  {Date}
- Next Review Date:  {Date}
- Review Cadence:    {Weekly | Monthly | Quarterly}
- Status Trend:      {Improving | Stable | Worsening}

ESCALATION:
- Escalation Level:  {Team | Program | Portfolio | Executive}
- Escalated To:      {Name}
- Escalation Date:   {Date}

NOTES:
{Additional context, mitigation status updates, decisions}
==========================================================================
```

## Risk Review Cadence

| Review Type | Frequency | Participants | Focus |
|-------------|-----------|--------------|-------|
| Risk Identification | Weekly | Program team | New risks, assumption changes |
| Risk Assessment | Weekly | Program Manager, Risk Owner | Probability/impact updates, score changes |
| Mitigation Tracking | Weekly | Risk Owners | Mitigation action status |
| Risk Status Review | Monthly | Program Manager, Sponsor | Risk register health, trend analysis |
| Portfolio Risk Review | Quarterly | Portfolio Review Board | Cross-program risk aggregation |
| Risk Retrospective | Per milestone | Program team | Lessons learned, risk process improvement |

## Risk Response Strategies

### Threat Responses

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Avoid** | Eliminate the threat by changing scope, approach, or plan | High-probability, high-impact threats |
| **Transfer** | Shift the impact to a third party (insurance, contract, warranty) | Financial risks, external dependencies |
| **Mitigate** | Reduce probability or impact through proactive actions | Most common approach for moderate-to-high risks |
| **Accept** | Acknowledge the risk and take no action unless it materializes | Low-probability, low-impact risks; cost of mitigation exceeds impact |

### Opportunity Responses

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Exploit** | Take action to ensure the opportunity is realized | High-value, high-probability opportunities |
| **Share** | Partner with another party to realize the opportunity | Opportunities requiring external capabilities |
| **Enhance** | Increase probability or impact of the opportunity | Moderate opportunities with potential for greater value |
| **Accept** | Acknowledge the opportunity but take no proactive action | Low-probability opportunities |

## Risk Reporting

| Report | Audience | Frequency | Content |
|--------|----------|-----------|---------|
| Risk Register | Program team | Continuous | All risks, full details |
| Risk Summary | Sponsor, Stakeholders | Monthly | Top 10 risks, trends, mitigation status |
| Risk Dashboard | Portfolio Management | Monthly | Risk aggregation, cross-program risks |
| Risk Escalation | Portfolio Review Board | As needed | Critical risks requiring intervention |
