"""Sprint-230: workflow engine tables (safe — handles pre-existing tables)

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-08-16

Strategy:
  workflow_instances + workflow_transitions — pre-exist WITHOUT hotel_id.
  Add hotel_id column safely with ALTER TABLE IF NOT EXISTS pattern.
  workflow_definitions — new table, safe CREATE IF NOT EXISTS.
"""
from alembic import op
import sqlalchemy as sa

revision = 'c2d3e4f5a6b7'
down_revision = 'b1c2d3e4f5a6'
branch_labels = None
depends_on = None


def _col_exists(table: str, column: str) -> bool:
    from sqlalchemy import inspect, text
    from alembic import op
    bind = op.get_bind()
    insp = inspect(bind)
    if table not in insp.get_table_names():
        return False
    cols = [c["name"] for c in insp.get_columns(table)]
    return column in cols


def _table_exists(table: str) -> bool:
    from sqlalchemy import inspect
    insp = inspect(op.get_bind())
    return table in insp.get_table_names()


def upgrade():
    # ── workflow_definitions (new table) ────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS workflow_definitions (
            id                  VARCHAR(36)  PRIMARY KEY,
            hotel_id            VARCHAR(36)  NOT NULL DEFAULT 'tb-default-hotel-000000000001',
            name                VARCHAR(200) NOT NULL,
            entity_type         VARCHAR(50)  NOT NULL,
            version             VARCHAR(20)  NOT NULL DEFAULT '1.0',
            state_machine_json  TEXT         NOT NULL DEFAULT '{}',
            is_active           VARCHAR(5)   NOT NULL DEFAULT 'true',
            created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
            updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_def_hotel_entity ON workflow_definitions(hotel_id, entity_type)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_def_active ON workflow_definitions(hotel_id, is_active)")

    # ── workflow_instances — ADD hotel_id if missing ─────────────────────────────
    if _table_exists("workflow_instances") and not _col_exists("workflow_instances", "hotel_id"):
        op.execute("ALTER TABLE workflow_instances ADD COLUMN hotel_id VARCHAR(36) DEFAULT 'tb-default-hotel-000000000001'")
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_hotel ON workflow_instances(hotel_id, status)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_active ON workflow_instances(hotel_id, entity_type, status)")
    elif not _table_exists("workflow_instances"):
        op.execute("""
            CREATE TABLE workflow_instances (
                id              VARCHAR(36)  PRIMARY KEY,
                hotel_id        VARCHAR(36)  NOT NULL DEFAULT 'tb-default-hotel-000000000001',
                definition_id   VARCHAR(36)  NOT NULL DEFAULT '',
                entity_type     VARCHAR(50)  NOT NULL DEFAULT '',
                entity_id       VARCHAR(36)  NOT NULL DEFAULT '',
                current_state   VARCHAR(50)  NOT NULL DEFAULT 'open',
                status          VARCHAR(20)  NOT NULL DEFAULT 'active',
                started_by      VARCHAR(100),
                completed_at    TIMESTAMP,
                created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
                updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
            )
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_entity ON workflow_instances(entity_type, entity_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_hotel ON workflow_instances(hotel_id, status)")

    # ── workflow_transitions — ADD hotel_id if missing ──────────────────────────
    if _table_exists("workflow_transitions") and not _col_exists("workflow_transitions", "hotel_id"):
        op.execute("ALTER TABLE workflow_transitions ADD COLUMN hotel_id VARCHAR(36) DEFAULT 'tb-default-hotel-000000000001'")
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_hotel ON workflow_transitions(hotel_id, created_at)")
    elif not _table_exists("workflow_transitions"):
        op.execute("""
            CREATE TABLE workflow_transitions (
                id           VARCHAR(36)  PRIMARY KEY,
                hotel_id     VARCHAR(36)  NOT NULL DEFAULT 'tb-default-hotel-000000000001',
                instance_id  VARCHAR(36)  NOT NULL DEFAULT '',
                entity_type  VARCHAR(50)  NOT NULL DEFAULT '',
                entity_id    VARCHAR(36)  NOT NULL DEFAULT '',
                from_state   VARCHAR(50)  NOT NULL DEFAULT '',
                to_state     VARCHAR(50)  NOT NULL DEFAULT '',
                triggered_by VARCHAR(100),
                notes        TEXT,
                created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
            )
        """)
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_instance ON workflow_transitions(instance_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_entity ON workflow_transitions(entity_type, entity_id)")
        op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_hotel ON workflow_transitions(hotel_id, created_at)")


def downgrade():
    op.execute("DROP TABLE IF EXISTS workflow_definitions")
    # Note: workflow_instances and workflow_transitions pre-existed — do not drop them
    # Only remove the hotel_id columns we added
    try:
        op.execute("ALTER TABLE workflow_instances DROP COLUMN IF EXISTS hotel_id")
        op.execute("ALTER TABLE workflow_transitions DROP COLUMN IF EXISTS hotel_id")
    except Exception:
        pass
