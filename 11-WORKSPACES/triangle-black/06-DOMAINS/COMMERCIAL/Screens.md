# 01-COMMERCIAL — Screens

## CRM Module

| Screen | Route | Description |
|--------|-------|-------------|
| Lead List | /crm/leads | Searchable, filterable table with score badge |
| Lead Detail | /crm/leads/:id | Full profile + activity timeline + convert action |
| Lead Create | /crm/leads/new | Form: source, contact, company, notes |
| Pipeline | /crm/pipeline | Kanban by opportunity stage, drag-to-move |
| Opportunity Detail | /crm/opportunities/:id | Details + survey tab + quotation tab |
| Account List | /crm/companies | Company directory with search |
| Account Detail | /crm/companies/:id | Company profile + contacts + opportunities + contracts |
| Forecast | /crm/forecast | Pipeline value by stage, weighted totals |
| Win/Loss | /crm/win-loss | Analysis table with charts |

## Site Survey Module

| Screen | Route | Description |
|--------|-------|-------------|
| Survey List | /surveys | Calendar/list view of scheduled surveys |
| Survey Detail | /surveys/:id | Findings, photos, measurements, status |
| Survey Execute | /surveys/:id/execute | Form for engineers to capture findings |
| Survey Approve | /surveys/:id/review | Approve/reject with comments |

## Quotation Module

| Screen | Route | Description |
|--------|-------|-------------|
| Quotation List | /quotations | Table with status badge, value, client |
| Quotation Detail | /quotations/:id | PDF preview + line items + approval history |
| Quotation Builder | /quotations/:id/edit | Line item editor with real-time margin |
| Quotation Approve | /quotations/:id/approve | Review screen with approve/reject actions |

## Contract Module

| Screen | Route | Description |
|--------|-------|-------------|
| Contract List | /contracts | Table with status, value, dates |
| Contract Detail | /contracts/:id | Full contract view + timeline |
| Contract Create | /contracts/new | Wizard: select quotation → terms → sign |

## Client Portal

| Screen | Route | Description |
|--------|-------|-------------|
| Client Dashboard | /portal | Quotation list, contract list, notifications |
| Client Quotation | /portal/quotations/:id | View + approve/reject |
| Client Contract | /portal/contracts/:id | View + sign |
