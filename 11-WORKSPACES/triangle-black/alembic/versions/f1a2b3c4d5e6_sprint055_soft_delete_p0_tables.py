"""Sprint-055: Add deleted_at soft delete to P0 tables

Revision ID: f1a2b3c4d5e6
Revises: e8f4c3b2a9d5
Create Date: 2026-08-06

RULE: Additive only. is_active preserved. deleted_at added alongside.
"""

from alembic import op
import sqlalchemy as sa

revision = 'f1a2b3c4d5e6'
down_revision = 'e8f4c3b2a9d5'
branch_labels = None
depends_on = None

P0_TABLES = [
    'invoices',
    'contracts',
    'work_orders',
    'leads',
    'lead_searches',
    'quotes',
]

def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    for table in P0_TABLES:
        try:
            existing = [c['name'] for c in inspector.get_columns(table)]
            if 'deleted_at' not in existing:
                op.add_column(
                    table,
                    sa.Column(
                        'deleted_at',
                        sa.DateTime(timezone=True),
                        nullable=True,
                        comment='Soft delete timestamp. NULL = active record.'
                    )
                )
                # partial index: only index non-deleted rows for performance
                op.create_index(
                    f'ix_{table}_deleted_at',
                    table,
                    ['deleted_at'],
                    postgresql_where=sa.text('deleted_at IS NULL')
                )
                print(f'  + Added deleted_at to {table}')
            else:
                print(f'  = {table} already has deleted_at — skipped')
        except Exception as e:
            print(f'  ! {table}: {e}')

def downgrade():
    # Safe downgrade: remove deleted_at only (is_active preserved)
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    for table in P0_TABLES:
        try:
            existing = [c['name'] for c in inspector.get_columns(table)]
            if 'deleted_at' in existing:
                op.drop_index(f'ix_{table}_deleted_at', table_name=table)
                op.drop_column(table, 'deleted_at')
                print(f'  - Removed deleted_at from {table}')
        except Exception as e:
            print(f'  ! {table}: {e}')
