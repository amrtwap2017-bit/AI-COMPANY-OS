from pydantic import BaseModel

class EmailSendRequest(BaseModel):
    to_email: str
    subject: str
template_name: str
context: dict = None
