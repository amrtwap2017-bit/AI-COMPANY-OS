"""Sprint-230: workflow engine tables

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-08-16

Creates:
  workflow_definitions  — state machine definitions per entity type + hotel
  workflow_instances    — running workflow state per entity
  workflow_transitions  — immutable state change log
"""
from alembic import op
import sqlalchemy as sa

revision = 'c2d3e4f5a6b7'
down_revision = 'b1c2d3e4f5a6'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE TABLE IF NOT EXISTS workflow_definitions (
            id                  VARCHAR(36)  PRIMARY KEY,
            hotel_id            VARCHAR(36)  NOT NULL,
            name                VARCHAR(200) NOT NULL,
            entity_type         VARCHAR(50)  NOT NULL,
            version             VARCHAR(20)  NOT NULL DEFAULT '1.0',
            state_machine_json  TEXT         NOT NULL,
            is_active           VARCHAR(5)   NOT NULL DEFAULT 'true',
            created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
            updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_def_hotel_entity ON workflow_definitions(hotel_id, entity_type)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_def_active ON workflow_definitions(hotel_id, is_active)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS workflow_instances (
            id              VARCHAR(36)  PRIMARY KEY,
            hotel_id        VARCHAR(36)  NOT NULL,
            definition_id   VARCHAR(36)  NOT NULL,
            entity_type     VARCHAR(50)  NOT NULL,
            entity_id       VARCHAR(36)  NOT NULL,
            current_state   VARCHAR(50)  NOT NULL,
            status          VARCHAR(20)  NOT NULL DEFAULT 'active',
            started_by      VARCHAR(100),
            completed_at    TIMESTAMP,
            created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
            updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_entity ON workflow_instances(entity_type, entity_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_hotel ON workflow_instances(hotel_id, status)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_inst_active ON workflow_instances(hotel_id, entity_type, status)")

    op.execute("""
        CREATE TABLE IF NOT EXISTS workflow_transitions (
            id           VARCHAR(36)  PRIMARY KEY,
            hotel_id     VARCHAR(36)  NOT NULL,
            instance_id  VARCHAR(36)  NOT NULL,
            entity_type  VARCHAR(50)  NOT NULL,
            entity_id    VARCHAR(36)  NOT NULL,
            from_state   VARCHAR(50)  NOT NULL,
            to_state     VARCHAR(50)  NOT NULL,
            triggered_by VARCHAR(100),
            notes        TEXT,
            created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_instance ON workflow_transitions(instance_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_entity ON workflow_transitions(entity_type, entity_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_wf_trans_hotel ON workflow_transitions(hotel_id, created_at)")


def downgrade():
    op.execute("DROP TABLE IF EXISTS workflow_transitions")
    op.execute("DROP TABLE IF EXISTS workflow_instances")
    op.execute("DROP TABLE IF EXISTS workflow_definitions")
