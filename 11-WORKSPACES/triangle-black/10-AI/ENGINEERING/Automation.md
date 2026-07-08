# Automation Opportunities (V2+)

## Overview

This document catalogs automation opportunities identified during the platform design. Each opportunity is evaluated by value, complexity, and AI-autonomy level required. V1 focuses on building the data infrastructure. V2+ implements automation in priority order.

## Automation Matrix

| # | Automation | Value | Complexity | AI Level | V1 Data | V2 | V3 |
|---|------------|-------|------------|----------|---------|----|----|
| 1 | Quotation line item suggestions | High | Medium | L2 (Suggest) | ✅ | ✅ | - |
| 2 | Work order priority assignment | Medium | Low | L1-2 | ✅ | ✅ | - |
| 3 | Procurement reorder alerts | High | Medium | L2 | ✅ | ✅ | - |
| 4 | Scheduled report generation | Medium | Low | L2 | ✅ | ✅ | - |
| 5 | Maintenance schedule optimization | High | High | L2-3 | - | ✅ | ✅ |
| 6 | Invoice data extraction | Medium | Medium | L1-2 | - | ✅ | - |
| 7 | Client health scoring | Medium | Medium | L1-2 | ✅ | ✅ | - |
| 8 | Anomaly detection (operations) | High | High | L1 | - | ✅ | ✅ |
| 9 | Email classification & routing | Medium | Medium | L1-2 | ✅ | ✅ | - |
| 10 | Supplier performance scoring | High | Medium | L2 | - | ✅ | ✅ |
| 11 | Predictive maintenance | High | Very High | L3 | - | - | ✅ |
| 12 | Automated purchase orders | High | High | L3 | - | - | ✅ |
| 13 | Client-facing AI assistant | Medium | High | L2 | - | ✅ | - |
| 14 | Contract compliance checking | Medium | High | L2 | - | ✅ | ✅ |
| 15 | Budget forecasting | High | High | L2-3 | - | ✅ | ✅ |

## Priority 1: Quick Wins (V2 Early)

### 1. Quotation Line Item Suggestions

**Current state:** Users manually create quotation line items from scratch.

**Automation:**
- AI analyzes historical quotations from same client and similar projects
- Suggests line items (description, quantity, unit price)
- User accepts, edits, or rejects each item

**Data needed:**
- 50+ approved quotations per tenant
- Item descriptions, quantities, unit prices
- Project type categorization

**Estimated impact:** 40-60% time reduction in quotation creation.

### 2. Work Order Priority Assignment

**Current state:** Users manually assign priority (critical/high/medium/low) to work orders.

**Automation:**
- AI classifies work order priority based on:
  - Asset criticality (e.g., HVAC vs. cosmetic)
  - Issue type (e.g., no AC = high, light bulb = low)
  - Guest impact (e.g., guest room vs. back office)
  - Historical urgency patterns
- System auto-assigns priority, user can override

**Data needed:**
- 200+ classified work orders
- Asset registry with criticality ratings
- Issue category taxonomy

**Estimated impact:** 70% reduction in priority assignment time.

### 3. Scheduled Report Generation

**Current state:** Users manually compile monthly operational reports.

**Automation:**
- Report agent pulls data from platform
- Fills template with metrics, charts, and commentary
- Human reviews and sends

**Data needed:**
- Report templates (3+ months of manual reports)
- Metrics definitions and data sources

**Estimated impact:** 80% reduction in report generation time.

## Priority 2: Strategic Value (V2 Mid)

### 4. Procurement Reorder Alerts

**Current state:** Users monitor inventory and manually trigger reorders.

**Automation:**
- AI tracks inventory levels and consumption patterns
- Predicts when reorder is needed (lead time + safety stock)
- Suggests supplier and quantity based on historical data
- User approves purchase order

**Data needed:**
- 6+ months of inventory/consumption data
- Supplier pricing and lead times
- Par levels and reorder points

**Estimated impact:** Reduced stockouts, optimized inventory levels.

### 5. Client Health Scoring

**Current state:** Account managers manually assess client satisfaction.

**Automation:**
- AI computes health score from:
  - Work order completion rates
  - Response times
  - Payment history
  - Feedback/complaint frequency
  - Contract utilization
- Flags at-risk clients for proactive outreach

**Data needed:**
- Complete client interaction history
- Financial data (payment timeliness)
- Satisfaction survey results

**Estimated impact:** Improved retention through early intervention.

### 6. Email Classification & Routing

**Current state:** Users manually read and route incoming emails.

**Automation:**
- AI classifies email by intent (service request, complaint, inquiry)
- Extracts key entities (property, issue, urgency)
- Routes to appropriate team or creates ticket
- Suggests response template

**Data needed:**
- 500+ classified emails with routing decisions
- Email-to-ticket mapping

**Estimated impact:** 50% reduction in email processing time.

## Priority 3: High Impact (V2 Late - V3)

### 7. Anomaly Detection

**Current state:** Operational issues detected reactively (client complains).

**Automation:**
- AI monitors operational metrics in real-time:
  - Work order volume spikes
  - SLA breaches
  - Unusual procurement patterns
  - Budget variance
- Alerts appropriate team with context

**Data needed:**
- 12+ months of operational data
- Baseline metrics for each KPI
- Alert thresholds and escalation paths

**Estimated impact:** Proactive issue resolution, reduced client complaints.

### 8. Supplier Performance Scoring

**Current state:** Supplier evaluation is manual and periodic.

**Automation:**
- AI scores suppliers on:
  - On-time delivery rate
  - Quality (return rate, defect rate)
  - Pricing competitiveness
  - Responsiveness
- Recommends preferred suppliers for each category

**Data needed:**
- 12+ months of procurement data
- Supplier quality/return data
- Pricing history

**Estimated impact:** 10-20% procurement cost reduction.

## Priority 4: Advanced (V3)

### 9. Predictive Maintenance

**Current state:** Maintenance is reactive or calendar-based.

**Automation:**
- AI analyzes equipment data (run hours, error codes, age, maintenance history)
- Predicts failure probability within time windows
- Suggests preventative maintenance schedule
- Auto-generates work orders

**Data needed:**
- Equipment registry with specs
- IoT/ sensor data (future)
- 24+ months of maintenance history
- Failure mode data

**Estimated impact:** 30-50% reduction in emergency repairs.

### 10. Automated Purchase Orders (Low Value)

**Current state:** Every purchase order requires manual approval.

**Automation:**
- AI identifies routine, low-value purchases
- Auto-generates purchase order from approved suppliers
- Routes to approval only if outside parameters
- (Higher-value POs always require human approval)

**Data needed:**
- Complete PO history with approval patterns
- Supplier contracts with pricing
- Budget allocation per category

**Estimated impact:** 60% reduction in PO processing time.

## Implementation Approach

### Phase 1: Data Readiness

```yaml
checklist:
  - Clean and normalize historical data
  - Ensure all entities have consistent categorization
  - Implement structured logging for all user actions
  - Establish baseline metrics (manual performance)
  - Build feedback collection mechanisms
  - Implement embedding pipeline
```

### Phase 2: MVP Automation (2-3 features)

```yaml
selection_criteria:
  - High value (time saved > 20%)
  - Low complexity (< 2 weeks engineering)
  - Available data (> 100 records)
  - Low risk (no financial execution)
  - User demand (validated with users)

candidates:
  - Quotation line item suggestions
  - Work order priority assignment
  - Scheduled report generation
```

### Phase 3: Expansion

```yaml
methodology:
  - Add one automation per sprint
  - A/B test each feature (AI vs. manual)
  - Measure acceptance rate and time saved
  - Iterate on prompt design
  - Expand to next priority item
```

## Success Metrics

| Metric | Phase 1 (V1) | Phase 2 (V2) | Phase 3 (V3) |
|--------|--------------|--------------|--------------|
| Automated tasks | 0% | 20% | 50% |
| Time saved per user | 0% | 25% | 40% |
| AI suggestion accuracy | N/A | > 70% | > 85% |
| Automation value (annual) | $0 | $50K+ | $200K+ |
| User trust score (1-5) | N/A | > 3.5 | > 4.2 |

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low data quality | Medium | High | Data cleaning pipeline, validation |
| User resistance | Medium | Medium | Gradual rollout, transparency, opt-out |
| Over-automation | Low | Medium | Human-in-the-loop on all financial decisions |
| High API costs | Medium | Medium | Tiered model selection, caching, cost tracking |
| Inaccurate suggestions | Medium | Medium | Confidence scoring, mandatory review for low confidence |
