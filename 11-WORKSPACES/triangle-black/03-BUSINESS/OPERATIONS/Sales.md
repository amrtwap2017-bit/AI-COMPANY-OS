# Sales — Day-to-Day Sales Operations

## Overview

Day-to-day sales operations covering pipeline management, client engagement, activity tracking, and reporting. This workflow supports the ongoing management of leads, opportunities, and client relationships outside of the formal proposal/contract cycle.

---

## BPMN Description

**Start Event:** Sales workday begins OR system reminder triggered

1. **Review Pipeline** — Sales rep reviews assigned leads and opportunities
2. **Prioritize Activities** — Determine daily priorities based on opportunity stage and urgency
3. **Engage Leads** — Contact new leads via phone, email, or meeting
4. **Qualify Leads** — Assess lead fit using BANT framework (Budget, Authority, Need, Timeline)
5. **Update Lead Status** — Move qualified leads to opportunity; mark disqualified leads with reason
6. **Advance Opportunities** — Progress opportunities through pipeline stages
7. **Log Activities** — Record calls, emails, meetings, and follow-ups in CRM
8. **Update Opportunity Details** — Revise estimated value, close date, competition, notes
9. **Request Internal Resources** — Engage engineering, pricing, or legal support as needed
10. **Prepare for Client Meetings** — Gather documents, prepare presentations
11. **Conduct Client Meetings** — Present solutions, address concerns, build relationships
12. **Send Follow-ups** — Email meeting notes, answer questions, send additional information
13. **Update Forecast** — Revise sales forecast based on pipeline changes
14. **Submit Reports** — Weekly sales report to manager; monthly forecast review

**End Event:** End of work period OR opportunity closed (won/lost)

---

## Actors

| Actor | Role | System Access |
|-------|------|---------------|
| Sales Rep | Day-to-day pipeline and client management | CRM, Email, Calendar |
| Sales Manager | Reviews pipeline, coaches team, approves deals | CRM, Dashboard |
| Sales Director | Reviews forecasts, sets targets | Dashboard, CRM |
| Marketing Coordinator | Provides campaign leads and collateral | Marketing, CRM |
| Client | Engages with sales process | Phone, Email, Meetings |

---

## Inputs

| Input | Source |
|-------|--------|
| Lead assignments | CRM automated assignment |
| Opportunity pipeline | CRM |
| Daily reminders and tasks | CRM, Calendar |
| Campaign response data | Marketing |
| Client emails and calls | Email, Phone logs |
| Sales targets and quotas | Management |

---

## Outputs

| Output | Destination |
|--------|-------------|
| Updated lead and opportunity records | CRM |
| Activity logs | CRM |
| Sales forecasts | Dashboard, Management |
| Weekly sales reports | Management |
| Qualified opportunities | Next stage workflows |
| Lost opportunity analysis | CRM |

---

## Business Rules

- Leads must be contacted within 24 hours of assignment
- Opportunities with no activity for 14 days are flagged as stale
- Opportunities cannot remain in the same stage for more than 30 days without manager review
- Sales reps must log at least 5 meaningful activities per day
- Weekly forecasting must be submitted every Friday by 5 PM
- Lost opportunities must include a loss reason

---

## Documents Involved

| Document | Description |
|----------|-------------|
| Lead record | Lead contact and qualification data |
| Opportunity record | Pipeline stage, value, probability |
| Activity log | Call notes, meeting minutes, email records |
| Sales forecast | Projected revenue by period |
| Weekly report | Summary of activities and pipeline changes |
| Meeting presentation | Client-facing materials |
| Competitive analysis | Competitor positioning information |

---

## KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Leads contacted within 24h | > 90% | Leads contacted / Leads assigned |
| Activities per rep per day | > 5 | Total activities / Working days |
| Pipeline accuracy (forecast vs actual) | < 15% variance | Forecast revenue - Actual closed revenue |
| Opportunity aging (stale rate) | < 10% | Stale opportunities / Total open |
| Win rate | > 35% | Won opportunities / Total closed |
| Average deal cycle by stage | Per stage target | Days in each stage |
| Sales rep quota attainment | > 80% | Actual revenue / Quota |
