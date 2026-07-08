# 02-PROJECT-DELIVERY — Business Overview

## Context

After a contract is signed (01-COMMERCIAL → contract.activated event), a project is created. This domain manages the entire project lifecycle from mobilization to handover.

## Value

| Stakeholder | Value |
|-------------|-------|
| Project Manager | Milestone tracking, resource planning, site reports |
| Site Engineer | Daily reporting, material requests, quality checks |
| Client | Progress visibility, milestone approvals, handover docs |
| Management | Project profitability, timeline adherence, risk visibility |

## Key Workflow

```
Contract Activated → Create Project → Mobilize → Execute → Monitor Quality → Handover → Close
                         ↓               ↓          ↓            ↓            ↓          ↓
                    Set milestones  Assign team  Daily ops    Inspections  Handover  Final
                                                    Progress    NCRs        Docs     Report
                                                    Issues      Approvals   Training  Archive
```

## Volume (V1)

| Metric | Monthly |
|--------|---------|
| Active projects | 5-15 |
| Milestones | 20-60 |
| Daily reports | 100-300 |
| NCRs | 10-30 |
| Handovers | 2-5 |
