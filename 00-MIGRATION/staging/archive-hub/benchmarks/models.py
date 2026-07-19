from sqlalchemy import String, JSON, Integer, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from hub.db.base import Base

class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ts: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())

    run_group: Mapped[str] = mapped_column(String, index=True)

    benchmark_id: Mapped[str] = mapped_column(String, index=True)
    agent_name: Mapped[str] = mapped_column(String, index=True)

    ok: Mapped[int] = mapped_column(Integer, default=1)
    is_regression: Mapped[int] = mapped_column(Integer, default=0)

    aicos_run_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    raw: Mapped[dict] = mapped_column(JSON, default=dict)

    __table_args__ = (
        Index("ix_benchmark_runs_group_ts", "run_group", "ts"),
    )
