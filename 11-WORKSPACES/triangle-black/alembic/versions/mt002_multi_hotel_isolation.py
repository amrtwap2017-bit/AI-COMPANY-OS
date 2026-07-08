"""MT-002 Multi-hotel data isolation

Revision ID: mt002_hotels
Revises: a1b2c3d4e5f6
Create Date: 2026-07-08
"""
from __future__ import annotations
from alembic import op
import sqlalchemy as sa

revision: str = "mt002_hotels"
down_revision: str = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None

# Tables that need hotel_id for tenant isolation
TENANT_TABLES = [
    "leads",
    "agents",
    "users",
    "quotes",
    "contracts",
    "activities",
    "invoices",
    "notifications",
    "pipelines",
    "reports",
    "webhookconfigs",
    "lead_searches",
]


def upgrade() -> None:
    # ── 1. Create hotels table ────────────────────────────────────────────────
    op.create_table(
        "hotels",
        sa.Column("id",         sa.String(36),  primary_key=True),
        sa.Column("name",       sa.String(255), nullable=False),
        sa.Column("slug",       sa.String(100), nullable=False, unique=True),
        sa.Column("brand",      sa.String(255), nullable=True),
        sa.Column("city",       sa.String(100), nullable=True),
        sa.Column("country",    sa.String(100), nullable=True, server_default="Egypt"),
        sa.Column("address",    sa.Text,        nullable=True),
        sa.Column("phone",      sa.String(50),  nullable=True),
        sa.Column("email",      sa.String(255), nullable=True),
        sa.Column("rooms",      sa.String(20),  nullable=True),
        sa.Column("stars",      sa.String(5),   nullable=True),
        sa.Column("is_active",  sa.Boolean,     nullable=False, server_default="true"),
        sa.Column("settings",   sa.JSON,        nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime,    nullable=False,
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime,    nullable=False,
                  server_default=sa.func.now()),
    )
    op.create_index("ix_hotels_slug",      "hotels", ["slug"],      unique=True)
    op.create_index("ix_hotels_is_active", "hotels", ["is_active"])

    # ── 2. Insert default hotel (Triangle Black HQ) ───────────────────────────
    op.execute("""
        INSERT INTO hotels (id, name, slug, brand, city, country,
                            is_active, settings, created_at, updated_at)
        VALUES (
            'tb-default-hotel-000000000001',
            'Triangle Black HQ',
            'triangle-black-hq',
            'Triangle Black',
            'Cairo',
            'Egypt',
            true,
            '{}',
            NOW(),
            NOW()
        )
    """)

    # ── 3. Add hotel_id column to all tenant tables ───────────────────────────
    for table in TENANT_TABLES:
        # Add nullable first (existing rows get NULL)
        op.add_column(
            table,
            sa.Column("hotel_id", sa.String(36), nullable=True),
        )
        # Backfill existing rows with default hotel
        op.execute(f"""
            UPDATE {table}
            SET hotel_id = 'tb-default-hotel-000000000001'
            WHERE hotel_id IS NULL
        """)
        # Now make it NOT NULL
        op.alter_column(table, "hotel_id", nullable=False)

        # Add index for fast filtering
        op.create_index(f"ix_{table}_hotel_id", table, ["hotel_id"])

    # ── 4. Users: unique email becomes unique per hotel ───────────────────────
    # Drop the global unique constraint on users.email
    op.drop_constraint("users_email_key", "users", type_="unique")
    # Add composite unique: email unique per hotel
    op.create_unique_constraint(
        "uq_users_hotel_email", "users", ["hotel_id", "email"]
    )

    # ── 5. Agents: same for agents.email ─────────────────────────────────────
    op.drop_constraint("agents_email_key", "agents", type_="unique")
    op.create_unique_constraint(
        "uq_agents_hotel_email", "agents", ["hotel_id", "email"]
    )


def downgrade() -> None:
    # Restore global unique constraints
    op.drop_constraint("uq_users_hotel_email",  "users",  type_="unique")
    op.drop_constraint("uq_agents_hotel_email", "agents", type_="unique")
    op.create_unique_constraint("users_email_key",  "users",  ["email"])
    op.create_unique_constraint("agents_email_key", "agents", ["email"])

    # Remove hotel_id from all tenant tables
    for table in TENANT_TABLES:
        op.drop_index(f"ix_{table}_hotel_id", table_name=table)
        op.drop_column(table, "hotel_id")

    # Drop hotels table
    op.drop_index("ix_hotels_is_active", table_name="hotels")
    op.drop_index("ix_hotels_slug",      table_name="hotels")
    op.drop_table("hotels")
