import uuid
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.auth import create_access_token
from src.commercial.vendor_portal.models import RFQ, PurchaseOrder
from src.commercial.vendor_portal.repository import RFQRepository, PurchaseOrderRepository

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_vendor_id(client):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/vendor-portal/rfqs",
        json={"description": f"{TEST_PREFIX} RFQ {unique}"},
        headers=create_access_token(vendor_id=str(uuid.uuid4()))
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    rfq_id = res.json()["id"]
    yield rfq_id
    client.delete(f"/api/v1/vendor-portal/rfqs/{rfq_id}", headers=create_access_token(vendor_id=str(uuid.uuid4())))

@pytest.fixture(scope="module")
def test_purchase_order_id(client, test_vendor_id):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        f"/api/v1/vendor-portal/rfqs/{test_vendor_id}/quote",
        json={"amount": 100.0, "delivery_date": "2023-12-31T23:59:59Z"},
        headers=create_access_token(vendor_id=str(uuid.uuid4()))
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    po_id = res.json()["id"]
    yield po_id
    client.delete(f"/api/v1/vendor-portal/purchase-orders/{po_id}", headers=create_access_token(vendor_id=str(uuid.uuid4())))

def test_list_rfqs_for_vendor(client, test_vendor_id):
    res = client.get(
        "/api/v1/vendor-portal/rfqs",
        headers=create_access_token(vendor_id=test_vendor_id)
    )
    assert res.status_code == 200

def test_submit_quote(client, test_vendor_id):
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        f"/api/v1/vendor-portal/rfqs/{test_vendor_id}/quote",
        json={"amount": 150.0, "delivery_date": "2023-12-31T23:59:59Z"},
        headers=create_access_token(vendor_id=str(uuid.uuid4()))
    )
    assert res.status_code == 201

def test_list_poes_for_vendor(client, test_purchase_order_id):
    res = client.get(
        "/api/v1/vendor-portal/purchase-orders",
        headers=create_access_token(vendor_id=str(uuid.uuid4()))
    )
    assert res.status_code == 200

def test_confirm_delivery(client, test_purchase_order_id):
    res = client.patch(
        f"/api/v1/vendor-portal/purchase-orders/{test_purchase_order_id}/deliver",
        headers=create_access_token(vendor_id=str(uuid.uuid4()))
    )
    assert res.status_code == 204