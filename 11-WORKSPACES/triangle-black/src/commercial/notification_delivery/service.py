"""
Notification Delivery Engine — Triangle Black A-068
Reads platform_notifications + delivers to users' notification inbox.

Uses EXISTING platform_notifications table (already populated by alerts).
Adds: /api/v1/notifications/ — user inbox
      /api/v1/notifications/{id}/read — mark as read
      /api/v1/notifications/unread-count — badge count

Does NOT require email/WhatsApp yet — in-app delivery first.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


class NotificationDeliveryService:
    def __init__(self, db: Session, hotel_id: str, user_id: str = None):
        self.db = db
        self.hid = hotel_id
        self.uid = user_id

    def _q(self, sql, params=None):
        try:
            return self.db.execute(text(sql), params or {"h": self.hid}).fetchall()
        except Exception:
            try: self.db.rollback()
            except: pass
            return []

    def _scalar(self, sql, params=None, default=0):
        try:
            val = self.db.execute(text(sql), params or {"h": self.hid}).scalar()
            return val if val is not None else default
        except Exception:
            try: self.db.rollback()
            except: pass
            return default

    def get_inbox(self, limit: int = 20, unread_only: bool = False) -> list:
        """Get notification inbox for current user/hotel."""
        where = "WHERE hotel_id = :h"
        if unread_only:
            where += " AND (is_read IS NULL OR is_read = FALSE)"
        
        rows = self._q(f"""
            SELECT id, title, message, type, priority,
                   is_read, created_at, metadata
            FROM platform_notifications
            {where}
            ORDER BY created_at DESC
            LIMIT :lim
        """, {"h": self.hid, "lim": limit})

        result = []
        for r in rows:
            d = dict(r._mapping)
            result.append({
                "id": d["id"],
                "title": d.get("title", ""),
                "message": d.get("message", ""),
                "type": d.get("type", "INFO"),
                "priority": d.get("priority", "LOW"),
                "is_read": bool(d.get("is_read", False)),
                "created_at": str(d.get("created_at", "")),
            })
        return result

    def get_unread_count(self) -> dict:
        """Badge count for notification bell."""
        total = self._scalar(
            "SELECT COUNT(*) FROM platform_notifications WHERE hotel_id=:h"
        )
        unread = self._scalar(
            "SELECT COUNT(*) FROM platform_notifications WHERE hotel_id=:h "
            "AND (is_read IS NULL OR is_read = FALSE)"
        )
        critical = self._scalar(
            "SELECT COUNT(*) FROM platform_notifications WHERE hotel_id=:h "
            "AND priority IN ('CRITICAL','HIGH') "
            "AND (is_read IS NULL OR is_read = FALSE)"
        )
        return {
            "hotel_id": self.hid,
            "total": total,
            "unread": unread,
            "critical_unread": critical,
            "has_critical": critical > 0,
        }

    def mark_read(self, notification_id: str) -> bool:
        """Mark a notification as read."""
        try:
            self.db.execute(text("""
                UPDATE platform_notifications
                SET is_read = TRUE, updated_at = NOW()
                WHERE id = :id AND hotel_id = :h
            """), {"id": notification_id, "h": self.hid})
            self.db.commit()
            return True
        except Exception:
            return False

    def mark_all_read(self) -> int:
        """Mark all notifications as read."""
        try:
            result = self.db.execute(text("""
                UPDATE platform_notifications
                SET is_read = TRUE, updated_at = NOW()
                WHERE hotel_id = :h AND (is_read IS NULL OR is_read = FALSE)
            """), {"h": self.hid})
            self.db.commit()
            return result.rowcount
        except Exception:
            return 0

    def create_alert_notification(self, title: str, message: str,
                                   type: str = "ALERT",
                                   priority: str = "MEDIUM") -> dict:
        """Create a new notification (called by intelligence engines)."""
        import uuid
        notif_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        try:
            self.db.execute(text("""
                INSERT INTO platform_notifications
                  (id, hotel_id, title, message, type,
                   priority, is_read, created_at, updated_at)
                VALUES
                  (:id, :h, :title, :msg, :ntype,
                   :sev, FALSE, :now, :now)
                ON CONFLICT DO NOTHING
            """), {
                "id": notif_id, "h": self.hid,
                "title": title, "msg": message,
                "ntype": type, "sev": priority,
                "now": now,
            })
            self.db.commit()
            return {"id": notif_id, "created": True}
        except Exception as e:
            return {"id": None, "created": False, "error": str(e)[:100]}
