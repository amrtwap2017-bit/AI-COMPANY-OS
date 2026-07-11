from pydantic import BaseModel

class WorkOrderCreate(BaseModel):
    hotel_id: str
    title: str
    description: str
    priority: str
    technician_id: str
    due_date: str
    status: str

class WorkOrderUpdate(BaseModel):
    title: str
    description: str
    priority: str
    technician_id: str
    due_date: str
    status: str

class WorkOrderResponse(BaseModel):
    id: int
    hotel_id: str
    title: str
    description: str
    priority: str
    technician_id: str
    due_date: str
    status: str
    created_at: datetime
    updated_at: datetime