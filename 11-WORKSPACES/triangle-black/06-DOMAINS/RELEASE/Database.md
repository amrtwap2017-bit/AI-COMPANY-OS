# 99-RELEASE — Database Schema

## release_versions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| version | VARCHAR(20) | 1.0.0, 1.1.0 |
| status | ENUM | planning, building, staging, uat, production, rolled_back |
| deployed_at | TIMESTAMPTZ | — |
| release_notes | TEXT | — |
| deployed_by | UUID FK | — |

## uat_test_cases
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| domain | VARCHAR(50) | — |
| feature | VARCHAR(255) | — |
| scenario | TEXT | Test scenario description |
| expected_result | TEXT | — |
| status | ENUM | not_tested, passed, failed, blocked |
| tested_by | UUID FK | — |
| defect_id | UUID FK | Nullable |

## defects
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| domain | VARCHAR(50) | — |
| severity | ENUM | critical, high, medium, low |
| status | ENUM | open, in_progress, fixed, verified, closed |
| description | TEXT | — |
| reported_by | UUID FK | — |
| assigned_to | UUID FK | — |
| fixed_at | TIMESTAMPTZ | — |
| verified_at | TIMESTAMPTZ | — |
