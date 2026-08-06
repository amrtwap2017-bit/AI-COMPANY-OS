from datetime import datetime
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from src.core.base import Base, SoftDeleteMixin

class Invoice(SoftDeleteMixin, Base):
    __tablename__ = "invoices"
    id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id   = Column(String(36), nullable=False)
    invoice_number = Column(String(50), nullable=False)
    total_amount = Column(Float, nullable=False)
    status       = Column(String(20), nullable=False)
    due_date     = Column(DateTime, nullable=False)
    paid_date    = Column(DateTime, nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)
