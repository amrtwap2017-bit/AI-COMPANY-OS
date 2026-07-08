# Phase 01 — Operational Workflows

> End-to-end operational workflows mapped across the complete client lifecycle.

## Workflow 1: Lead-to-Contract (Revenue Generation)

```
Lead Capture ──► Lead Qualification ──► Opportunity Creation ──► Site Survey ──► Quotation ──► Quotation Approval ──► Contract
   [channels]        [scoring]             [pipeline]              [field]        [margin calc]     [approval]         [signing]
```

**Cycle time target:** 14-30 days from lead to signed contract.

See `06-Operations/Lead-to-Contract-Workflow.md` for detailed step-by-step.

## Workflow 2: Project Delivery (Execution)

```
Contract Signed ──► Project Setup ──► Procurement ──► Execution ──► Milestone Review ──► Milestone Approval ──► Invoice ──► Payment
   [trigger]         [planning]         [PO creation]   [daily ops]     [quality check]     [sign-off]          [AR]        [collection]
```

**Cycle time target:** Per project schedule (typical 12-24 months).

## Workflow 3: Procurement-to-Payment (Cost Management)

```
Requisition ──► Approval ──► PO Creation ──► PO Approval ──► Goods Receipt ──► Invoice Capture ──► 3-Way Match ──► Payment
   [need]       [budget]       [order]         [authorize]      [receive]         [AP entry]         [validation]     [release]
```

**Cycle time target:** 7-14 days from requisition to PO.

## Workflow 4: Service-to-Resolution (Maintenance)

```
Service Request ──► Triage ──► Assign ──► Schedule ──► On-Site ──► Resolution ──► Verification ──► Close
   [intake]        [priority]     [tech]       [date]       [work]      [fix]          [client]         [billing]
```

**SLA targets:** Critical (4hrs), High (24hrs), Medium (48hrs), Low (5 days).

## Workflow 5: Financial Close (Period End)

```
Period End ──► Revenue Recognition ──► Expense Accrual ──► Bank Reconciliation ──► Trial Balance ──► Financial Reports
   [monthly]       [milestone review]      [PO accrual]         [CSV import]           [GL]              [P&L, Balance]
```

**Cycle time target:** 5 business days after month-end.

## Cross-Workflow Dependencies

| Workflow | Triggered By | Triggers |
|----------|-------------|----------|
| Lead-to-Contract | External (lead) | Project Delivery |
| Project Delivery | Contract signed | Procurement, Financial |
| Procurement | Project milestone, Maintenance | Financial |
| Service | Client request | Procurement (if parts needed) |
| Financial Close | Period end | All workflows (data source) |

See `06-Operations/` for detailed workflow specifications with swimlane diagrams.
