"""add chart_of_accounts table

Revision ID: d7e9f3a2b8c1
Revises: c4f8a2b1e9d7
Create Date: 2026-08-04T08:43:13.882572

"""
from alembic import op
import sqlalchemy as sa

revision = 'd7e9f3a2b8c1'
down_revision = 'c4f8a2b1e9d7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
            id                  VARCHAR(36)  PRIMARY KEY,
            hotel_id            VARCHAR(36)  NOT NULL,
            account_code        VARCHAR(20)  NOT NULL,
            account_name        VARCHAR(200) NOT NULL,
            account_type        VARCHAR(50)  NOT NULL,
            parent_account_code VARCHAR(20),
            description         TEXT,
            is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
            created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
            updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_coa_hotel ON chart_of_accounts(hotel_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_coa_code  ON chart_of_accounts(account_code)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_coa_type  ON chart_of_accounts(account_type)"))


def downgrade() -> None:
    pass  # NEVER DROP — backward compatibility rule
