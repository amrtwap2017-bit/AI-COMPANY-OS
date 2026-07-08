"""
WebhookConfig router tests
"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from datetime import datetime
from src.commercial.webhook_notifications.router import router, get_db


def fake_obj(**kwargs):
    defaults = dict(id="test-id", name="Test", description=None,
                    status="active", created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow())
    defaults.update(kwargs)
    return MagicMock(**defaults)


@pytest.fixture
def client():
    app = FastAPI()
    app.dependency_overrides[get_db] = lambda: MagicMock()
    app.include_router(router)
    return TestClient(app)


def test_list(client):
    with patch("src.commercial.webhook_notifications.router.WebhookConfigRepository") as M:
        M.return_value.list.return_value = []
        r = client.get("/webhooks/")
        assert r.status_code == 200

def test_get_not_found(client):
    with patch("src.commercial.webhook_notifications.router.WebhookConfigRepository") as M:
        M.return_value.get.return_value = None
        r = client.get("/webhooks/bad-id")
        assert r.status_code == 404
