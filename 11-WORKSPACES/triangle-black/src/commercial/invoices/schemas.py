from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class InvoiceResponse(BaseModel):
    id:             str
    invoice_number: str
    contract_id:    str
    lead_id:        str
    title:          str
    description:    Optional[str] = None
    amount:         float
    tax_amount:     float
    total_amount:   float
    status:         str
    issue_date:     datetime
    due_date:       Optional[datetime] = None
    paid_date:      Optional[datetime] = None
    notes:          Optional[str] = None
    renewal_number: int
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}


class InvoiceUpdate(BaseModel):
    status:    Optional[str] = None
    paid_date: Optional[datetime] = None
    notes:     Optional[str] = None
