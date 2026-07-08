from pydantic import BaseModel

class Lead(BaseModel):
    id: int
    name: str
    email: str
