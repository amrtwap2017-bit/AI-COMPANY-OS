from src.core.auth import require_agent, require_manager

from src.commercial.auth.models import User

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.tenant import get_hotel_id
from src.commercial.documents.models import Document
from src.commercial.documents.schemas import DocumentCreate, DocumentResponse, DocumentUpdate
from src.commercial.documents.repository import DocumentRepository

router = APIRouter()

document_repo = DocumentRepository(get_db())

@router.post('/documents/upload', response_model=DocumentResponse, status_code=201)
def create_document(
    payload: DocumentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    document_data = {
        **payload.dict(),
        'hotel_id': hotel_id
    }
    document = document_repo.create_document(document_data)
    return DocumentResponse.from_orm(document)

@router.get('/documents', response_model=list[DocumentResponse])
def get_documents_by_entity(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    documents = document_repo.get_documents_by_entity(entity_type, entity_id)
    return [DocumentResponse.from_orm(doc) for doc in documents]

@router.get('/documents/{document_id}/download', status_code=200)
def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    document = document_repo.get_document_by_id(document_id)
    if not document:
        raise HTTPException(status_code=404, detail='Document not found')
    return FileResponse(document.file_path)

@router.delete('/documents/{document_id}', status_code=204)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_agent),
    hotel_id: str = Depends(get_hotel_id)
):
    document_repo.delete_document(document_id)
