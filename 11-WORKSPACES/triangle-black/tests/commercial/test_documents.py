import uuid
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.database import get_db, Base, engine
from src.commercial.documents.models import Document

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_document_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    document_data = {
        'entity_type': 'contract',
        'entity_id': f'TEST-CONTRACT-{unique}',
        'filename': f'test_document_{unique}.pdf',
        'file_path': f'/path/to/test/document_{unique}.pdf',
        'file_size': 12345,
        'mime_type': 'application/pdf',
        'uploaded_by': 'user_id'
    }
    response = client.post(
        "/api/v1/documents/upload",
        json=document_data,
        headers=auth
    )
    assert response.status_code == 201, f"Create failed: {response.text}"
    document_id = response.json()['id']
    yield document_id
    client.delete(f"/api/v1/documents/{document_id}", headers=auth)

def test_list_documents_by_entity(client, auth, test_document_id):
    response = client.get(
        "/api/v1/documents",
        params={'entity_type': 'contract', 'entity_id': f'TEST-CONTRACT-{test_document_id[:8]}'}
    )
    assert response.status_code == 200
    documents = response.json()
    assert len(documents) > 0

def test_download_document(client, auth, test_document_id):
    response = client.get(
        f"/api/v1/documents/{test_document_id}/download",
        headers=auth
    )
    assert response.status_code == 200

def test_delete_document(client, auth, test_document_id):
    response = client.delete(
        f"/api/v1/documents/{test_document_id}",
        headers=auth
    )
    assert response.status_code == 204