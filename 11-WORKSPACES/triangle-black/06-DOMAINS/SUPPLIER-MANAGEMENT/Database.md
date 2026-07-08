# 04-SUPPLIER-MANAGEMENT — Database Schema

## suppliers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| code | VARCHAR(50) | SPL-{YYYY}-{XXXXX} |
| name | VARCHAR(255) | Company name |
| tax_id | VARCHAR(50) | Egypt tax number |
| category | ENUM | material, equipment, subcontractor, service, transport |
| tier | ENUM | A, B, C, unrated |
| status | ENUM | pending, active, suspended, blacklisted, rejected |
| contact_person | VARCHAR(255) | — |
| email | VARCHAR(255) | — |
| phone | VARCHAR(50) | — |
| address | TEXT | — |
| payment_terms | VARCHAR(100) | — |
| notes | TEXT | — |

## supplier_documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| supplier_id | UUID FK | — |
| doc_type | ENUM | trade_license, vat_cert, bank_details, insurance, profile |
| file_path | VARCHAR(500) | — |
| expiry_date | DATE | Nullable |
| status | ENUM | valid, expired, pending_renewal |

## supplier_rate_cards
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| supplier_id | UUID FK | — |
| item_name | VARCHAR(255) | — |
| unit | VARCHAR(20) | — |
| unit_price | DECIMAL(12,2) | — |
| effective_from | DATE | — |
| effective_to | DATE | Nullable |

## supplier_evaluations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| supplier_id | UUID FK | — |
| period | VARCHAR(10) | 2026-Q1 |
| quality_score | DECIMAL(5,2) | 0-40 |
| delivery_score | DECIMAL(5,2) | 0-30 |
| price_score | DECIMAL(5,2) | 0-20 |
| compliance_score | DECIMAL(5,2) | 0-10 |
| total_score | DECIMAL(5,2) | 0-100 |
| notes | TEXT | — |
