"""
Schemas for Warehouse Intelligence Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class StockHealthMetric(BaseModel):
    total_sku_count: int
    below_min_count: int
    overstocked_count: int
    out_of_stock_count: int
    total_valuation: float = 0.0

class ReorderRecommendation(BaseModel):
    item_id: str
    item_name: str
    category: str
    qty_on_hand: float
    min_stock: float
    recommended_order_qty: float
    preferred_vendor: Optional[str] = None
    estimated_cost: float = 0.0

class WarehouseIntelligenceOverview(BaseModel):
    hotel_id: str
    health: StockHealthMetric
    reorder_plan: List[ReorderRecommendation] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)
