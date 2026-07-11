import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from src.core.base import Base

class EmailLog(Base):
    __tablename__ = "email_logs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False)
    to_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    template_name = Column(String(100), nullable=False)
    context = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)