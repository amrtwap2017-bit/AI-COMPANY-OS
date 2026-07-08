---
ID: 07-Product-12
Title: Acceptance Criteria
Purpose: Define what "done" means per V1 module
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Acceptance Criteria — V1

## Definition of Done (Platform-Wide)

A V1 module is considered "done" when:
1. All P0 and P1 functional requirements are implemented and tested
2. All business rules are enforced
3. Non-functional requirements (performance, security) are met
4. API endpoints are documented and return correct responses
5. UI is responsive and matches design specifications
6. Error states, empty states, and loading states are handled
7. Unit and integration tests pass (>80% coverage)
8. Security review completed (no critical/high vulnerabilities)
9. Audit logging is active for all data mutations
10. User acceptance testing (UAT) signed off by stakeholder

## Module-Level Acceptance Criteria

### 1. Public Website

| Criteria | Verification Method |
|----------|-------------------|
| All pages render correctly on desktop, tablet, mobile | Visual inspection on 3 viewports |
| Contact form submits and creates Lead in CRM | E2E test: submit form → verify Lead in CRM |
| Spam protection prevents automated submissions | Integration test with honeypot/CAPTCHA |
| Services page lists all service categories | Content review |
| All links are functional | Automated link checker |
| Page loads < 3 seconds on 4G connection | Lighthouse performance test |
| No broken images or missing assets | Visual audit |
| Privacy policy and terms pages are accessible | Navigation check |
| SEO meta tags are present on all pages | HTML audit |
| Google Analytics (or similar) tracking is installed | Verification |

### 2. CRM

| Criteria | Verification Method |
|----------|-------------------|
| Lead can be created manually and via website submission | E2E test both paths |
| Lead can be converted to Opportunity with Company/Contact | E2E test full conversion |
| All CRUD operations work on Leads, Opportunities, Companies, Contacts | Test each entity |
| Activity logging captures all actions on all entities | Integration test |
| Pipeline view shows opportunities with correct stages and values | Visual + data verification |
| Search returns relevant results across all entities | Search test with known data |
| Duplicate detection flags matching companies | Integration test |
| Role-based access restricts unauthorized actions | Security test per role |
| Opportunity stages enforce valid transitions | Integration test |
| Export works (CSV) for all list views | Test export functionality |

### 3. Quotations

| Criteria | Verification Method |
|----------|-------------------|
| RFQ can be created with line items and submitted | E2E test |
| Quotation can be generated from RFQ with correct pricing | E2E test |
| Quotation PDF generation produces correct document | Visual inspection of PDF |
| Version history is preserved when quotation is revised | Integration test |
| Approval workflow enforces thresholds (EGP 50k, 200k) | Integration test per threshold |
| Contract can be created from approved quotation | E2E test |
| Digital signature capture stores name, date, IP | Integration test |
| Expired quotations cannot be approved | Integration test |
| All status transitions follow business rules | State machine test |
| Currency conversion works when EGP/USD changed | Integration test |

### 4. Projects

| Criteria | Verification Method |
|----------|-------------------|
| Project can be created with all required fields | E2E test |
| Milestones can be added, ordered, and tracked | E2E test |
| Milestone completion requires predecessor completion | Integration test |
| Files can be uploaded at project and milestone level | E2E test |
| Uploaded files are accessible and correctly named | Integration test |
| Invalid file types are rejected | Integration test |
| Project completion % is calculated correctly | Data verification test |
| Project status transitions follow allowed paths | State machine test |
| Timeline view shows milestones with dates correctly | Visual verification |
| Project-Contract-Company linkages are maintained | Data integrity test |

### 5. Client Portal

| Criteria | Verification Method |
|----------|-------------------|
| Client can log in with email/password and magic link | E2E test both methods |
| Dashboard displays correct data for the client's company | Data isolation test |
| Project list shows only the client's projects | Data isolation test |
| Quotation list shows history and allows PDF download | E2E test |
| Client can approve or reject quotation | E2E test |
| Service request can be submitted and confirmation received | E2E test |
| Document repository shows only permitted documents | Role-based access test |
| Failed login lockout activates after 5 attempts | Security test |
| Password reset flow works end-to-end | E2E test |
| Session timeout occurs after 60 minutes of inactivity | Integration test |
| Portal is fully responsive on mobile (360px+) | Visual test on mobile viewports |

### 6. Executive Dashboard

| Criteria | Verification Method |
|----------|-------------------|
| Pipeline summary shows correct counts and values | Data verification test |
| Active project count matches actual project statuses | Data verification test |
| Revenue YTD chart displays correct trend data | Data verification test |
| Upcoming milestones list shows correct items + dates | Data verification test |
| Client KPIs display (quotations pending, active requests) | Data verification test |
| Charts are interactive (hover tooltips) | Visual + functional test |
| Dashboard loads in < 3 seconds | Performance test |
| PDF export generates complete report | Visual inspection of PDF |
| Date range filtering updates all widgets correctly | Integration test |
| Role-based access shows/hides appropriate data | Security test per role |

### 7. Administration

| Criteria | Verification Method |
|----------|-------------------|
| User CRUD operations work for Admin role | E2E test |
| Role assignment correctly controls module access | Security test per role |
| Company profile can be configured with logo and settings | E2E test |
| Audit log records all mutations with correct detail | Integration test |
| Deactivated user cannot log in | Security test |
| Password policy is enforced on creation and change | Integration test |
| Minimum 2 admin accounts rule is enforced | Integration test |
| Self-deactivation is prevented | Integration test |
| System settings affect application behavior (currency, tax) | Integration test |
| Multi-tenant data isolation is verified | Data isolation test (Company A user cannot see Company B data) |
