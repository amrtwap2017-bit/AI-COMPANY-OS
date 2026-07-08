from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database import Base

class Quote(Base):
    __tablename__ = 'quotes'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String, default='draft')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    manager_id = Column(Integer, ForeignKey('managers.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))

    manager = relationship('Manager', back_populates='quotes')
    client = relationship('Client', back_populates='quotes')

    approvals = relationship('ApprovalAction', back_populates='quote')