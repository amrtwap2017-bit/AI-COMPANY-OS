# 08 — CS Operations

> Customer success operations and processes.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — All 08-CUSTOMER-SUCCESS files | CS components |

## CS Operations Framework

| Process | Description | Tool | Frequency |
|---------|-------------|------|-----------|
| Customer onboarding | Setup → train → go-live | Checklist + CRM | Per customer |
| Health monitoring | Score → alert → action | Automated | Real-time |
| QBR | Quarterly business review | Template + CRM | Quarterly |
| Escalation | Issue → executive | Playbook | As needed |
| Renewal management | Contract → renewal | CRM + billing | 60 days before |
| Churn prevention | At-risk → intervention | Playbook | As needed |
| Feedback loop | Customer → product | CRM + product | Weekly |

## CS Tool Stack

| Tool | Purpose | H1 | H2 |
|------|---------|----|----|
| CRM (HubSpot) | Customer data, pipeline | Free tier | Paid |
| Support (Freshdesk) | Ticket management | Free tier | Paid |
| NPS (Delighted) | Survey management | Free tier | Paid |
| Knowledge base (GitBook) | Documentation | Free | Pro |
| Community (Discourse) | Customer forum | — | Self-hosted |
| CS platform (Custify) | Health scoring | — | Paid |

## CS Workflows

| Workflow | Trigger | Actions | Automation |
|----------|---------|---------|-----------|
| Welcome sequence | New customer signed | Send welcome email, schedule kickoff | Auto |
| Onboarding check | 7 days after signup | Check progress, send reminder | Auto |
| Health drop | Score < 60 | Alert CS, create task | Auto |
| Renewal reminder | 60 days before | Alert Sales, prepare QBR | Auto |
| Churn risk | Cancellation initiated | Alert CS + Exec, create retention play | Auto |

## CS Dashboard

| Metric | View | Refresh |
|--------|------|---------|
| Customer count | Total, new, churned | Daily |
| Health score distribution | Healthy, at-risk, critical | Real-time |
| NPS trend | Quarterly, by segment | Quarterly |
| Support metrics | Volume, CSAT, response time | Real-time |
| Onboarding completion | % complete, avg time | Weekly |
| Renewal pipeline | % renewal, expected revenue | Monthly |
