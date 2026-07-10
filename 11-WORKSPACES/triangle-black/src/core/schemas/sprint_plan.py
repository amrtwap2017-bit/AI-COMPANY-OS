from pydantic import BaseModel

class SprintPlanCreate(BaseModel):
    workspace_id: str
    epic: str
    context: str