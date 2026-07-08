# Executive Decision Dashboard

| Field | Value |
|---|---|
| Document ID | 01-Executive-10 |
| Document Purpose | Define the decisions the executive dashboard must support |
| Version | 1.0 |
| Status | Review |
| Dependencies | 01-Executive/North-Star.md, 07-Product/Functional-Requirements.md |

---

## Purpose

The executive dashboard is not a reporting tool. It is a decision-support system. Every metric, chart, and alert exists to help leadership answer specific questions and make specific decisions.

---

## Key Decisions the Dashboard Must Support

### 1. Can we hire another engineer?

| Question | Data Needed | Metric |
|---|---|---|
| Do we have enough billable work? | Project pipeline, utilization rate | Utilization < 70% = under capacity; > 90% = need to hire |
| Can we afford the cost? | Revenue forecast, cost forecast, margin | Gross margin per project, operating margin |
| When will they be needed? | Pipeline forecast, project start dates | 30/60/90 day resource demand forecast |

### 2. Which hotel is most profitable?

| Question | Data Needed | Metric |
|---|---|---|
| Revenue per hotel | Invoices per contract | Total revenue by hotel (MTD, YTD) |
| Cost per hotel | Procurement, labor, subcontractor costs | Total cost by hotel |
| Margin per hotel | Revenue - Cost | Gross margin %, Net margin % |
| Trend | Historical data | Margin trend (improving or declining) |

### 3. Which supplier is underperforming?

| Question | Data Needed | Metric |
|---|---|---|
| On-time delivery | PO delivery dates vs promised dates | On-time delivery % |
| Quality | Rejections, returns, complaints | Defect rate, Return rate |
| Pricing competitiveness | Quote comparison data | Price position vs market |
| Responsiveness | RFQ response time, issue resolution | Average response time |
| Overall score | Weighted composite | Supplier score (1-100) |

### 4. Which project is at risk?

| Question | Data Needed | Metric |
|---|---|---|
| Schedule risk | Planned vs actual milestone dates | Schedule variance, Critical path status |
| Budget risk | Budget vs actual spend | Budget variance %, Remaining budget vs remaining work |
| Quality risk | Inspection pass rate, punch list items | First-pass yield, Open punch list count |
| Resource risk | Assigned vs available resources | Resource gap |
| Overall health | Composite of all risk factors | Project health (Red/Yellow/Green) |

### 5. What is our cash flow forecast?

| Question | Data Needed | Metric |
|---|---|---|
| Cash in (next 30/60/90 days) | Contractual payment schedule, invoice forecast | Expected receivables by week |
| Cash out (next 30/60/90 days) | Supplier payments, payroll, overhead | Expected payables by week |
| Net position | In - Out | Cash balance forecast |
| Risk | Overdue invoices, delayed client payments | DSO, Overdue % |

### 6. Which contracts are up for renewal?

| Question | Data Needed | Metric |
|---|---|---|
| Expiring contracts | Contract end dates | Contracts expiring in 30/60/90 days |
| Renewal likelihood | Client satisfaction, engagement, history | Renewal probability score |
| Value at risk | Contract values | Revenue at risk |
| Action needed | Last client meeting, open issues | Days since last engagement, open support tickets |

### 7. How healthy is our pipeline?

| Question | Data Needed | Metric |
|---|---|---|
| Pipeline value | Opportunity values by stage | Total pipeline value, Weighted pipeline |
| Pipeline velocity | Time in each stage | Average days per stage |
| Win rate | Won vs lost opportunities | Win rate %, Loss reasons |
| Coverage | Pipeline vs target | Pipeline coverage ratio (3x target recommended) |
| Aging | Time since last activity | Stale opportunities (no activity in 30+ days) |

### 8. Are we meeting our North Star?

| Question | Data Needed | Metric |
|---|---|---|
| Platform decisions | Decision events logged | Operational decisions per hotel per month |
| Trend | Historical data | North Star metric trend |
| Per hotel | Data by property | Per-hotel North Star score |

---

## Dashboard Sections

### Top Bar (Always Visible)
- Cash balance (current)
- Active projects count
- Pipeline value (weighted)
- Revenue MTD vs target
- Client health score (average)

### Section 1: Revenue & Pipeline
- Revenue trend (monthly, YTD, YoY)
- Pipeline by stage (funnel chart)
- Win rate trend
- Top 5 opportunities by value
- Revenue forecast (30/60/90 days)

### Section 2: Project Health
- Project health (Red/Yellow/Green grid)
- Schedule variance by project
- Budget variance by project
- Milestones due this week
- Resource utilization

### Section 3: Client Health
- Client health scores (list)
- Contracts expiring (next 90 days)
- Satisfaction trend
- Top 5 at-risk clients
- Renewal probability scores

### Section 4: Operational Efficiency
- Supplier performance scores
- Procurement cycle time
- Maintenance completion rate
- PM compliance %
- Work order resolution time

### Section 5: Financial Health
- Cash flow forecast (30/60/90 days)
- DSO trend
- Gross margin by project type
- Operating expense trend
- Budget vs actual by department

---

## Implementation Notes

- Dashboard queries use materialized views for performance
- Data refreshed every 15 minutes (or on-demand)
- PDF export available for weekly reports
- Configurable alerts for threshold breaches
- Role-based visibility (CEO sees all, department heads see their area)
