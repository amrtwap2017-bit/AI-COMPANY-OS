import uuid
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.auth import require_agent
from src.commercial.system_notifications.repository import NotificationRepository
from src.commercial.system_notifications.schemas import NotificationCreate, NotificationResponse

TEST_PREFIX = "TEST-PYTEST"

@pytest.fixture(scope="module")
def test_notification_id(client, auth):
    unique = str(uuid.uuid4())[:8]
    notification_data = NotificationCreate(
        hotel_id="test_hotel",
        type="quote_approved",
        title=f"{TEST_PREFIX} Quote Approved",
        body=f"Your quote has been approved for {unique}."
    )
    res = client.post(
        "/api/v1/notifications/",
        json=notification_data.dict(),
        headers=auth,
    )
    assert res.status_code == 201, f"Create failed: {res.text}"
    notification_id = res.json()["id"]
    yield notification_id
    client.delete(f"/api/v1/notifications/{notification_id}", headers=auth)

def test_get_unread_notifications(client, auth):
    res = client.get(
        "/api/v1/notifications",
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0

def test_mark_notification_read(client, auth, test_notification_id):
    res = client.patch(
        f"/api/v1/notifications/{test_notification_id}/read",
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["read"] == True

def test_mark_all_notifications_read(client, auth):
    res = client.post(
        "/api/v1/notifications/bulk-read",
        headers=auth,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "All notifications marked as read"