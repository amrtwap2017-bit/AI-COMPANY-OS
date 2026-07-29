from datetime import datetime
from datetime import datetime
from pydantic import BaseModel

class InvoiceCreate(BaseModel):
    hotel_id: str
    invoice_number: str
    total_amount: float
    status: str
    due_date: datetime

class InvoiceUpdate(BaseModel):
    invoice_number: str = None
    total_amount: float = None
    status: str = None
    due_date: datetime = None

class InvoiceResponse(BaseModel):
    id: str
    hotel_id: str
    invoice_number: str
    total_amount: float
    status: str
    due_date: datetime
    paid_date: datetime = None
    created_at: datetime

    class Config:
        from_attributes = True
