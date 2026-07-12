from __future__ import annotations
from datetime import datetime

from datetime import datetime
"""
Email sending service — Triangle Black
Uses smtplib for SMTP delivery. Logs all attempts to DB.
"""
import os
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from .models import EmailNotification
from .repository import EmailNotificationRepository

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)


def send_email(
    db: Session,
    hotel_id: str,
    recipient: str,
    subject: str,
    body: str,
) -> EmailNotification:
    """
    Send an email via SMTP and log the result to the DB.
    Returns the EmailNotification record (status=sent or status=failed).
    """
    repo = EmailNotificationRepository(db)
    record = repo.create({
        "hotel_id": hotel_id,
        "recipient": recipient,
        "subject": subject,
        "body": body,
        "status": "sending",
    })

    if not SMTP_USER or not SMTP_PASS:
        # No SMTP credentials configured — mark as skipped (not failed)
        return repo.update(record.id, {
            "status": "skipped",
            "error_msg": "SMTP_USER/SMTP_PASS not configured",
        }, hotel_id=hotel_id)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = recipient
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, [recipient], msg.as_string())

        return repo.update(record.id, {
            "status": "sent",
            "sent_at": datetime.utcnow(),
        }, hotel_id=hotel_id)

    except Exception as e:
        return repo.update(record.id, {
            "status": "failed",
            "error_msg": str(e)[:500],
        }, hotel_id=hotel_id)


def send_lead_notification(
    db: Session,
    hotel_id: str,
    lead_name: str,
    lead_email: str,
    manager_email: str,
) -> EmailNotification:
    """Send new lead notification to hotel manager."""
    subject = f"New Lead: {lead_name}"
    body = f"""
    <h2>New Lead Received</h2>
    <p><strong>Name:</strong> {lead_name}</p>
    <p><strong>Email:</strong> {lead_email}</p>
    <p>Log in to Triangle Black to manage this lead.</p>
    """
    return send_email(db, hotel_id, manager_email, subject, body)
