from sqlalchemy import String, JSON, Integer, DateTime, func, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from hub.db.base import Base

class ModelRoute(Base):
    __tablename__ = "model_routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workspace_id: Mapped[str] = mapped_column(String, default="default", index=True)
    task_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    model_id: Mapped[str] = mapped_column(String, nullable=False)
    provider: Mapped[str] = mapped_column(String, nullable=False)
    endpoint: Mapped[str] = mapped_column(String, default="")
    context_window: Mapped[int] = mapped_column(Integer, default=128000)
    local_only: Mapped[int] = mapped_column(Integer, default=0)
    priority: Mapped[int] = mapped_column(Integer, default=10)
    config: Mapped[dict] = mapped_column(JSON, default=dict)
    is_enabled: Mapped[int] = mapped_column(Integer, default=1)

    __table_args__ = (Index("ix_model_routes_ws_type", "workspace_id", "task_type"),)

class ModelCallLog(Base):
    __tablename__ = "model_call_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    workspace_id: Mapped[str] = mapped_column(String, index=True)
    run_group: Mapped[str] = mapped_column(String, default="", index=True)
    task_type: Mapped[str] = mapped_column(String)
    model_id: Mapped[str] = mapped_column(String)
    provider: Mapped[str] = mapped_column(String)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    ok: Mapped[int] = mapped_column(Integer, default=1)
    error: Mapped[str] = mapped_column(String, default="")
