# 01-COMMERCIAL — Workflows

## W1: Lead Capture & Qualification

```
[START] Lead arrives (web/referral/event/outreach)
    │
    ▼
Auto-score (LeadScoreService)
    │
    ├── Score ≥ 61 → High priority → Auto-assign to senior rep
    ├── Score 31-60 → Medium → Assign to available rep
    └── Score ≤ 30 → Low → Nurture sequence
    │
    ▼
Sales rep contacts lead
    │
    ├── Responds → Set status = 'contacted'
    └── No response → Follow-up sequence (3 touches)
    │
    ▼
Qualify:
    ├── Budget + Authority + Need + Timeline (BANT)
    ├── Qualified → Convert to Opportunity
    └── Disqualified → Status = 'disqualified', log reason
[END]
```

## W2: Site Survey

```
[START] Opportunity needs engineering assessment
    │
    ▼
Schedule site visit (engineer + client)
    │
    ▼
Engineer conducts survey:
    ├── Photographs
    ├── Measurements
    ├── Existing condition assessment
    └── Client requirements discussion
    │
    ▼
Create Engineering Assessment:
    ├── Technical specifications
    ├── Bill of Quantities (BOQ)
    ├── Material recommendations
    └── Risk assessment
    │
    ▼
Survey approval workflow:
    ├── Draft → Submit for Review
    ├── Manager reviews
    ├── ├── Approve → Ready for Quotation
    │   └── Reject → Revise with comments
[END]
```

## W3: Quotation Generation & Approval

```
[START] Survey approved + Opportunity ready
    │
    ▼
Create Quotation (draft):
    ├── Auto-populate BOQ from survey
    ├── Select unit prices (from catalog or manual)
    ├── Apply margins (target: 25-40%)
    └── Set validity period (14-30 days)
    │
    ▼
Internal Approval:
    ├── Sales rep submits for approval
    ├── Manager reviews:
    │   ├── Margin check (≥ 25%? Warn if below)
    │   ├── Scope matches survey
    │   └── Terms acceptable
    │   ├── Approve → Ready to send
    │   └── Reject → Revise
    │
    ▼
Send to Client:
    ├── Generate PDF
    ├── Email quotation to client contacts
    └── Status = 'sent'
    │
    ▼
Client Review:
    ├── Approve → Status = 'client_approved', create Contract
    ├── Negotiate → Revise pricing/scope (version +1)
    └── Reject → Status = 'rejected', log reason
[END]
```

## W4: Contract Activation

```
[START] Quotation approved by client
    │
    ▼
Create Contract:
    ├── Auto-generate from quotation
    ├── Set start/end dates
    ├── Attach terms and conditions
    └── Status = 'draft'
    │
    ▼
Signing:
    ├── Internal sign → Status = 'signed'
    └── Client sign → Status = 'active'
    │
    ▼
On Activation:
    ├── Create Project (handoff to 02-PROJECT-DELIVERY)
    ├── Notify project manager
    ├── Set milestone dates
    └── Archive quotation
[END]
```
