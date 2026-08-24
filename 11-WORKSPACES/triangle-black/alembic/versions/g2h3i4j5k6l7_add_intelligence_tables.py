"""add intelligence platform tables

Revision ID: g2h3i4j5k6l7
Revises: b2c3d4e5f6a7
Create Date: 2026-08-24

"""
from alembic import op
import sqlalchemy as sa

revision = 'g2h3i4j5k6l7'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade():
    # customer_feedback
    op.execute("""
        CREATE TABLE IF NOT EXISTS customer_feedback (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            user_email VARCHAR(255),
            category VARCHAR(50) NOT NULL DEFAULT 'ux',
            severity VARCHAR(50) NOT NULL DEFAULT 'medium',
            priority VARCHAR(10) NOT NULL DEFAULT 'P2',
            message TEXT NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'open',
            triage_notes TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_customer_feedback_hotel_id
        ON customer_feedback (hotel_id)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_customer_feedback_status
        ON customer_feedback (hotel_id, status)
    """)

    # webhook_subscriptions
    op.execute("""
        CREATE TABLE IF NOT EXISTS webhook_subscriptions (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            target_url VARCHAR(500) NOT NULL,
            event_types TEXT NOT NULL,
            secret_key VARCHAR(100) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_webhook_subscriptions_hotel
        ON webhook_subscriptions (hotel_id)
    """)

    # sso_configurations
    op.execute("""
        CREATE TABLE IF NOT EXISTS sso_configurations (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL UNIQUE,
            idp_type VARCHAR(50) NOT NULL DEFAULT 'oidc',
            idp_issuer VARCHAR(500) NOT NULL,
            sso_url VARCHAR(500) NOT NULL,
            cert_or_secret TEXT,
            is_enabled BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_sso_configurations_hotel
        ON sso_configurations (hotel_id)
    """)


def downgrade():
    # No-op — safe downgrade
    pass
