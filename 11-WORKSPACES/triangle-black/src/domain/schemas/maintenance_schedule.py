from pydantic import BaseModel

class MaintenanceScheduleCreate(BaseModel):
    asset_id: int
    hotel_id: int
    frequency: str
    last_done: str

class MaintenanceScheduleUpdate(BaseModel):
    frequency: str
    last_done: str

class MaintenanceScheduleResponse(BaseModel):
    id: int
    asset_id: int
    hotel_id: int
    frequency: str
    last_due: str
