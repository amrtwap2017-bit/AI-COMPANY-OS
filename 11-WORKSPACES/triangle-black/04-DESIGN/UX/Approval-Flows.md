# Approval Flows

## Approval 1: Quotation Approval (Internal)

### Flow Diagram
```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Sales   │────>│ Manager  │────>│ Director │────>│   CEO    │
│ Submits │     │ < 50k    │     │ 50-200k  │     │ > 200k   │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
                     │                │                │
                     ▼                ▼                ▼
                ┌──────────┐    ┌──────────┐    ┌──────────┐
                │ Approved │    │ Approved │    │ Approved │
                └──────────┘    └──────────┘    └──────────┘
```

### Rules
| Threshold | Approvers | Rule ID |
|-----------|-----------|---------|
| ≤ EGP 50,000 | Manager | BR-QTN-05 |
| EGP 50,001 – 200,000 | Manager + Director | BR-QTN-05 |
| > EGP 200,000 | Manager + Director + CEO | BR-QTN-05 |

### Rejection Behavior
| Action | System Behavior |
|--------|----------------|
| Reject at any level | Status → "Rejected"; reason required; notification to creator |
| Request revision | Status → "Revision Requested"; comment sent to creator |
| Skip-level | Not allowed — chain must be sequential |

---

## Approval 2: Discount Approval

| Discount Amount | Approver | Rule ID |
|----------------|----------|---------|
| ≤ 5% line item discount | Sales Rep (automatically allowed) | BR-QTN-08 |
| 5-15% line item discount | Manager | BR-QTN-08 |
| 15-30% line item discount | Director | BR-QTN-08 |
| > 30% line item or total | CEO | BR-QTN-08 |

### Flow
```
Sales sets discount > threshold
  → System flags: "Discount exceeds your authority"
  → Submit for approval dialog
  → Route to appropriate approver
  → Approver reviews → [Approve with discount] or [Reject: adjust pricing]
```

---

## Approval 3: Milestone Completion

### Flow
```
Engineer marks milestone "Complete"
  → System checks: all predecessor milestones complete? (BR-PRJ-02)
  → Status → "Pending Approval"
  → Notify Project Manager
  → PM reviews work → [Approve] or [Reject with reason]
  → If approved: status → "Approved", recalculate completion %
  → If rejected: status → "In Progress", comment to engineer
```

### Special Rules
| Condition | Behavior |
|-----------|----------|
| All milestones approved | Project status → "Ready for Handover" |
| Milestone is billing gate | Auto-generate milestone invoice (V2) |
| Milestone overdue | Yellow status indicator; escalation after 7 days |

---

## Approval 4: Contract Signing

### Flow
```
Quotation approved → Contract generated
  → Internal legal review (if value > EGP 200k)
  → Contract sent to client portal
  → Client Admin reviews and signs (name + date)
  → Triangle Black counter-signs
  → Contract status → "Active"
  → Project auto-created
```

### Client Signature
| Method | V1 Status |
|--------|-----------|
| Name + date (basic) | ✓ P1 |
| Digital signature (e-sign API) | V2 |
| Physical upload | V1 fallback |

---

## Approval 5: User Account Actions (Admin)

| Action | Allowed By | Constraint |
|--------|-----------|------------|
| Create user | ADMIN, SUPER_ADMIN | — |
| Deactivate user | ADMIN, SUPER_ADMIN | Cannot deactivate self (BR-ADM-03) |
| Deactivate ADMIN | SUPER_ADMIN only | — |
| Change role | ADMIN, SUPER_ADMIN | Cannot promote above own role |
| Reset password | ADMIN, SUPER_ADMIN | — |

---

## Approval Queue UI

```
┌──────────────────────────────────────────────────────────────┐
│ Pending Approvals                                    [All ▾] │
│                                                              │
│ ┌───┬──────────────────────────┬──────────┬───────┬─────────┐│
│ │ ▢ │ Item                     │ Requestor│ Value │ Actions ││
│ ├───┼──────────────────────────┼──────────┼───────┼─────────┤│
│ │   │ QTN-2026-00142           │ Ahmed S. │$45K   │ [✓][✗] ││
│ │   │ Chiller Replacement      │          │       │         ││
│ │   │ Hilton Sharm             │          │       │         ││
│ ├───┼──────────────────────────┼──────────┼───────┼─────────┤│
│ │   │ MS-2026-00089            │ Khaled M.│  —    │ [✓][✗] ││
│ │   │ Fire Pump Commissioning  │          │       │         ││
│ │   │ Sheraton Hurghada        │          │       │         ││
│ ├───┼──────────────────────────┼──────────┼───────┼─────────┤│
│ │   │ MIL-2026-00012           │ Hassan R.│  —    │ [✓][✗] ││
│ │   │ Chiller Foundation       │          │       │         ││
│ │   │ Marriott Cairo           │          │       │         ││
│ └───┴──────────────────────────┴──────────┴───────┴─────────┘│
│                                                       [2 more]│
└──────────────────────────────────────────────────────────────┘
```
