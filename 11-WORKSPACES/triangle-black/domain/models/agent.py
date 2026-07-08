from pydantic import BaseModel

class AgentBase(BaseModel):
    name: str
    email: str
    max_leads: int
    current_leads: int

class AgentCreate(AgentBase):
    pass

class AgentUpdate(AgentBase):
    pass

class Agent(AgentBase):
    id: int

    class Config:
        orm_mode = True