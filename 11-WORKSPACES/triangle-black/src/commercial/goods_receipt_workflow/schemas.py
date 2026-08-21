"""
Schemas for Goods Receipt Workflow Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class GoodsReceiptItemIn(BaseModel):
    item_id: str
    quantity_received: float
    unit_price: Optional[float] = None
    notes: Optional[str] = None

class GoodsReceiptRecordIn(BaseModel):
    purchase_order_id: str
    warehouse_id: Optional[str] = None
    received_by: Optional[str] = None
    items: List[GoodsReceiptItemIn] = []

class CycleStatus(BaseModel):
    purchase_request_id: str
    current_stage: str
    is_completed: bool = False
    details: Dict[str, Any] = {}
