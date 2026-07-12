from datetime import datetime
from datetime import datetime
from datetime import datetime
from pydantic import BaseModel

class PaymentCreate(BaseModel):
    hotel_id: str
    invoice_id: str
    amount: float
    method: str
    reference_number: str = None
    notes: str = None

class PaymentUpdate(BaseModel):
    amount: float = None
    method: str = None
    reference_number: str = None
    notes: str = None

class PaymentResponse(PaymentCreate):
    id: str
    payment_date: datetime
