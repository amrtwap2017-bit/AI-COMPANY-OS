from datetime import datetime
from pydantic import BaseModel, Field

class QuoteCreate(BaseModel):
    title: str = Field(...)
    description: str = None

class QuoteUpdate(BaseModel):
    title: str = None
    description: str = None

class QuoteResponse(QuoteCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    manager_id: int
    client_id: int

    class Config:
        from_attributes = True