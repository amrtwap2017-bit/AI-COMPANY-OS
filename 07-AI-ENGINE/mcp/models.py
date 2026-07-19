from sqlalchemy import String, JSON, Integer, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from hub.db.base import Base

class ToolDefinition(Base):
    __tablename__ = "tool_definitions"

    name: Mapped[str] = mapped_column(String, primary_key=True)
    description: Mapped[str] = mapped_column(String, default="")
    input_schema: Mapped[dict] = mapped_column(JSON, default=dict)
    output_schema: Mapped[dict] = mapped_column(JSON, default=dict)
    required_scopes: Mapped[list] = mapped_column(JSON, default=list)
    rate_limit_per_min: Mapped[int] = mapped_column(Integer, default=60)
    is_enabled: Mapped[bool] = mapped_column(Integer, default=1)

    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ToolCallAudit(Base):
    __tablename__ = "tool_call_audit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run_group: Mapped[str] = mapped_column(String, default="", index=True)

    actor_type: Mapped[str] = mapped_column(String, default="unknown")
    actor_id: Mapped[str] = mapped_column(String, default="unknown")

    tool_name: Mapped[str] = mapped_column(String, index=True)
    ok: Mapped[int] = mapped_column(Integer, default=1)

    args: Mapped[dict] = mapped_column(JSON, default=dict)
    result_meta: Mapped[dict] = mapped_column(JSON, default=dict)
    error: Mapped[str] = mapped_column(String, default="")
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)

    __table_args__ = (
        Index("ix_tool_call_audit_tool_ts", "tool_name", "ts"),
    )
