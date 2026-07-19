from sqlalchemy import String, JSON, Integer, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from hub.db.base import Base

class BuilderRun(Base):
    __tablename__ = "builder_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run_group: Mapped[str] = mapped_column(String, index=True)  # correlation id

    actor_type: Mapped[str] = mapped_column(String, default="user")
    actor_id: Mapped[str] = mapped_column(String, default="unknown")

    requirement: Mapped[str] = mapped_column(String, default="")
    plan: Mapped[dict] = mapped_column(JSON, default=dict)
    results: Mapped[list] = mapped_column(JSON, default=list)

    ok: Mapped[int] = mapped_column(Integer, default=1)
    error: Mapped[str] = mapped_column(String, default="")
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        Index("ix_builder_runs_actor_ts", "actor_id", "ts"),
    )
