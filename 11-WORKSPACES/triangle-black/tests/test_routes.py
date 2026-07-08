from fastapi.testclient import TestClient
from main import app
from domain.models import LeadStatusChange

client = TestClient(app)

def test_log_lead_status_change():
    response = client.post(
        "/leads/status",
        json={"lead_id": 1, "old_status": "pending", "new_status": "approved"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["lead_id"] == 1
    assert data["old_status"] == "pending"
    assert data["new_status"] == "approved"