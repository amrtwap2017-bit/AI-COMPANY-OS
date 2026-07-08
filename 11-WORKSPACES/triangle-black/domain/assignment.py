from pydantic import BaseModel

class Assignment(BaseModel):
    agent_id: int
    lead_id: int