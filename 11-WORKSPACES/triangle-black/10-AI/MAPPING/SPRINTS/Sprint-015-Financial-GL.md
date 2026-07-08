# Sprint 015 — Financial GL — Ledger and Reporting

## Goal
Build the general ledger with journal entries, chart of accounts, financial reporting, and ETA (tax authority) integration for statutory compliance.

## Capabilities
- FIN-011 — General Ledger — from Financial Control
- FIN-012 — Chart of Accounts — from Financial Control
- FIN-013 — Journal Entries — from Financial Control
- FIN-014 — Financial Reports — from Financial Control
- FIN-015 — ETA Integration — from Financial Control
- FIN-016 — Audit Trail — from Financial Control

## Context Pack Required
**Pack ID:** CP-Financial-Invoicing
**Total Documents:** 6

### Domain Documents
- `../02-DOMAIN-DOCS/05-Financial-Control/General-Ledger.md` — General Ledger
- `../02-DOMAIN-DOCS/05-Financial-Control/Chart-of-Accounts.md` — Chart of Accounts
- `../02-DOMAIN-DOCS/05-Financial-Control/Journal-Entries.md` — Journal Entries
- `../02-DOMAIN-DOCS/05-Financial-Control/Financial-Reporting.md` — Financial Reporting
- `../02-DOMAIN-DOCS/05-Financial-Control/ETA-Integration.md` — ETA Integration

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Integration-Standards.md` — Integration Standards
- `../04-STANDARDS/Compliance-Standards.md` — Compliance Standards

## Entities to Build
- ChartOfAccount — Financial Control
- AccountCategory — Financial Control
- JournalEntry — Financial Control
- JournalLine — Financial Control
- GeneralLedgerEntry — Financial Control
- FinancialReport — Financial Control
- FinancialReportLine — Financial Control
- ETATransaction — Financial Control
- ETAReturn — Financial Control
- AuditTrailEntry — Financial Control

## APIs to Build
- `/api/financial/accounts` — GET/POST — Chart of accounts
- `/api/financial/accounts/{id}` — GET/PUT/DELETE — Account detail
- `/api/financial/accounts/{id}/balance` — GET — Account balance
- `/api/financial/journal-entries` — GET/POST — Journal entries
- `/api/financial/journal-entries/{id}` — GET/PUT — Entry detail
- `/api/financial/journal-entries/{id}/post` — POST — Post journal entry
- `/api/financial/ledger` — GET — General ledger query
- `/api/financial/ledger/export` — GET — Export ledger to CSV
- `/api/financial/reports/trial-balance` — GET — Trial balance report
- `/api/financial/reports/profit-loss` — GET — P&L statement
- `/api/financial/reports/balance-sheet` — GET — Balance sheet
- `/api/financial/reports/cash-flow` — GET — Cash flow statement
- `/api/financial/reports/aged-receivables` — GET — Aged receivables
- `/api/financial/reports/aged-payables` — GET — Aged payables
- `/api/financial/eta/invoice` — POST — Submit invoice to ETA
- `/api/financial/eta/return` — POST — Submit tax return
- `/api/financial/eta/status/{id}` — GET — ETA submission status
- `/api/financial/audit-trail` — GET — Audit trail query

## Screens to Build
- `/financial/accounts` — Chart of accounts
- `/financial/accounts/new` — Create account
- `/financial/accounts/{id}` — Account detail with balance
- `/financial/journal-entries` — Journal entry list
- `/financial/journal-entries/new` — Create journal entry
- `/financial/journal-entries/{id}` — Entry detail
- `/financial/ledger` — General ledger viewer
- `/financial/reports/trial-balance` — Trial balance
- `/financial/reports/profit-loss` — P&L statement
- `/financial/reports/balance-sheet` — Balance sheet
- `/financial/reports/cash-flow` — Cash flow statement
- `/financial/reports/aged-receivables` — Aged receivables
- `/financial/reports/aged-payables` — Aged payables
- `/financial/eta` — ETA integration dashboard
- `/financial/eta/invoices` — Submitted invoices
- `/financial/audit-trail` — Audit trail browser

## AI Agents Assigned
- Backend Lead AI — GL, journal, report, ETA APIs
- Frontend Lead AI — Financial reports and ledger screens
- Database Architect AI — GL schema with double-entry integrity
- Integration AI — ETA API integration
- Compliance AI — Audit trail and statutory reporting rules

## Dependencies
- Sprint 013 — Financial AR (invoice and payment data)
- Sprint 014 — Financial AP (supplier invoice and payment data)

## Quality Gates
- Double-entry bookkeeping ensures journal entries balance
- Trial balance always balances to zero
- Financial reports match period-end closing data
- ETA invoice submission returns acceptance confirmation
- Audit trail records every financial transaction immutably

## Estimated Deliverables
- 4 backend modules (gl, journal, reports, eta)
- 16 frontend pages
- 80 unit tests
- 10 integration tests
- 5 documents
