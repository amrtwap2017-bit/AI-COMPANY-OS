from pydantic import BaseModel

class Workload(BaseModel):
    agent_id: int
    leads_assigned: int
    max_leads: int