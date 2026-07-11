from pydantic import BaseModel

class ProjectCreate(BaseModel):
    hotel_id: str
    title: str
    description: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    budget: float
    status: str
    completion_pct: int
    manager_id: str

class ProjectUpdate(BaseModel):
    title: str
    description: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    budget: float
    status: str
    completion_pct: int

class ProjectResponse(BaseModel):
    id: str
    hotel_id: str
    title: str
    description: str
    start_date: datetime.datetime
    end_date: datetime.datetime
    budget: float
    status: str
    completion_pct: int
    manager_id: str