from sqlalchemy.orm import Session
from sqlalchemy import String

from repositories.base import BaseRepository
from models.db.document import Document


class DocumentRepository(BaseRepository[Document]):

    def __init__(self, db: Session):
        super().__init__(Document, db)

    def get_by_source(self, source: str) -> list[Document]:
        return (
            self.db.query(Document)
            .filter(Document.source == source)
            .all()
        )

    def get_by_status(self, status: str) -> list[Document]:
        return (
            self.db.query(Document)
            .filter(Document.status == status)
            .all()
        )

    def get_by_type(self, doc_type: str) -> list[Document]:
        return (
            self.db.query(Document)
            .filter(Document.doc_type == doc_type)
            .all()
        )

    def mark_indexed(self, id: int, chunk_count: int) -> Document:
        doc = self.get(id)
        doc.status = "indexed"
        doc.chunk_count = chunk_count
        return self.update(doc)

    def mark_failed(self, id: int) -> Document:
        doc = self.get(id)
        doc.status = "failed"
        return self.update(doc)
