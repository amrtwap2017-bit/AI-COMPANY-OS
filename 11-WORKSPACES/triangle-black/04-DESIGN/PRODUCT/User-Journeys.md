---
ID: 07-Product-08
Title: User Journeys
Purpose: Define end-to-end user journeys for V1 modules
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# User Journeys

## Journey 1: Lead to Opportunity (CRM)

**Actor:** Nadia (Internal Admin) / Sales Team
**Trigger:** Website contact form submission or inbound call

| Step | Actor | System Action | Module |
|------|-------|---------------|--------|
| 1 | Visitor submits contact form on website | Creates Lead record in CRM | Website → CRM |
| 2 | System sends email notification to sales | Lead status set to "New" | CRM |
| 3 | Sales rep reviews lead, adds notes | Logs activity to lead record | CRM |
| 4 | Sales rep calls/emails prospect | Updates lead status to "Contacted" | CRM |
| 5 | Prospect shows interest in service | Converts lead to Opportunity | CRM |
| 6 | Sales rep creates company record | Company created; linked to opportunity | CRM |
| 7 | Sales rep creates contact records | Contacts added for GM, Chief Engineer | CRM |
| 8 | Opportunity moved to "Qualified" | Sales pipeline updated | CRM |

**Success:** Opportunity enters pipeline with clear next action and owner.

---

## Journey 2: RFQ to Quotation (Quotations)

**Actor:** Mona (Purchasing Manager) / Karim (Chief Engineer)
**Trigger:** Equipment failure requiring replacement part

| Step | Actor | System Action | Module |
|------|-------|---------------|--------|
| 1 | Karim identifies need for chiller pump | Creates RFQ from template | Quotations |
| 2 | Karim adds line items, specifications | RFQ status set to "Draft" | Quotations |
| 3 | Karim submits RFQ for internal review | RFQ status set to "Submitted" | Quotations |
| 4 | Sales/Procurement reviews RFQ | RFQ approved or returned with comments | Quotations |
| 5 | Sales rep creates quotation from RFQ | Quotation generated with pricing | Quotations |
| 6 | Quotation sent to client via portal | Notification sent; status "Pending Approval" | Quotations → Portal |
| 7 | GM logs into portal, reviews quotation | Sees line items, total, terms | Portal |
| 8 | GM approves quotation in portal | Status set to "Approved" | Portal → Quotations |
| 9 | System generates contract from quotation | Contract status "Pending Signature" | Quotations |
| 10 | Both parties sign (digital or physical) | Contract status set to "Signed" | Quotations |

**Success:** Signed contract in system, procurement can proceed.

---

## Journey 3: Project Execution (Projects)

**Actor:** Tarek (Field Engineer) + Karim (Chief Engineer)
**Trigger:** Signed contract for chiller replacement project

| Step | Actor | System Action | Module |
|------|-------|---------------|--------|
| 1 | Project manager creates project record | Project created with milestones | Projects |
| 2 | PM defines milestones from contract | Status updated, timeline computed | Projects |
| 3 | PM assigns Tarek as field engineer | Tarek receives notification | Projects |
| 4 | Tarek views project on mobile | Sees milestones, tasks, deliverables | Projects |
| 5 | Tarek completes first milestone (demolition) | Marks milestone complete in-app | Projects |
| 6 | Tarek uploads before/during/after photos | Files stored under milestone | Projects |
| 7 | Karim reviews and approves milestone | Milestone status "Approved" | Projects |
| 8 | Client logs into portal, sees progress | Project timeline updated | Projects → Portal |
| 9 | PM uploads completion report | Document stored in project files | Projects |
| 10 | PM marks project complete | Project status set to "Completed" | Projects |

**Success:** Project completed with full documentation. Client can see everything.

---

## Journey 4: Client Self-Service (Client Portal)

**Actor:** Karim (Chief Engineer) / Ahmed (GM)
**Trigger:** New quotation published or periodic check-in

| Step | Actor | System Action | Module |
|------|-------|---------------|--------|
| 1 | Karim receives email notification | "New quotation ready for review" | Portal |
| 2 | Karim clicks magic link, logs in | Dashboard shows 1 pending quotation | Portal |
| 3 | Karim views quotation details | Line items, specs, total displayed | Portal |
| 4 | Karim downloads quotation PDF | PDF generated on demand | Portal |
| 5 | Karim adds comment ("Need to confirm model") | Comment logged on quotation | Portal |
| 6 | Sales rep responds in system | Karim receives notification | Quotations |
| 7 | Karim approves quotation | Status updated; notification to sales | Portal |
| 8 | Karim checks active project progress | Project timeline with milestone status | Portal |
| 9 | Karim uploads a requested document | File stored, notification to PM | Portal |

**Success:** Karim completed 5 actions without a single email to Triangle Black.

---

## Journey 5: Weekly Executive Review (Dashboard)

**Actor:** Ahmed (GM)
**Trigger:** Monday morning review

| Step | Actor | System Action | Module |
|------|-------|---------------|--------|
| 1 | Ahmed logs into dashboard | Dashboard loads with last week's data | Dashboard |
| 2 | Views pipeline summary | Number of active RFQs, quotations pending | Dashboard |
| 3 | Views project status | All projects with % complete and status | Dashboard |
| 4 | Views spend summary | YTD spend vs. budget by category | Dashboard |
| 5 | Views upcoming milestones | Milestones due in next 14 days | Dashboard |
| 6 | Drills into specific project | Project detail with milestone status | Dashboard → Projects |
| 7 | Exports dashboard as PDF | PDF generated for owner report | Dashboard |
| 8 | Logs out | Session ended | - |

**Success:** Ahmed has complete picture in 5 minutes. No meetings required.

---

## Journey 6: User Onboarding (Administration)

**Actor:** Nadia (Internal Admin)
**Trigger:** New client signed

| Step | Actor | System Action | Module |
|------|-------|---------------|--------|
| 1 | Nadia creates new client tenant | Tenant provisioned with defaults | Admin |
| 2 | Nadia creates user accounts | Accounts created with role-based permissions | Admin |
| 3 | Users receive welcome email | Login credentials and portal link sent | Admin |
| 4 | Nadia configures company profile | Logo, name, settings applied | Admin |
| 5 | Nadia assigns module access | Each user sees only permitted modules | Admin |
| 6 | Nadia verifies first login | Login succeeds; portal configured correctly | Admin |
| 7 | Nadia runs onboarding checklist | All checklist items verified | Admin |

**Success:** Client team has access to exactly what they need, nothing more.
