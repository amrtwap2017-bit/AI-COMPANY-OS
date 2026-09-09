"""fix next_due_date varchar to date type

Revision ID: v9g011_fix_date
Revises: 39458fc24447
Create Date: 2026-09-08

V9-G011: maintenance_plans.next_due_date was character varying(50)
Should be DATE for proper date comparisons.
Data: mix of 'YYYY-MM-DD' and 'YYYY-MM-DD HH:MM:SS+TZ' formats
"""
from alembic import op
import sqlalchemy as sa

revision = 'v9g011_fix_date'
down_revision = '39458fc24447'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cast varchar to date safely
    # Data contains: '2026-07-12' and '2026-07-30 16:02:30.561023+00'
    # Using SPLIT_PART to handle both formats
    op.execute("""
        ALTER TABLE maintenance_plans
        ALTER COLUMN next_due_date TYPE DATE
        USING SPLIT_PART(next_due_date, ' ', 1)::date
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE maintenance_plans
        ALTER COLUMN next_due_date TYPE VARCHAR(50)
        USING next_due_date::text
    """)
