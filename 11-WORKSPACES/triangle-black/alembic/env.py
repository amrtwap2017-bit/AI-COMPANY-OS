from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Load Alembic config ───────────────────────────────────────────────────────
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import Base + ALL models (order matters) ─────────────────────────────────
from src.core.base import Base

from src.commercial.lead_management     import models as _lead_models
from src.commercial.agent_management    import models as _agent_models
from src.commercial.pipeline_dashboard  import models as _pipeline_models
from src.commercial.activity_tracking   import models as _activity_models
from src.commercial.search_filters      import models as _search_models
from src.commercial.webhook_notifications import models as _webhook_models
from src.commercial.quotation           import models as _quotation_models
from src.commercial.auth                import models as _auth_models
from src.commercial.reporting           import models as _reporting_models
from src.commercial.contracts           import models as _contract_models

# All models are now registered on Base.metadata
target_metadata = Base.metadata

# ── Run migrations ────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
