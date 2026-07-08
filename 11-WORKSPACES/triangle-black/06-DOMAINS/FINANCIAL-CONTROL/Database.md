# 06-FINANCIAL-CONTROL — Database Schema

## invoices (AR)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| company_id | UUID FK | Client |
| project_id | UUID FK | Nullable |
| type | ENUM | milestone, manual, credit_note |
| number | VARCHAR(50) | INV-{YYYY}-{XXXXX} |
| status | ENUM | draft, sent, overdue, paid, written_off |
| total | DECIMAL(12,2) | — |
| vat | DECIMAL(12,2) | 14% |
| due_date | DATE | — |
| paid_at | TIMESTAMPTZ | — |

## invoice_line_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| invoice_id | UUID FK | — |
| description | VARCHAR(500) | — |
| quantity | DECIMAL(10,2) | — |
| unit_price | DECIMAL(12,2) | — |
| total | DECIMAL(12,2) | — |

## payments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| invoice_id | UUID FK | — |
| amount | DECIMAL(12,2) | — |
| payment_date | DATE | — |
| method | ENUM | bank_transfer, cheque, cash, credit_card |
| reference | VARCHAR(100) | Transaction reference |

## supplier_invoices (AP)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| po_id | UUID FK | — |
| supplier_id | UUID FK | — |
| number | VARCHAR(100) | Supplier's invoice number |
| amount | DECIMAL(12,2) | — |
| status | ENUM | pending, matched, approved, paid, disputed |
| due_date | DATE | — |
| match_status | ENUM | pending, partial, complete, mismatch |

## gl_entries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| account_code | VARCHAR(20) | — |
| debit | DECIMAL(12,2) | — |
| credit | DECIMAL(12,2) | — |
| description | VARCHAR(500) | — |
| reference_type | VARCHAR(50) | invoice, payment, adjustment |
| reference_id | UUID | — |
| entry_date | DATE | — |
