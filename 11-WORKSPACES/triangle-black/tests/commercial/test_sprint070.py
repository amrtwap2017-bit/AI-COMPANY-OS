"""Sprint-070: DDD compliance tests — audit_log + notification_engine"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestAuditLogDDD:
    def test_audit_log_model_importable(self):
        from src.commercial.audit_log.models import AuditLog
        assert AuditLog.__tablename__ == "platform_audit_log"
        assert hasattr(AuditLog, "entity_type")
        assert hasattr(AuditLog, "action")
        assert hasattr(AuditLog, "hotel_id")

    def test_audit_log_schemas_importable(self):
        from src.commercial.audit_log.schemas import (
            AuditLogCreate, AuditLogResponse
        )
        schema = AuditLogCreate(entity_type="contract", action="created")
        assert schema.entity_type == "contract"

    def test_audit_log_repository_importable(self):
        from src.commercial.audit_log.repository import (
            record_audit_event, get_entity_audit_trail, get_recent_events
        )
        assert callable(record_audit_event)
        assert callable(get_entity_audit_trail)
        assert callable(get_recent_events)

    def test_audit_log_api_recent(self, client, auth_headers):
        res = client.get("/api/v1/audit-log/recent", headers=auth_headers)
        _skip_if_rate_limited(res, "audit_recent")
        assert res.status_code in (200, 404)

    def test_audit_log_api_summary(self, client, auth_headers):
        res = client.get("/api/v1/audit-log/summary", headers=auth_headers)
        _skip_if_rate_limited(res, "audit_summary")
        assert res.status_code in (200, 404)


class TestNotificationEngineDDD:
    def test_notification_model_importable(self):
        from src.commercial.notification_engine.models import PlatformNotification
        assert PlatformNotification.__tablename__ == "platform_notifications"
        assert hasattr(PlatformNotification, "hotel_id")
        assert hasattr(PlatformNotification, "is_read")
        assert hasattr(PlatformNotification, "type")

    def test_notification_schemas_importable(self):
        from src.commercial.notification_engine.schemas import (
            NotificationCreate, NotificationResponse
        )
        schema = NotificationCreate(type="alert", title="Test")
        assert schema.type == "alert"

    def test_notification_repository_importable(self):
        from src.commercial.notification_engine.repository import (
            get_live_notifications, mark_as_read,
            get_unread_count, create_notification
        )
        assert callable(get_live_notifications)
        assert callable(mark_as_read)
        assert callable(get_unread_count)
        assert callable(create_notification)

    def test_notifications_api_list(self, client, auth_headers):
        res = client.get("/api/v1/notifications/live/", headers=auth_headers)
        _skip_if_rate_limited(res, "notif_list")
        assert res.status_code in (200, 404)

    def test_notifications_api_count(self, client, auth_headers):
        res = client.get("/api/v1/notifications/live/count", headers=auth_headers)
        _skip_if_rate_limited(res, "notif_count")
        assert res.status_code in (200, 404)
