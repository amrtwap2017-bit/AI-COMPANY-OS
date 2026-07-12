from __future__ import annotations

"""
Triangle Black — Email Service
Sends quote PDF proposals to hotel clients via SMTP.
Runs in FastAPI BackgroundTasks — never blocks the API response.
If SMTP is not configured, logs a warning and exits gracefully.
"""
import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

logger = logging.getLogger("triangle_black.email")


def _get_smtp_config() -> dict | None:
    """Read SMTP config from environment. Return None if disabled or missing."""
    enabled = os.getenv("SMTP_ENABLED", "false").lower()
    if enabled != "true":
        return None
    host     = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port     = int(os.getenv("SMTP_PORT", "587"))
    user     = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASSWORD", "")
    from_addr = os.getenv("SMTP_FROM", user)
    from_name = os.getenv("SMTP_FROM_NAME", "Triangle Black Engineering")
    if not user or not password:
        logger.warning("SMTP_USER or SMTP_PASSWORD not set — email disabled")
        return None
    return {
        "host": host, "port": port, "user": user,
        "password": password, "from_addr": from_addr, "from_name": from_name,
    }


def send_quote_email(
    to_email: str,
    to_name: str,
    quote_title: str,
    quote_total: float,
    quote_id: str,
    pdf_bytes: bytes,
) -> bool:
    """
    Send a quote PDF proposal by email.
    Returns True on success, False on any failure.
    Never raises — all errors are caught and logged.
    """
    cfg = _get_smtp_config()
    if not cfg:
        logger.info(
            "Email skipped (SMTP disabled) — would have sent '%s' to %s",
            quote_title, to_email,
        )
        return False

    try:
        # ── Build message ─────────────────────────────────────────────────────
        msg = MIMEMultipart("mixed")
        msg["Subject"] = f"Proposal: {quote_title} — Triangle Black Engineering"
        msg["From"]    = f"{cfg['from_name']} <{cfg['from_addr']}>"
        msg["To"]      = to_email
        msg["Reply-To"] = cfg["from_addr"]

        # ── HTML body ─────────────────────────────────────────────────────────
        formatted_total = f"EGP {quote_total:,.0f}"
        html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: #1B2B4B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: #F59E0B; margin: 0; font-size: 24px;">Triangle Black</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0 0; font-size: 14px;">
      Engineering Services Platform
    </p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none;
              padding: 32px; border-radius: 0 0 12px 12px;">

    <p style="font-size: 16px; color: #374151;">Dear {to_name},</p>

    <p style="color: #6b7280; line-height: 1.6;">
      Thank you for your interest in Triangle Black Engineering Services.
      Please find attached our proposal for your review.
    </p>

    <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-left: 4px solid #1B2B4B;
                border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; font-weight: 600;
                text-transform: uppercase; letter-spacing: 0.05em;">
        Proposal Summary
      </p>
      <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #1B2B4B;">
        {quote_title}
      </p>
      <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #F59E0B;">
        {formatted_total}
      </p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
        Annual contract value · inclusive of all services
      </p>
    </div>

    <p style="color: #6b7280; line-height: 1.6;">
      The full proposal document is attached as a PDF. Please review it at
      your convenience. Our team is available to discuss any questions or
      adjustments you may require.
    </p>

    <p style="color: #6b7280; line-height: 1.6;">
      To approve or reject this proposal, please log in to your client portal
      or reply to this email.
    </p>

    <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
      <p style="margin: 0; font-weight: 700; color: #1B2B4B;">
        Triangle Black Engineering
      </p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
        Hotel Engineering Services · Egypt
      </p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
        <a href="mailto:amr@triangleblack.com" style="color: #1B2B4B;">
          amr@triangleblack.com
        </a>
      </p>
    </div>
  </div>

</body>
</html>
"""
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        # ── PDF attachment ────────────────────────────────────────────────────
        filename = f"TB-{quote_id[:8].upper()}-Proposal.pdf"
        pdf_part = MIMEApplication(pdf_bytes, _subtype="pdf")
        pdf_part.add_header(
            "Content-Disposition", "attachment", filename=filename
        )
        msg.attach(pdf_part)

        # ── Send ──────────────────────────────────────────────────────────────
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(cfg["user"], cfg["password"])
            server.sendmail(cfg["from_addr"], to_email, msg.as_string())

        logger.info(
            "✓ Quote email sent — to=%s subject='%s'",
            to_email, msg["Subject"],
        )
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP auth failed — check SMTP_USER and SMTP_PASSWORD in .env")
        return False
    except smtplib.SMTPException as exc:
        logger.error("SMTP error sending to %s: %s", to_email, exc)
        return False
    except OSError as exc:
        logger.error("Network error sending email to %s: %s", to_email, exc)
        return False
    except Exception as exc:
        logger.error("Unexpected error sending email to %s: %s", to_email, exc)
        return False
