from __future__ import annotations
"""
Triangle Black Email Alert API — Sprint 83
Sends operational alerts via SMTP (configurable).
Falls back to logging if SMTP not configured.
"""
import datetime
import logging
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/email-alerts", tags=["email-alerts"])
logger = logging.getLogger("tb.email")

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _send_email(to: str, subject: str, body: str) -> bool:
    """
    Send email via SMTP.
    Reads config from environment:
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
    Returns True if sent, False if skipped (no config).
    """
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_user = os.environ.get("SMTP_USER", "")
    email_from = os.environ.get("EMAIL_FROM", "noreply@triangleblack.com")

    if not smtp_host or not smtp_user:
        # No SMTP configured — log instead
        logger.info(f"EMAIL (log-only): To={to} Subject={subject}")
        logger.debug(f"EMAIL BODY: {body[:200]}")
        return False  # Not sent via SMTP

    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = email_from
        msg["To"]      = to

        html_body = f"""
        <html><body>
        <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#0f172a;border-bottom:2px solid #0f172a;padding-bottom:8px">
            Triangle Black Alert
          </h2>
          <div style="margin:16px 0;white-space:pre-wrap">{body}</div>
          <div style="margin-top:24px;font-size:11px;color:#94a3b8">
            Triangle Black Enterprise Operations Platform
          </div>
        </div>
        </body></html>
        """

        msg.attach(MIMEText(html_body, "html"))

        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        smtp_pass = os.environ.get("SMTP_PASS", "")

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls()
            if smtp_user and smtp_pass:
                server.login(smtp_user, smtp_pass)
            server.sendmail(email_from, to, msg.as_string())

        logger.info(f"EMAIL SENT: To={to} Subject={subject}")
        return True

    except Exception as e:
        logger.error(f"EMAIL FAILED: {e}")
        return False

@router.post("/critical-wo-alert", summary="Send alert for critical unassigned WO")
def send_critical_wo_alert(data: dict, db: Session = Depends(get_db)):
    """
    Sends email alert for a critical unassigned work order.
    Body: { wo_id, to_email, manager_name }
    """
    wo_id      = data.get("wo_id")
    to_email   = data.get("to_email", os.environ.get("ALERT_EMAIL", ""))
    manager    = data.get("manager_name", "Operations Manager")

    if not to_email:
        raise HTTPException(400, "to_email is required. Set ALERT_EMAIL env var or pass in body.")

    if wo_id:
        row = db.execute(
            text("SELECT * FROM work_orders WHERE id = :id"), {"id": wo_id}
        ).fetchone()
        wo = row_to_dict(row) if row else {}
    else:
        wo = {"title": "Unknown", "priority": "critical", "type": "unknown"}

    subject = f"[CRITICAL] Unassigned Work Order — {wo.get('title', 'WO')} — Triangle Black"
    body = f"""
Dear {manager},

A critical work order has been open and unassigned for more than 2 hours.

Work Order: {wo.get('title', 'N/A')}
Priority:   {wo.get('priority', 'critical').upper()}
Type:       {wo.get('type', 'N/A')}
Status:     {wo.get('status', 'open')}
Created:    {str(wo.get('created_at', ''))[:16]}

Please assign a technician immediately.

Action Required: Log in to Triangle Black → Operations → Work Orders
"""

    sent = _send_email(to_email, subject, body)

    return {
        "success":    True,
        "sent_email": sent,
        "to":         to_email,
        "subject":    subject,
        "wo_id":      wo_id,
        "note":       "Sent via SMTP" if sent else "Logged only — configure SMTP_HOST to enable email",
        "sent_at":    datetime.datetime.utcnow().isoformat(),
    }

@router.post("/daily-digest", summary="Send daily operations digest")
def send_daily_digest(data: dict, db: Session = Depends(get_db)):
    """
    Sends daily operations summary email.
    Body: { to_email, manager_name }
    """
    to_email = data.get("to_email", os.environ.get("ALERT_EMAIL", ""))
    manager  = data.get("manager_name", "Manager")

    if not to_email:
        raise HTTPException(400, "to_email required")

    now = datetime.datetime.utcnow()

    # Gather stats
    stats = {}
    queries = {
        "open_wos":      "SELECT count(*) as n FROM work_orders WHERE status IN ('open','assigned','in_progress')",
        "critical_open": "SELECT count(*) as n FROM work_orders WHERE priority='critical' AND status NOT IN ('completed','closed','cancelled')",
        "overdue_wos":   "SELECT count(*) as n FROM work_orders WHERE due_date < NOW() AND status NOT IN ('completed','closed','cancelled')",
        "pm_overdue":    "SELECT count(*) as n FROM maintenance_plans WHERE next_due_date < CURRENT_DATE AND status='active'",
        "low_stock":     "SELECT count(*) as n FROM inventory_items ii JOIN stock_balances sb ON sb.item_id=ii.id WHERE sb.quantity <= ii.min_stock",
    }
    for key, sql in queries.items():
        try:
            row = db.execute(text(sql)).fetchone()
            stats[key] = int(row_to_dict(row).get("n") or 0)
        except Exception:
            stats[key] = 0

    subject = f"Triangle Black Daily Digest — {now.strftime('%Y-%m-%d')}"
    body = f"""
Daily Operations Summary — {now.strftime('%A, %B %d %Y')}

WORK ORDERS
  Open:            {stats.get('open_wos', 0)}
  Critical Open:   {stats.get('critical_open', 0)}
  Overdue:         {stats.get('overdue_wos', 0)}

MAINTENANCE
  PM Plans Overdue: {stats.get('pm_overdue', 0)}

INVENTORY
  Items Below Min: {stats.get('low_stock', 0)}

Access Triangle Black for full details and action.
"""

    sent = _send_email(to_email, subject, body)

    return {
        "success":    True,
        "sent_email": sent,
        "to":         to_email,
        "stats":      stats,
        "note":       "Sent via SMTP" if sent else "Logged only — configure SMTP_HOST",
        "sent_at":    now.isoformat(),
    }

@router.get("/config", summary="Email configuration status")
def email_config_status():
    """Returns email configuration status (no secrets exposed)."""
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_user = os.environ.get("SMTP_USER", "")
    alert_email = os.environ.get("ALERT_EMAIL", "")

    return {
        "smtp_configured": bool(smtp_host and smtp_user),
        "smtp_host":       smtp_host[:20] + "..." if smtp_host else "(not set)",
        "smtp_user":       smtp_user[:10] + "..." if smtp_user else "(not set)",
        "alert_email":     alert_email[:20] + "..." if alert_email else "(not set)",
        "mode":            "smtp" if smtp_host else "log-only",
        "note":            "Set SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM in .env to enable email",
    }
