"""user_preferences/models.py — Sprint-082"""
from sqlalchemy import Column, String, Text, DateTime, Index
from datetime import datetime, timezone
from src.core.base import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"
    user_id = Column(String(100), primary_key=True)
    pref_key = Column(String(100), primary_key=True)
    pref_value = Column(Text, nullable=True)
    updated_at = Column(DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    __table_args__ = (
        Index("ix_user_prefs_user", "user_id"),
        {"extend_existing": True},
    )
