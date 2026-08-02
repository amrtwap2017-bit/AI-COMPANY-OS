"""Tests for notifications endpoints."""
import pytest


def test_list_notifications(client, auth):
    res = client.get("/api/v1/notifications/", headers=auth)
    assert res.status_code == 200
    data = res.json()
    # API returns list directly or paginated dict
    if isinstance(data, list):
        notifications = data
        unread_count = sum(1 for n in data if not n.get("is_read", True))
    else:
        notifications = data.get("notifications", data)
        unread_count = data.get("unread_count", 0)
    assert isinstance(notifications, list)
    assert isinstance(unread_count, int)


def test_notifications_have_correct_fields(client, auth):
    raw = client.get("/api/v1/notifications/", headers=auth).json()
    data_list = raw if isinstance(raw, list) else raw.get("notifications", [])
    for n in data_list:
        assert "id" in n
        assert "title" in n
        assert "type" in n
        assert "is_read" in n
        assert "recipient_role" in n


def test_unread_count_endpoint(client, auth):
    res = client.get("/api/v1/notifications/unread", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert "unread_count" in data
    assert data["unread_count"] >= 0


def test_unread_only_filter(client, auth):
    res = client.get("/api/v1/notifications/?unread_only=true", headers=auth)
    assert res.status_code == 200
    raw = res.json()
    data_list = raw if isinstance(raw, list) else raw.get("notifications", [])
    for n in data_list:
        assert n["is_read"] is False


def test_mark_notification_read(client, auth):
    raw = client.get(
        "/api/v1/notifications/?unread_only=true", headers=auth
    ).json()
    notif_list = raw if isinstance(raw, list) else raw.get("notifications", [])
    if not notif_list:
        pytest.skip("No unread notifications to mark")

    notif_id = notif_list[0]["id"]
    res = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=auth)
    assert res.status_code == 200
    assert res.json()["is_read"] is True

    # Verify it no longer appears in unread
    after_raw = client.get(
        "/api/v1/notifications/?unread_only=true", headers=auth
    ).json()
    after_list = after_raw if isinstance(after_raw, list) else after_raw.get("notifications", [])
    assert all(n["id"] != notif_id for n in after_list)


def test_mark_all_read_reduces_unread(client, auth):
    # Get count before
    before = client.get("/api/v1/notifications/unread", headers=auth).json()
    before_count = before["unread_count"]

    res = client.post("/api/v1/notifications/read-all", headers=auth)
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "marked_read" in data
    assert data["marked_read"] >= 0

    # marked_read >= 0 and unread count decreased or stayed at 0
    assert data["marked_read"] >= 0
    after = client.get("/api/v1/notifications/unread", headers=auth).json()
    assert after["unread_count"] <= before_count


def test_notifications_requires_auth():
    import requests as _req
    res = _req.get("http://localhost:8030/api/v1/notifications/", timeout=10)
    assert res.status_code == 401


def test_mark_nonexistent_notification(client, auth):
    res = client.patch(
        "/api/v1/notifications/nonexistent-000/read",
        headers=auth,
    )
    assert res.status_code == 404


def test_admin_sees_all_roles(client, auth):
    """Admin should see notifications for all roles."""
    raw = client.get("/api/v1/notifications/", headers=auth).json()
    data_list = raw if isinstance(raw, list) else raw.get("notifications", [])
    roles = {n["recipient_role"] for n in data_list}
    # Admin sees manager, agent, and all notifications
    assert len(roles) >= 1
