from pydantic import BaseModel

class WebhookConfig(BaseModel):
    id: int
    url: str
    events: list
    is_active: bool