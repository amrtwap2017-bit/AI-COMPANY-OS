"""
V7-Sprint1 — Notification Dispatcher
Wires platform_notifications → email delivery

Architecture:
  platform_notifications (created by business logic)
  → NotificationDispatcher.poll_and_send()
  → src/core/email_service → SMTP
  → update platform_notifications.is_read = email_sent

Graceful: if SMTP not configured, logs only, does not fail.
This dispatcher is called from background tasks or cron.
"""
from __future__ import annotations
import logging
import os
import smtplib
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger("tb.notification_dispatcher")


def _smtp_enabled() -> bool:
    return os.getenv("SMTP_ENABLED", "false").lower() == "true" and \
           bool(os.getenv("SMTP_USER", ""))


def _get_smtp_cfg() -> Optional[Dict[str, Any]]:
    if not _smtp_enabled():
        return None
    return {
        "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", os.getenv("SMTP_PASS", "")),
        "from_addr": os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "")),
        "from_name": os.getenv("SMTP_FROM_NAME", "Triangle Black"),
    }


def _send_smtp(to_email: str, subject: str, html_body: str) -> bool:
    """Send one email via SMTP. Returns True on success."""
    cfg = _get_smtp_cfg()
    if not cfg:
        logger.info("SMTP disabled — would send '%s' to %s", subject, to_email)
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{cfg['from_name']} <{cfg['from_addr']}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_addr"], to_email, msg.as_string())
        logger.info("✓ Email sent: '%s' → %s", subject, to_email)
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP auth failed — check SMTP_USER + SMTP_PASSWORD in .env")
        return False
    except Exception as e:
        logger.error("Email send failed to %s: %s", to_email, e)
        return False


def _notification_html(title: str, message: str,
                       ntype: str, priority: str,
                       hotel_id: str) -> str:
    """Build notification email HTML."""
    priority_color = {
        "critical": "#ef4444", "high": "#f97316",
        "medium": "#eab308", "low": "#22c55e",
    }.get(priority.lower(), "#6b7280")

    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1a1a1a;padding:20px;border-radius:8px 8px 0 0;text-align:center">
    <h2 style="color:#B9924C;margin:0">Triangle Black</h2>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">
      Operations Intelligence Platform
    </p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;
              padding:28px;border-radius:0 0 8px 8px">
    <div style="border-left:4px solid {priority_color};padding:12px 16px;
                background:#f9fafb;border-radius:0 6px 6px 0;margin-bottom:20px">
      <p style="margin:0;font-size:11px;color:#6b7280;text-transform:uppercase;
                letter-spacing:0.05em">{ntype.upper()} · {priority.upper()}</p>
      <p style="margin:6px 0 0;font-size:17px;font-weight:700;color:#111">{title}</p>
    </div>
    <p style="color:#374151;line-height:1.6">{message}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <p style="margin:0;font-size:12px;color:#9ca3af">
      Triangle Black Engineering · Auto-notification · Hotel {hotel_id[-12:]}
    </p>
  </div>
</body>
</html>"""


class NotificationDispatcher:
    """
    Dispatches pending platform_notifications via email.
    Call dispatch_pending() from background task or cron.
    """

    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        hotel_id: str,
        title: str,
        message: str,
        ntype: str = "info",
        priority: str = "medium",
        entity_type: str = "",
        entity_id: str = "",
        user_id: str = "",
    ) -> str:
        """Create a notification record. Returns the notification id."""
        import uuid
        nid = str(uuid.uuid4())
        try:
            self.db.execute(text("""
                INSERT INTO platform_notifications
                  (id, hotel_id, user_id, type, title, message,
                   priority, is_read, entity_type, entity_id, created_at)
                VALUES
                  (:id, :hid, :uid, :type, :title, :message,
                   :priority, FALSE, :etype, :eid, NOW())
            """), {
                "id": nid, "hid": hotel_id, "uid": user_id,
                "type": ntype, "title": title, "message": message,
                "priority": priority, "etype": entity_type, "eid": entity_id,
            })
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.warning(f"Failed to create notification: {e}")
        return nid

    def dispatch_pending(
        self,
        hotel_id: str,
        to_email: str,
        max_notifications: int = 10,
        priorities: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Fetch unread notifications and send them by email.
        marks is_read=True after successful send (or after attempt if SMTP disabled).
        """
        if priorities is None:
            priorities = ["critical", "high"]

        priority_filter = ", ".join(f"'{p}'" for p in priorities)
        try:
            rows = self.db.execute(text(f"""
                SELECT id, title, message, type, priority, hotel_id
                FROM platform_notifications
                WHERE hotel_id = :h
                  AND (is_read IS NULL OR is_read = FALSE)
                  AND LOWER(priority) IN ({priority_filter})
                ORDER BY created_at DESC
                LIMIT :lim
            """), {"h": hotel_id, "lim": max_notifications}).fetchall()
        except Exception as e:
            self.db.rollback()
            return {"dispatched": 0, "error": str(e)}

        if not rows:
            return {
                "hotel_id": hotel_id,
                "dispatched": 0,
                "message": "No pending critical/high notifications",
                "smtp_enabled": _smtp_enabled(),
            }

        dispatched = 0
        failed = 0

        for row in rows:
            d = dict(row._mapping)
            html = _notification_html(
                title=d["title"],
                message=d["message"],
                ntype=d.get("type", "info"),
                priority=d.get("priority", "medium"),
                hotel_id=d["hotel_id"],
            )
            subject = f"[Triangle Black] {d.get('priority','').upper()}: {d['title']}"
            success = _send_smtp(to_email, subject, html)

            # Mark as read whether sent or not (prevent spam loop)
            try:
                self.db.execute(text("""
                    UPDATE platform_notifications
                    SET is_read = TRUE
                    WHERE id = :id
                """), {"id": d["id"]})
                self.db.commit()
            except Exception:
                self.db.rollback()

            if success:
                dispatched += 1
            else:
                failed += 1

        return {
            "hotel_id": hotel_id,
            "dispatched": dispatched,
            "failed": failed,
            "total_processed": len(rows),
            "smtp_enabled": _smtp_enabled(),
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def get_inbox(self, hotel_id: str, limit: int = 20,
                  unread_only: bool = False) -> Dict[str, Any]:
        """In-app notification inbox."""
        where = "WHERE hotel_id = :h"
        if unread_only:
            where += " AND (is_read IS NULL OR is_read = FALSE)"
        try:
            rows = self.db.execute(text(f"""
                SELECT id, title, message, type, priority, is_read, created_at
                FROM platform_notifications
                {where}
                ORDER BY created_at DESC LIMIT :lim
            """), {"h": hotel_id, "lim": limit}).fetchall()

            items = [
                {
                    "id": r[0], "title": r[1], "message": r[2],
                    "type": r[3], "priority": r[4],
                    "is_read": bool(r[5]), "created_at": str(r[6]),
                }
                for r in rows
            ]
            return {
                "hotel_id": hotel_id,
                "count": len(items),
                "unread_only": unread_only,
                "notifications": items,
            }
        except Exception as e:
            self.db.rollback()
            return {"hotel_id": hotel_id, "count": 0,
                    "notifications": [], "error": str(e)}

    def get_unread_count(self, hotel_id: str) -> Dict[str, Any]:
        """Badge count for notification bell."""
        def _count(sql, params):
            try:
                return self.db.execute(text(sql), params).scalar() or 0
            except Exception:
                self.db.rollback()
                return 0

        unread = _count(
            "SELECT COUNT(*) FROM platform_notifications "
            "WHERE hotel_id=:h AND (is_read IS NULL OR is_read=FALSE)",
            {"h": hotel_id}
        )
        critical_unread = _count(
            "SELECT COUNT(*) FROM platform_notifications "
            "WHERE hotel_id=:h AND (is_read IS NULL OR is_read=FALSE) "
            "AND LOWER(priority) IN ('critical','high')",
            {"h": hotel_id}
        )
        return {
            "hotel_id": hotel_id,
            "unread": unread,
            "critical_unread": critical_unread,
            "has_critical": critical_unread > 0,
        }
