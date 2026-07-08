# 01-COMMERCIAL — Business Overview

## Business Context

Triangle Black's revenue begins when a hotel, resort, or hospitality client needs engineering services. The Commercial domain manages every interaction from first contact through signed contract.

## Value Proposition

| Stakeholder | Value |
|-------------|-------|
| Sales Team | Automated lead scoring, pipeline visibility, one-click quotations |
| Engineers | Site survey scheduling, findings capture, assessment templates |
| Management | Win/loss analytics, margin visibility, pipeline forecast |
| Clients | Professional quotations, clear pricing, digital approvals |

## Operational Workflows

### W1: Lead-to-Opportunity
```
Inbound lead → Score → Assign → Contact → Qualify → Create Opportunity
Roles: Sales Rep, Manager
Systems: CRM, Email
SLA: Score within 5 min, assign within 1 hour
```

### W2: Opportunity-to-Quotation
```
Opportunity → Site Survey → Engineering Assessment → BOQ → Pricing → Quotation → Internal Approval
Roles: Sales Rep, Engineer, Manager
SLA: Quotation within 48 hours of survey
```

### W3: Quotation-to-Contract
```
Quotation → Submit to Client → Negotiate → Approve → Sign → Activate
Roles: Sales Rep, Manager, Client
SLA: Contract within 7 days of approval
```

### W4: Contract-to-Project Handoff
```
Contract → Create Project → Assign Team → Set Milestones → Begin Execution
Roles: Manager, Project Manager
Trigger: Contract.status = 'active'
```

## Business Volume Assumptions (V1)

| Metric | Monthly Volume | Growth Rate |
|--------|---------------|-------------|
| New leads | 50-100 | +20%/month |
| Site surveys | 20-40 | +15%/month |
| Quotations | 15-30 | +20%/month |
| Contracts | 5-10 | +25%/month |
| Active clients | 10-20 | +10%/month |
