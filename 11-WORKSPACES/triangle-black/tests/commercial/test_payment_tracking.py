import uuid
import pytest
from fastapi.testclient import TestClient
from src.core.auth import create_access_token
from src.commercial.payment_tracking.models import Payment
from src.commercial.payment_tracking.repository import PaymentRepository

TEST_PREFIX = 'TEST-PYTEST'

@pytest.fixture(scope='module')
def test_payment_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        '/api/v1/invoices/',
        json={
            'hotel_id': 'test_hotel_id',
            'invoice_number': f'TB-INV-{unique}',
            'total_amount': 100.0,
            'due_date': '2023-12-31'
        },
        headers=auth
    )
    assert res.status_code == 201, f'Create failed: {res.text}'
    invoice_id = res.json()['id']
    payment_payload = {
        'hotel_id': 'test_hotel_id',
        'invoice_id': invoice_id,
        'amount': 50.0,
        'method': 'bank_transfer'
    }
    res = client.post(
        '/api/v1/payments/',
        json=payment_payload,
        headers=auth
    )
    assert res.status_code == 201, f'Create failed: {res.text}'
    payment_id = res.json()['id']
    yield payment_id
    client.delete(f'/api/v1/payments/{payment_id}', headers=auth)
    client.delete(f'/api/v1/invoices/{invoice_id}', headers=auth)

def test_get_payment(client, auth, test_payment_id):
    res = client.get(
        f'/api/v1/payments/{test_payment_id}',
        headers=auth
    )
    assert res.status_code == 200
    payment = res.json()
    assert payment['id'] == test_payment_id

def test_update_payment(client, auth, test_payment_id):
    update_payload = {
        'amount': 75.0,
        'method': 'cheque'
    }
    res = client.put(
        f'/api/v1/payments/{test_payment_id}',
        json=update_payload,
        headers=auth
    )
    assert res.status_code == 200
    payment = res.json()
    assert payment['amount'] == 75.0
    assert payment['method'] == 'cheque'