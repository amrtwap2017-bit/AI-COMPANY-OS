"""Add hotel_id to workflow_events (safe minimal migration)

Revision ID: 39458fc24447
Revises: 
Create Date: 2026-09-01

"""
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    # Add hotel_id column to workflow_events — tenant isolation
    conn = op.get_bind()
    result = conn.execute(sa.text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='workflow_events' AND column_name='hotel_id'"
    ))
    if not result.fetchone():
        op.add_column('workflow_events',
            sa.Column('hotel_id', sa.String(100), nullable=True))
        op.create_index('ix_workflow_events_hotel_id', 'workflow_events', ['hotel_id'])
        print("✅ hotel_id added to workflow_events")
    else:
        print("✅ hotel_id already exists in workflow_events")

def downgrade() -> None:
    op.drop_index('ix_workflow_events_hotel_id', table_name='workflow_events')
    op.drop_column('workflow_events', 'hotel_id')
