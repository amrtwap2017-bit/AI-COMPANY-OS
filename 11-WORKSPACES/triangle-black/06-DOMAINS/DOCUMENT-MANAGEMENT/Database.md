# 08-DOCUMENT-MANAGEMENT — Database Schema

## document_folders
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| project_id | UUID FK | Nullable (global if null) |
| parent_id | UUID FK | Self-referencing |
| name | VARCHAR(255) | — |
| path | TEXT | Full path for display |

## documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| folder_id | UUID FK | — |
| name | VARCHAR(255) | — |
| file_type | VARCHAR(20) | pdf, docx, dwg, etc |
| file_size | INTEGER | Bytes |
| current_version | INTEGER | Latest version number |
| tags | TEXT[] | Searchable tags |
| description | TEXT | — |

## document_versions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | — |
| document_id | UUID FK | — |
| version | INTEGER | 1, 2, 3... |
| file_path | VARCHAR(500) | Storage path |
| uploaded_by | UUID FK | — |
| notes | TEXT | Version notes |
