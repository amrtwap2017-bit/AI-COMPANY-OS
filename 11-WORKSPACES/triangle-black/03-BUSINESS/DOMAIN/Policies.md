# Policies

Business policies and rules that govern behavior across the domain. Policies are externalized from the core domain logic and may change independently.

---

## CRM Policies

### Lead Qualification Policy
- **Rule:** A lead is qualified when LeadScore >= 50 AND at least one contact attempt has been made
- **Applies:** Lead status transition
- **Enforcement:** Automatic (system evaluates and suggests qualification)

### Opportunity Stage Transition Policy
- **Rule:** An opportunity cannot skip stages in the pipeline sequence
- **Applies:** Opportunity stage changes
- **Enforcement:** System-enforced

### Opportunity Stale Policy
- **Rule:** An opportunity with no activity for 30 days is flagged as "Stale" and escalated to the sales manager
- **Applies:** Opportunity management
- **Enforcement:** Scheduled job runs daily

### Client Contact Policy
- **Rule:** Every Account must have at least one primary contact marked
- **Applies:** Account management
- **Enforcement:** Validation on account save

---

## Marketing Policies

### Campaign Budget Policy
- **Rule:** Total campaign cost must not exceed approved budget
- **Applies:** Campaign execution
- **Enforcement:** Warning at 80%, block at 100%

### Lead Scoring Policy
- **Rule:** Lead score is calculated based on: Demographic fit (40%) + Engagement (35%) + Behavior (25%)
- **Applies:** Lead scoring model
- **Enforcement:** System-calculated daily

---

## Quotation Policies

### Margin Approval Policy
- **Rule:** Quotations with margin below 15% require director-level approval
- **Applies:** Quotation approval
- **Enforcement:** Workflow route to director

### Quotation Validity Policy
- **Rule:** Quotations are valid for 30 days from the date of issue unless otherwise specified
- **Applies:** Quotation lifecycle
- **Enforcement:** System auto-expires quotations after validity period

### Discount Policy
- **Rule:** Discounts above 10% require sales manager approval; discounts above 20% require director approval
- **Applies:** Quotation pricing
- **Enforcement:** Approval workflow

### Price Freeze Policy
- **Rule:** Once a quotation is sent to the client, prices cannot be modified. A new version must be created
- **Applies:** Quotation modification
- **Enforcement:** System-enforced state lock

---

## Contract Policies

### Contract Signing Authority Policy
- **Rule:** Contracts above $100,000 require director signature; above $500,000 require CEO signature
- **Applies:** Contract execution
- **Enforcement:** Approval workflow routing

### Contract Expiry Notification Policy
- **Rule:** Contract expiry notifications are sent at 90, 60, and 30 days before expiry
- **Applies:** Contract lifecycle
- **Enforcement:** Scheduled job triggers notifications

### Amendment Policy
- **Rule:** Contract amendments must be approved by both parties and reference the original contract
- **Applies:** Contract modifications
- **Enforcement:** Amendment workflow

---

## Project Policies

### Change Order Policy
- **Rule:** Any change impacting budget by >5% or schedule by >10% requires a formal change order
- **Applies:** Project execution
- **Enforcement:** Threshold check on change requests

### Resource Overallocation Policy
- **Rule:** A resource cannot be allocated to more than 100% of their available time
- **Applies:** Resource assignment
- **Enforcement:** Validation on assignment save

### Project Status Update Policy
- **Rule:** Project status must be updated at least once per week by the project manager
- **Applies:** Project monitoring
- **Enforcement:** Reminder notification; escalation if overdue by 3 days

### Site Survey Submission Policy
- **Rule:** Site survey report must be submitted within 5 business days of the inspection date
- **Applies:** Site survey
- **Enforcement:** Deadline tracking with escalation

---

## Procurement Policies

### Procurement Approval Policy
- **Rule:** Procurement requests above $10,000 require manager approval; above $50,000 require director approval
- **Applies:** Procurement requisition
- **Enforcement:** Approval workflow routing

### Minimum Vendor Quotes Policy
- **Rule:** At least 3 vendor quotations must be obtained for any procurement above $5,000
- **Applies:** RFQ process
- **Enforcement:** Validation before PO can be issued

### Vendor Evaluation Policy
- **Rule:** New vendors must pass a qualification evaluation before being added to the approved vendor list
- **Applies:** Vendor management
- **Enforcement:** Qualification workflow

### PO Approval Policy
- **Rule:** Purchase orders above $25,000 require director approval; above $100,000 require CEO approval
- **Applies:** Purchase order
- **Enforcement:** Approval workflow

### Goods Receipt Matching Policy
- **Rule:** Goods receipt must match PO quantity within 5% tolerance. Discrepancies above 5% trigger a discrepancy report
- **Applies:** Goods receipt
- **Enforcement:** Validation on goods receipt entry

---

## Inventory Policies

### Reorder Point Policy
- **Rule:** When stock level falls below the reorder point, a replenishment notification is triggered
- **Applies:** Inventory management
- **Enforcement:** Automated trigger on stock update

### Stock Rotation Policy
- **Rule:** FEFO (First Expiry, First Out) method applies to all inventory with expiry dates
- **Applies:** Stock movement
- **Enforcement:** System-suggested picking order

---

## QA/QC Policies

### Inspection Hold Policy
- **Rule:** If defect rate exceeds 5% in an inspection batch, all items are placed on hold pending full inspection
- **Applies:** Quality control
- **Enforcement:** Auto-hold on threshold breach

### Non-Conformance Policy
- **Rule:** All non-conformances must be documented, assigned for resolution, and verified upon closure
- **Applies:** Quality management
- **Enforcement:** Non-conformance workflow

---

## Handover Policies

### Handover Completion Policy
- **Rule:** Project handover requires: (1) all deliverables accepted, (2) punch list items resolved, (3) as-built documentation submitted, (4) final payment received
- **Applies:** Project closure
- **Enforcement:** Checklist must be 100% complete

### Warranty Policy
- **Rule:** Standard warranty period is 12 months from handover date unless otherwise specified in the contract
- **Applies:** Handover / Contract
- **Enforcement:** System-calculated warranty end date

---

## General / Cross-Cutting Policies

### Data Retention Policy
- **Rule:** Inactive client records are archived after 5 years of inactivity
- **Applies:** All contexts
- **Enforcement:** Scheduled archiving job

### Access Control Policy
- **Rule:** Users can only access data within their assigned roles and organizational units
- **Applies:** All contexts
- **Enforcement:** Permission system

### Audit Policy
- **Rule:** All create, update, and delete operations on business-critical entities are logged in the audit trail
- **Applies:** All contexts
- **Enforcement:** AOP-based logging
