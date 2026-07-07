"""
Alembic Migration Environment
==============================
Configures Alembic to use async SQLAlchemy with our platform Base.

Run migrations:
    cd ~/AI-COMPANY-OS
    source .venv/bin/activate
    alembic -c 01-INFRASTRUCTURE/database/alembic.ini upgrade head

Create new migration:
    alembic -c 01-INFRASTRUCTURE/database/alembic.ini \
      revision --autogenerate -m "description"
"""

from __future__ import annotations

import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

# Add project root to path so imports resolve
sys.path.insert(0, str(Path(__file__).parents[3]))

from _01_INFRASTRUCTURE.database.session import Base  # noqa: E402

# Import ALL models so Alembic can detect them for autogenerate
# Add new model imports here as subsystems are built
import importlib

_model_modules = [
    "02-PLATFORM.workspace_models",
    "02-PLATFORM.project_models",
    "02-PLATFORM.task_models",
]

for mod in _model_modules:
    try:
        importlib.import_module(mod.replace("-", "_"))
    except ModuleNotFoundError:
        pass  # Model not yet created — skip during early waves

config = context.config
target_metadata = Base.metadata

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def get_url() -> str:
    url = os.environ.get("DATABASE_URL", "")
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    url = get_url()
    connectable = create_async_engine(url, poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
