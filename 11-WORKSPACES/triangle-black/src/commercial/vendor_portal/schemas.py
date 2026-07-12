from datetime import datetime
from datetime import datetime
from pydantic import BaseModel

class RFQCreate(BaseModel):
    description: str

class RFQUpdate(BaseModel):
    description: str

class RFQResponse(BaseModel):
    id: str
    hotel_id: str
    vendor_id: str
    description: str
    created_at: datetime

class PurchaseOrderCreate(BaseModel):
    rfq_id: str
    amount: float
    delivery_date: datetime

class PurchaseOrderUpdate(BaseModel):
    amount: float
    delivery_date: datetime

class PurchaseOrderResponse(BaseModel):
    id: str
    hotel_id: str
    vendor_id: str
    rfq_id: str
    amount: float
    delivery_date: datetime
    created_at: datetime
