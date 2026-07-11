from sqlalchemy.orm import Session
from src.core.database import get_db
from src.commercial.documents.models import Document

class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_document(self, document_data: dict):
        document = Document(**document_data)
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_documents_by_entity(self, entity_type: str, entity_id: str):
        documents = self.db.query(Document).filter(
            Document.entity_type == entity_type,
            Document.entity_id == entity_id
        ).all()
        return documents

    def get_document_by_id(self, document_id: str):
        document = self.db.query(Document).filter(
            Document.id == document_id
        ).first()
        return document

    def delete_document(self, document_id: str):
        document = self.db.query(Document).filter(
            Document.id == document_id
        ).first()
        if document:
            self.db.delete(document)
            self.db.commit()