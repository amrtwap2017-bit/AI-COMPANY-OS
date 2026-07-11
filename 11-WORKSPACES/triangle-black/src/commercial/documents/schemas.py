from pydantic import BaseModel

class DocumentCreate(BaseModel):
    entity_type: str
    entity_id: str
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_by: str

class DocumentResponse(DocumentCreate):
    id: str
class DocumentUpdate(BaseModel):
    filename: str = None
    file_path: str = None
    file_size: int = None
    mime_type: str = None