# Phase 01 — Business Rules

> Core business rules that govern all domain operations across the platform.

## Commercial Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-CM-001 | Lead must have minimum contact info (name + phone OR email) before qualification | Validation | Frontend + Backend |
| BR-CM-002 | Opportunity requires at least one decision-maker contact | Validation | Backend |
| BR-CM-003 | Quotation must have minimum 15% gross margin | Constraint | Backend |
| BR-CM-004 | Quotation margin override (>5%) requires manager approval | Workflow | Backend |
| BR-CM-005 | Quotation expires after 30 days from creation | Computation | Scheduled job |
| BR-CM-006 | No duplicate quotation lines allowed for same product/service | Validation | Backend |
| BR-CM-007 | Contract requires signed quotation reference | Workflow | Backend |
| BR-CM-008 | Contract value cannot exceed 110% of quotation value | Validation | Backend |

## Project Delivery Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-PD-001 | Project start date cannot precede contract signing date | Validation | Backend |
| BR-PD-002 | Milestone approval required before percentage complete counted | Workflow | Backend |
| BR-PD-003 | NCR severity classification determines response SLA | Computation | Backend |
| BR-PD-004 | NCR must be resolved before project handover | Workflow | Backend |
| BR-PD-005 | Daily report required for each active project day | Workflow | Scheduled check |

## Procurement Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-PR-001 | PO requires approved requisition or contract reference | Workflow | Backend |
| BR-PR-002 | PO value cannot exceed approved budget by more than 10% | Validation | Backend |
| BR-PR-003 | PO value > EGP 50,000 requires dual approval | Workflow | Backend |
| BR-PR-004 | Goods receipt required within 5 days of delivery | Workflow | Scheduled check |

## Financial Control Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-FC-001 | Invoice requires approved milestone or PO reference | Workflow | Backend |
| BR-FC-002 | 3-way match must pass before payment processing | Workflow | Backend |
| BR-FC-003 | Revenue recognized only on milestone approval | Computation | Backend |
| BR-FC-004 | Credit note cannot exceed original invoice value | Validation | Backend |
| BR-FC-005 | ETA invoice submission within 24 hours of invoice creation | Compliance | Scheduled job |

## Inventory Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-IV-001 | Stock cannot be reserved beyond available quantity | Validation | Backend |
| BR-IV-002 | Negative stock not allowed (only for interim adjustments) | Validation | Backend |
| BR-IV-003 | Inventory adjustment > EGP 5,000 requires dual approval | Workflow | Backend |

## Supplier Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-SU-001 | Supplier requires valid tax registration | Validation | Backend |
| BR-SU-002 | Contract with unrated supplier requires director approval | Workflow | Backend |

## Maintenance Rules

| ID | Rule | Category | Enforcement |
|----|------|----------|-------------|
| BR-MT-001 | Service request priority determined by SLA and warranty status | Computation | Backend |
| BR-MT-002 | Warranty claim requires valid contract reference | Validation | Backend |
| BR-MT-003 | SLA breach auto-escalates after threshold exceeded | Workflow | Scheduled check |

See `02-Business/Business-Rules.md` for complete rule catalog.
