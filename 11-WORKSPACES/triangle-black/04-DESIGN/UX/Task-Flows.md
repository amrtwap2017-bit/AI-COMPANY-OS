# Task Flows

## Flow 1: Create Lead

```
User Actions                          System Response
─────────────                         ────────────────
1. Click "New Lead" on Lead List      → Opens Lead Create form
2. Fill form fields:
   - Name* (required)
   - Email* (validated format)
   - Phone
   - Company name
   - Source (dropdown)
   - Notes
3. Click "Save"                       → Validate required fields
                                       → Check duplicate detection (BR-CRM-01)
                                       → On duplicate: show warning dialog
                                          [Continue anyway] [Cancel]
                                       → On unique: Create lead record
                                       → Return to Lead Detail
                                       → Show toast: "Lead created"
                                       → Emit: LeadCreated event
4. (Optional) Click "Add Activity"    → Open activity form
   → Log call/email/meeting           → Save activity
                                       → Return to Lead Detail with new activity
```

---

## Flow 2: Convert Lead to Opportunity

```
User Actions                          System Response
─────────────                         ────────────────
1. Open Lead Detail                   → Display lead info
2. Click "Convert to Opportunity"     → Check: Company exists? (BR-CRM-02)
                                       → If no Company: prompt to create
                                       → Open Opportunity form (pre-filled)
3. Fill Opportunity fields:
   - Opportunity name
   - Estimated value
   - Stage (default: Qualification)
   - Close date
   - Select Company (or create new)
4. Click "Convert"                    → Update lead status → "Converted"
                                       → Create Opportunity record
                                       → Link Opportunity to Lead + Company
                                       → Create default Contact from Lead
                                       → Emit: OpportunityCreated
                                       → Redirect to Opportunity Detail
                                       → Show toast: "Lead converted to opportunity"
```

---

## Flow 3: Create Quotation

```
User Actions                          System Response
─────────────                         ────────────────
1. Open Opportunity Detail            → Display opportunity info
2. Click "Create Quotation"           → Check: Assessment exists?
                                       → If yes: pre-fill BOQ lines from assessment
                                       → Open Quotation Builder
3. Edit line items:                   → Auto-calculate totals (BR-QTN-07)
   - Add/remove items                 → Update subtotal, tax, total
   - Set quantities, prices           → Show margin warning if below threshold
   - Apply discounts
4. Verify pricing summary
5. Click "Submit for Approval"        → Validate: at least 1 line item (BR-QTN-01)
                                       → Validate: total > 0
                                       → Determine approval chain (BR-QTN-05)
                                       → Set status → "Pending Approval"
                                       → Emit: QuotationCreated
                                       → Notify approver(s)
                                       → Redirect to Quotation Detail
```

---

## Flow 4: Approve Quotation (Internal)

```
User Actions                          System Response
─────────────                         ────────────────
1. Receive notification               → Email: "Quotation QTN-2026-00142 pending approval"
2. Open Quotation Detail              → Display quotation with line items, totals
                                       → Show approval history
3. Review quotation                   → If > EGP 50k and user = MANAGER:
                                          Show "Requires higher approval"
                                       → If within authority: show [Approve] [Reject]
4a. Click "Approve"                   → Validate approval authority (BR-QTN-05)
    → Optional: add comment           → Update status → "Approved" (or partial approval)
                                       → If multi-level: notify next approver
                                       → If fully approved: emit QuotationSent
                                       → Show toast: "Quotation approved"
4b. Click "Reject"                    → Require reason
    → Enter rejection reason          → Update status → "Rejected"
                                       → Emit: QuotationRejected
                                       → Notify creator
                                       → Show toast: "Quotation rejected"
```

---

## Flow 5: Site Survey

```
User Actions                          System Response
─────────────                         ────────────────
1. Open Project → Surveys tab         → Display survey list
2. Click "New Survey"                 → Open Survey Form
3. Fill survey data:
   - Date, location, weather
   - System checklist (HVAC, electrical, etc.)
   - Condition ratings per system
   - Photo upload (camera/file)
   - Defect notes
   - Recommendations
4. Save as Draft                      → Save partial survey
                                       → Show toast: "Draft saved"
5. Continue later → Reopen survey     → Load saved draft
6. Click "Submit Survey"              → Validate all required sections
                                       → Set status → "Completed"
                                       → Emit: SiteSurveyCompleted
                                       → Notify: sales + engineering team
                                       → Show toast: "Survey submitted successfully"
```

---

## Flow 6: Client Approves Quotation

```
User Actions                          System Response
─────────────                         ────────────────
1. Receive email notification          → Email: "New quotation ready for review"
2. Log in to Client Portal (or magic link)
3. Dashboard shows pending badge       → Load client dashboard
4. Click Quotations → opens list      → Filter: own quotations
5. Click quotation number             → Load quotation detail
   → Review line items, totals, terms
   → Download PDF
6. If Client Admin role:
   a. Click "Approve"                 → Show confirmation dialog
      → Confirm                       → Update status → "Client Approved"
                                       → Emit: QuotationAccepted
                                       → Notify: Triangle Black sales team
                                       → Show toast: "Quotation approved"
   b. Click "Request Revision"        → Show comment form
      → Enter revision request        → Update status → "Revision Requested"
                                       → Emit: QuotationRejected (with reason)
                                       → Notify: Triangle Black sales team
7. If Client User role:               → [Approve] button hidden
   Only [Download PDF] available      → Read-only access (BR-POR-04)
```

---

## Flow 7: Complete Milestone

```
User Actions                          System Response
─────────────                         ────────────────
1. Open Project → Milestones tab      → Display milestone list
2. Find milestone "Chiller Install"   → Show status: In Progress
3. Click "Mark Complete"              → Check: All predecessor milestones Complete? (BR-PRJ-02)
                                       → If no: show warning "Predecessor milestones not complete"
                                       → If yes: show confirmation
4. Confirm completion                 → Set milestone status → "Completed"
                                       → Update project completion % (BR-PRJ-04)
                                       → If milestone requires approval (BR-PRJ-03):
                                          Set status → "Pending Approval"
                                          Notify PM
                                       → If all milestones complete:
                                          Project status → "Ready for Handover"
                                       → Emit: ProjectMilestoneReached
                                       → Show toast: "Milestone completed"
```

---

## Flow 8: Service Request (Client)

```
User Actions                          System Response
─────────────                         ────────────────
1. Open Client Portal                 → Dashboard
2. Click "Submit Request"             → Open request form
3. Fill request:
   - Type: [Maintenance/Procurement/Inquiry/Emergency]
   - Priority: [Low/Medium/High/Critical]
   - Subject
   - Description
   - Attachments (optional, up to 5)
   - Related project (optional)
4. Click "Submit"                     → Validate: type + subject + description required
                                       → If Emergency: show red confirmation
                                          "Emergency requests will be prioritized"
                                       → Create request record
                                       → Auto-acknowledgment (BR-POR-07)
                                       → Notify Triangle Black operations
                                       → Show toast: "Request #REQ-00001 submitted"
                                       → Redirect to Request Detail
```
