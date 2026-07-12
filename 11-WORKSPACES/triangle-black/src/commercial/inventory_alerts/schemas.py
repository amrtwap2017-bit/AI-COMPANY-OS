from pydantic import BaseModel

class InventoryAlertCreate(BaseModel):
    item_id: str
    warehouse_id: str
    min_stock_level: float
    current_stock: float

class InventoryAlertUpdate(BaseModel):
    acknowledged: bool

class InventoryAlertResponse(InventoryAlertCreate):
    id: int
