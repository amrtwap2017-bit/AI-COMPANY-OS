import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, Float, DateTime, func, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(50))
    company: Mapped[str | None] = mapped_column(String(255))
    source: Mapped[str] = mapped_column(String(50), default="web")  # web|referral|direct|import
    status: Mapped[str] = mapped_column(String(50), default="new", index=True)  # new|qualified|assigned|converted|lost
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # high|medium|low
    score: Mapped[int] = mapped_column(Integer, default=0)
    grade: Mapped[str] = mapped_column(String(20), default="cold")  # qualified|warm|cold
    notes: Mapped[str | None] = mapped_column(Text)
    assigned_agent_id: Mapped[str | None] = mapped_column(String, ForeignKey("agents.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    agent = relationship("Agent", back_populates="leads")
    activities = relationship("LeadActivity", back_populates="lead", order_by="LeadActivity.created_at.desc()")

    __table_args__ = (
        Index("ix_leads_source_status", "source", "status"),
        Index("ix_leads_email_status", "email", "status"),
    )

class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    max_leads: Mapped[int] = mapped_column(Integer, default=20)
    current_leads: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(String, default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    leads = relationship("Lead", back_populates="agent")

class LeadActivity(Base):
    __tablename__ = "lead_activities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id: Mapped[str] = mapped_column(String, ForeignKey("leads.id"), index=True)
    type: Mapped[str] = mapped_column(String(50))  # status_change|note|call|email|assignment|qualification
    description: Mapped[str] = mapped_column(Text)
    actor: Mapped[str] = mapped_column(String(255), default="system")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lead = relationship("Lead", back_populates="activities")
