import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from src.core.base import Base

class RFQ(Base):
    __tablename__ = 'rfqs'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False)
    vendor_id = Column(String(36), nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PurchaseOrder(Base):
    __tablename__ = 'purchase_orders'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hotel_id = Column(String(36), nullable=False)
    vendor_id = Column(String(36), nullable=False)
    rfq_id = Column(String(36), nullable=False)
    amount = Column(Float, nullable=False)
    delivery_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)