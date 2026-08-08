"""Sprint-079: Track platform_audit_log + platform_notifications in Alembic

Revision ID: a9b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-08-08

SAFE: CREATE TABLE IF NOT EXISTS — tables already exist in DB
downgrade() = no-op (backward compat)
"""
from alembic import op
import sqlalchemy as sa

revision = 'a9b2c3d4e5f6'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS platform_audit_log (
            id            VARCHAR(36) PRIMARY KEY,
            entity_type   VARCHAR(50) NOT NULL,
            entity_id     VARCHAR(36),
            action        VARCHAR(100) NOT NULL,
            actor_id      VARCHAR(100),
            actor_name    VARCHAR(200),
            old_value     TEXT,
            new_value     TEXT,
            ip_address    VARCHAR(45),
            hotel_id      VARCHAR(36),
            metadata      TEXT,
            created_at    TIMESTAMP NOT NULL
        )
    """))

    conn.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS ix_audit_log_hotel_entity
        ON platform_audit_log (hotel_id, entity_type)
    """))

    conn.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS ix_audit_log_created
        ON platform_audit_log (created_at)
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS platform_notifications (
            id          VARCHAR(36) PRIMARY KEY,
            hotel_id    VARCHAR(36),
            user_id     VARCHAR(36),
            type        VARCHAR(50) NOT NULL,
            title       VARCHAR(200) NOT NULL,
            message     TEXT,
            priority    VARCHAR(20) DEFAULT 'medium',
            is_read     BOOLEAN DEFAULT FALSE,
            entity_type VARCHAR(50),
            entity_id   VARCHAR(36),
            action_url  TEXT,
            created_at  TIMESTAMP NOT NULL
        )
    """))

    conn.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS ix_platform_notif_hotel_user
        ON platform_notifications (hotel_id, user_id)
    """))

    conn.execute(sa.text("""
        CREATE INDEX IF NOT EXISTS ix_platform_notif_read
        ON platform_notifications (is_read)
    """))

    print("  ✅ platform_audit_log tracked")
    print("  ✅ platform_notifications tracked")


def downgrade():
    # No-op: tables were created inline by router — preserve data
    pass
