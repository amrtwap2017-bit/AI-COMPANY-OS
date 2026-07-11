from sqlalchemy import Column, Integer, String, Float
from src.core.base import Base

class InventoryAlert(Base):
    __tablename__ = 'inventory_alerts'
    id = Column(Integer, primary_key=True)
    item_id = Column(String(36), nullable=False)
    warehouse_id = Column(String(36), nullable=False)
    min_stock_level = Column(Float, nullable=False)
    current_stock = Column(Float, nullable=False)
    acknowledged = Column(Boolean, default=False)