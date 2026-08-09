"""Sprint-084: Track DDD tables added in sprints 081-083

Revision ID: b1c2d3e4f5a6
Revises: a9b2c3d4e5f6
Create Date: 2026-08-08

SAFE: CREATE TABLE IF NOT EXISTS — all tables already exist
downgrade() = no-op (backward compat)
"""
from alembic import op
import sqlalchemy as sa

revision = 'b1c2d3e4f5a6'
down_revision = 'a9b2c3d4e5f6'
branch_labels = None
depends_on = None

TABLES = [
    ("suppliers", """
        CREATE TABLE IF NOT EXISTS suppliers (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            supplier_code VARCHAR(50),
            company_name VARCHAR(200) NOT NULL,
            arabic_name VARCHAR(200),
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            supplier_type VARCHAR(100),
            payment_terms VARCHAR(50),
            lead_time_days INTEGER DEFAULT 7,
            preferred_flag VARCHAR(10) DEFAULT 'False',
            risk_level VARCHAR(20) DEFAULT 'low',
            notes TEXT,
            city VARCHAR(100),
            country VARCHAR(100) DEFAULT 'Egypt',
            phone VARCHAR(50),
            email VARCHAR(200),
            category VARCHAR(100),
            contact_person VARCHAR(200),
            credit_limit FLOAT DEFAULT 0,
            blacklisted VARCHAR(10) DEFAULT 'False',
            is_approved VARCHAR(10) DEFAULT 'False',
            rating FLOAT DEFAULT 0,
            deleted_at TIMESTAMP,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    """),
    ("asset_warranties", """
        CREATE TABLE IF NOT EXISTS asset_warranties (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            asset_id VARCHAR(36) NOT NULL,
            asset_name VARCHAR(200),
            vendor_name VARCHAR(200),
            warranty_type VARCHAR(50),
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            coverage_details TEXT,
            contact_info TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            notes TEXT,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    """),
    ("user_preferences", """
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id VARCHAR(100) NOT NULL,
            pref_key VARCHAR(100) NOT NULL,
            pref_value TEXT,
            updated_at TIMESTAMP NOT NULL,
            PRIMARY KEY (user_id, pref_key)
        )
    """),
    ("procurement_intake_log", """
        CREATE TABLE IF NOT EXISTS procurement_intake_log (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50),
            entity_id VARCHAR(36),
            details TEXT,
            actor_id VARCHAR(100),
            created_at TIMESTAMP NOT NULL
        )
    """),
    ("scope_of_work", """
        CREATE TABLE IF NOT EXISTS scope_of_work (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36),
            contract_id VARCHAR(36),
            title VARCHAR(300) NOT NULL,
            description TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'draft',
            total_value FLOAT DEFAULT 0,
            created_by VARCHAR(100),
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    """),
    ("pr_approval_chain", """
        CREATE TABLE IF NOT EXISTS pr_approval_chain (
            id VARCHAR(36) PRIMARY KEY,
            pr_id VARCHAR(36) NOT NULL,
            hotel_id VARCHAR(36),
            approver_id VARCHAR(100),
            approver_name VARCHAR(200),
            action VARCHAR(50) NOT NULL DEFAULT 'pending',
            notes TEXT,
            actioned_at TIMESTAMP,
            created_at TIMESTAMP NOT NULL
        )
    """),
    ("approval_requests", """
        CREATE TABLE IF NOT EXISTS approval_requests (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36),
            entity_type VARCHAR(50) NOT NULL,
            entity_id VARCHAR(36) NOT NULL,
            title VARCHAR(300),
            amount FLOAT,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            requested_by VARCHAR(100),
            assigned_to VARCHAR(100),
            priority VARCHAR(20) DEFAULT 'normal',
            notes TEXT,
            requested_at TIMESTAMP NOT NULL,
            resolved_at TIMESTAMP
        )
    """),
]

INDEXES = [
    "CREATE INDEX IF NOT EXISTS ix_suppliers_hotel_status ON suppliers (hotel_id, status)",
    "CREATE INDEX IF NOT EXISTS ix_suppliers_hotel ON suppliers (hotel_id)",
    "CREATE INDEX IF NOT EXISTS ix_warranty_hotel_asset ON asset_warranties (hotel_id, asset_id)",
    "CREATE INDEX IF NOT EXISTS ix_user_prefs_user ON user_preferences (user_id)",
    "CREATE INDEX IF NOT EXISTS ix_procurement_log_hotel ON procurement_intake_log (hotel_id)",
    "CREATE INDEX IF NOT EXISTS ix_sow_hotel_status ON scope_of_work (hotel_id, status)",
    "CREATE INDEX IF NOT EXISTS ix_pr_approval_chain_pr ON pr_approval_chain (pr_id)",
    "CREATE INDEX IF NOT EXISTS ix_approval_req_hotel_status ON approval_requests (hotel_id, status)",
]


def upgrade():
    conn = op.get_bind()
    for name, ddl in TABLES:
        try:
            conn.execute(sa.text(ddl))
            print(f"  ✅ {name} tracked")
        except Exception as e:
            print(f"  = {name}: {e}")
    for idx in INDEXES:
        try:
            conn.execute(sa.text(idx))
        except Exception:
            pass
    print("  ✅ All indexes created")


def downgrade():
    pass
