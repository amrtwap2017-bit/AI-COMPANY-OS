"""Add hotel_id to maintenance_plans — A-013 fix

Revision ID: e1f2a3b4c5d6
Revises: b1c2d3e4f5a6
Create Date: 2026-08-26
"""
from alembic import op
import sqlalchemy as sa

revision = 'e1f2a3b4c5d6'
down_revision = 'b1c2d3e4f5a6'
branch_labels = None
depends_on = None


def upgrade():
    # Add hotel_id to maintenance_plans if not exists
    conn = op.get_bind()
    cols = [r[0] for r in conn.execute(sa.text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'maintenance_plans'
    """)).fetchall()]

    if 'hotel_id' not in cols:
        op.add_column('maintenance_plans',
            sa.Column('hotel_id', sa.String(64),
                      server_default='tb-default-hotel-000000000001',
                      nullable=True))
        op.execute(
            "UPDATE maintenance_plans SET hotel_id = 'tb-default-hotel-000000000001' "
            "WHERE hotel_id IS NULL"
        )

    # Add index if not exists
    try:
        op.create_index('ix_maintenance_plans_hotel_id',
                        'maintenance_plans', ['hotel_id'])
    except Exception:
        pass


def downgrade():
    # No-op — safe downgrade
    pass
