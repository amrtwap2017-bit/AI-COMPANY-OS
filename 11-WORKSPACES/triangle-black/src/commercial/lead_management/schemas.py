from datetime import datetime
from datetime import datetime
from pydantic import BaseModel

class LeadCreate(BaseModel):
    name: str
    company: str
    phone: str
    email: str
    source: str
    priority: str
    status: str
    agent_id: str

class LeadUpdate(BaseModel):
    name: str = None
    company: str = None
    phone: str = None
    email: str = None
    source: str = None
    priority: str = None
    status: str = None
    agent_id: str = None

class LeadResponse(BaseModel):
    id: str
    hotel_id: str
    name: str
    company: str
    phone: str
    email: str
    source: str
    priority: str
    status: str
    agent_id: str
    created_at: datetime
