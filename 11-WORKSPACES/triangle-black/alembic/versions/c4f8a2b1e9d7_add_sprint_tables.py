"""add sprint tables: employees gl eta timesheets

Revision ID: c4f8a2b1e9d7
Revises: 679ac109b765
Create Date: 2026-08-04T07:57:56.258783

"""
from alembic import op
import sqlalchemy as sa

revision = 'c4f8a2b1e9d7'
down_revision = '679ac109b765'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Safe migration: tables already exist in production DB.
    Using CREATE TABLE IF NOT EXISTS via execute() for idempotency.
    This migration is purely for Alembic tracking — no data loss risk.
    """
    conn = op.get_bind()

    # employees table
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS employees (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            name VARCHAR(200) NOT NULL,
            email VARCHAR(200),
            phone VARCHAR(50),
            department VARCHAR(100),
            position VARCHAR(100),
            employee_id VARCHAR(50),
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            hire_date TIMESTAMP,
            notes TEXT,
            salary FLOAT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_employees_hotel_id ON employees(hotel_id)"))

    # journal_entries (financial_gl)
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            entry_date DATE NOT NULL,
            description VARCHAR(500) NOT NULL,
            debit_account VARCHAR(100),
            credit_account VARCHAR(100),
            amount NUMERIC(15,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'EGP',
            reference VARCHAR(100),
            status VARCHAR(20) DEFAULT 'posted',
            created_by VARCHAR(36),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_journal_entries_hotel_id ON journal_entries(hotel_id)"))

    # eta_invoices
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS eta_invoices (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            invoice_number VARCHAR(100),
            submission_uuid VARCHAR(200),
            status VARCHAR(50) DEFAULT 'pending',
            payload JSONB,
            response JSONB,
            submitted_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_eta_invoices_hotel_id ON eta_invoices(hotel_id)"))

    # employee_timesheets
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS employee_timesheets (
            id VARCHAR(36) PRIMARY KEY,
            hotel_id VARCHAR(36) NOT NULL,
            employee_id VARCHAR(36) NOT NULL,
            work_date DATE NOT NULL,
            work_type VARCHAR(50) NOT NULL DEFAULT 'regular',
            hours_worked NUMERIC(5,2) NOT NULL,
            overtime_hours NUMERIC(5,2) DEFAULT 0,
            notes TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            approved_by VARCHAR(36),
            approved_at TIMESTAMP,
            rejection_reason TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_emp_ts_hotel ON employee_timesheets(hotel_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_emp_ts_employee ON employee_timesheets(employee_id)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_emp_ts_date ON employee_timesheets(work_date)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_emp_ts_status ON employee_timesheets(status)"))


def downgrade() -> None:
    """
    Downgrade: do NOT drop tables — data preservation rule.
    Mark as no-op to protect production data.
    """
    pass  # NEVER DROP — backward compatibility rule
