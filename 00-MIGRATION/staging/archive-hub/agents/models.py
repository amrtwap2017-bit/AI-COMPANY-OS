from sqlalchemy import String, JSON, Integer, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from hub.db.base import Base

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run_group: Mapped[str] = mapped_column(String, default="", index=True)

    actor_type: Mapped[str] = mapped_column(String, default="user")
    actor_id: Mapped[str] = mapped_column(String, default="unknown")

    intent: Mapped[str] = mapped_column(String, default="general")
    user_request: Mapped[str] = mapped_column(String, default="")

    plan: Mapped[dict] = mapped_column(JSON, default=dict)
    tool_calls: Mapped[list] = mapped_column(JSON, default=list)
    output: Mapped[dict] = mapped_column(JSON, default=dict)

    ok: Mapped[int] = mapped_column(Integer, default=1)
    error: Mapped[str] = mapped_column(String, default="")
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        Index("ix_agent_runs_group_ts", "run_group", "ts"),
        Index("ix_agent_runs_actor_ts", "actor_id", "ts"),
    )
