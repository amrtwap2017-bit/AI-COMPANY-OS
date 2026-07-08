# Database Design Specification

## Table Name
`[schema.table_name]`

## Description
[Brief description of what this table stores and its business purpose.]

## Columns
| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `[id]` | `[BIGINT/UUID]` | NO | `[auto_increment/gen_random_uuid()]` | Primary key |
| `[column_1]` | `[VARCHAR(255)/TEXT/INTEGER/etc]` | [YES/NO] | `[default_value]` | [Description] |
| `[column_2]` | `[TIMESTAMP/DATE/BOOLEAN/etc]` | [YES/NO] | `[default_value]` | [Description] |
| `[created_at]` | `[TIMESTAMP]` | NO | `[NOW()]` | Record creation timestamp |
| `[updated_at]` | `[TIMESTAMP]` | NO | `[NOW()]` | Record last-update timestamp |

## Constraints
| Constraint Type | Name | Columns | Definition |
|---|---|---|---|
| **Primary Key** | `[pk_table_name]` | `[id]` | — |
| **Unique** | `[uq_table_name_column]` | `[column_1, column_2]` | — |
| **Foreign Key** | `[fk_table_name_ref_table]` | `[foreign_key_column]` | REFERENCES `[schema.referenced_table]([referenced_column])` |
| **Check** | `[ck_table_name_rule]` | `[column]` | `[CHECK (condition)]` |
| **Not Null** | — | `[column]` | — |

## Indexes
| Index Name | Type | Columns | Included Columns | Filter Condition |
|---|---|---|---|---|
| `[idx_table_name_column]` | `[BTREE/GIN/GIST/HASH]` | `[column_1]` | `[column_2, column_3]` | `[WHERE ...]` |
| `[idx_table_name_search]` | `[GIN]` | `[search_vector]` | — | — |

## Relationships
```mermaid
erDiagram
    [TABLE_NAME] ||--o{ [RELATED_TABLE] : "has many"
    [TABLE_NAME] }o--|| [OTHER_TABLE] : "belongs to"
```

## Migration Plan
| Version | Description | Script Path | Rollback |
|---|---|---|---|
| `[V001]` | Create `[table_name]` table | `[migrations/V001__create_table_name.sql]` | `[migrations/rollback/V001__drop_table_name.sql]` |
| `[V002]` | Add `[column]` to `[table_name]` | `[migrations/V002__add_column.sql]` | `[migrations/rollback/V002__drop_column.sql]` |

### Example SQL (Create)
```sql
CREATE TABLE [schema].[table_name] (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    column_1 VARCHAR(255) NOT NULL,
    column_2 TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_table_name_column_1 ON [schema].[table_name] (column_1);
```

## Data Volume & Growth Estimates
- **Current Row Count:** [Number]
- **Monthly Growth Rate:** [Number]
- **Retention Policy:** [Duration / Archive strategy]

## Security & Compliance
- **PII Fields:** `[list of PII columns]`
- **Encryption Required:** [Yes/No]
- **Audit Logging:** [Yes/No]
- **Row-Level Security:** [Yes/No — describe policy if yes]
