# Database Audit

Alembic has one declared head: `v11004_rec_outcomes` (VERIFIED). The historical expected head matches. The baseline migration creates 116 tables; only 62 `__tablename__` occurrences were found in current source, so model/migration parity is not established. The historical "about 176 tables" is NOT VERIFIED.

Configured DB is PostgreSQL through SQLAlchemy. `pg_isready` found no server on localhost:5432. Consequently PostgreSQL version, actual schema, table count, migration version, largest tables, indexes, orphan records, duplicate records, customer data, organisations, hotels, and ROI are **UNKNOWN / NOT VERIFIED**. A 56 KB tracked SQLite file exists but `sqlite3` CLI is unavailable and it is not the configured runtime database.

Important schema anti-pattern: `EvidenceLedgerService._ensure_table()` issues `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` at service construction, outside Alembic. Root `main.py` also calls `Base.metadata.create_all()` at startup. These defeat migration-only schema control and make production state harder to reproduce.
