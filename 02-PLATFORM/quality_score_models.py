"""QualityScore ORM Model — records quality gate results per run_group."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Boolean, Numeric, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from ..01_INFRASTRUCTURE.database.session import Base

def _utcnow(): return datetime.now(timezone.utc)

class QualityScoreModel(Base):
    __tablename__ = "quality_scores"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_group: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    architecture_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    security_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    performance_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    test_coverage_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    code_smells_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    doc_completeness_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    hallucination_index: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    overall_score: Mapped[Decimal] = mapped_column(Numeric(5,2), default=0)
    passed_gate: Mapped[bool] = mapped_column(Boolean, default=False)
    feedback_details: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
