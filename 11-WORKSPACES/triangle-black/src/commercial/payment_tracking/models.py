from datetime import datetime
from datetime import datetime
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from src.core.base import Base

Base = declarative_base()

class Payment(Base):
    __tablename__ = 'payments'
    id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False)
    invoice_id = Column(String(36), nullable=False)
    amount     = Column(Float, nullable=False)
    method     = Column(String(50), nullable=False)
    reference_number = Column(String(100))
    payment_date = Column(DateTime, default=datetime.utcnow)
    notes      = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
