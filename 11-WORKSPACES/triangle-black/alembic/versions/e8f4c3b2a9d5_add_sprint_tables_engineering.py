"""add sprint tables: engineering + inspections + client portal

Revision ID: e8f4c3b2a9d5
Revises: d7e9f3a2b8c1
Create Date: 2026-08-06T04:14:11.984869

"""
from alembic import op
import sqlalchemy as sa

revision = 'e8f4c3b2a9d5'
down_revision = 'd7e9f3a2b8c1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Engineering inspections
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS engineering_inspections (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'open',
            discipline VARCHAR(100),
            category VARCHAR(100),
            inspection_date VARCHAR(50),
            result VARCHAR(100),
            site_id VARCHAR(36),
            asset_id VARCHAR(36),
            contract_id VARCHAR(36),
            project_id VARCHAR(36),
            owner VARCHAR(255),
            notes TEXT,
            tags TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))

    # Engineering site visits
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS engineering_site_visits (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255),
            visit_purpose VARCHAR(255),
            location VARCHAR(255),
            visitor VARCHAR(255),
            visit_date VARCHAR(50),
            status VARCHAR(50),
            notes TEXT,
            site_id VARCHAR(36),
            project_id VARCHAR(36),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))

    # Engineering quality records
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS engineering_quality_records (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255),
            record_type VARCHAR(100),
            status VARCHAR(50),
            result VARCHAR(100),
            inspector VARCHAR(255),
            inspection_date VARCHAR(50),
            notes TEXT,
            project_id VARCHAR(36),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))

    # Engineering safety records
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS engineering_safety_records (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255),
            severity VARCHAR(50),
            status VARCHAR(50),
            reported_by VARCHAR(255),
            location VARCHAR(255),
            incident_date VARCHAR(50),
            notes TEXT,
            project_id VARCHAR(36),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))

    # Engineering punch list
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS engineering_punch_list_items (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255),
            description TEXT,
            status VARCHAR(50),
            priority VARCHAR(50),
            assigned_to VARCHAR(255),
            due_date VARCHAR(50),
            location VARCHAR(255),
            notes TEXT,
            project_id VARCHAR(36),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))

    # Suppliers hotel_id (added in Sprint-041)
    try:
        conn.execute(sa.text("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS hotel_id VARCHAR(36) DEFAULT 'tb-default-hotel-000000000001'"))
        conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_suppliers_hotel_id ON suppliers(hotel_id)"))
    except Exception:
        pass

    # Hotels hotel_id (added in Sprint-037)
    try:
        conn.execute(sa.text("ALTER TABLE hotels ADD COLUMN IF NOT EXISTS hotel_id VARCHAR(36)"))
        conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_hotels_hotel_id ON hotels(hotel_id)"))
    except Exception:
        pass


def downgrade() -> None:
    pass  # NEVER DROP — backward compatibility
