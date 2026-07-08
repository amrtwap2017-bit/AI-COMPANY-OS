from pydantic import BaseModel

class Activity(BaseModel):
    id: int
    name: str
    created_at: datetime