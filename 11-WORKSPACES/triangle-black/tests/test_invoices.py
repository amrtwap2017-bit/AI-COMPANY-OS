from fastapi.testclient import TestClient
from src.main import app
from sqlalchemy.orm import Session
from infrastructure.repositories.invoice_repository import InvoiceRepository
from domain.models.invoice import Invoice
import pytest

@pytest.fixture(scope='module')
def test_invoice_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        '/api/v1/invoices/',
        json={
            'invoice_number': f'TB-INV-{unique}',
            'hotel_name': 'Test Hotel',
            'hotel_address': '123 Test St, Test City',
            'line_items': 'Service A, Material B',
            'subtotal': 100.0,
            'vat': 14.0,
            'total': 114.0
        },
        headers=auth,
    )
    assert res.status_code == 201, f'Create failed: {res.text}'
    invoice_id = res.json()['id']
    yield invoice_id
    client.delete(f'/api/v1/invoices/{invoice_id}', headers=auth)

def test_get_invoice_detail(client):
    auth = _admin(client)
    invoices = client.get('/api/v1/invoices/', headers=auth).json()
    if not invoices:
        pytest.skip('No invoices in DB')
    inv_id = invoices[0]['id']
    r = client.get(f'/api/v1/invoices/{inv_id}', headers=auth)
    assert r.status_code == 200
    data = r.json()
    assert 'invoice_number' in data
    assert 'total_amount' in data

def test_generate_invoice_pdf(client, test_invoice_id):
    auth = _admin(client)
    invoice_id = test_invoice_id
    res = client.get(f'/api/v1/invoices/{invoice_id}/pdf', headers=auth)
    assert res.status_code == 200
    assert 'application/pdf' in res.headers['Content-Type']
    pdf_path = f'artifacts/invoices/{invoice_id}.pdf'
    assert os.path.exists(pdf_path)
