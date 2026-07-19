"""
app/integrations/slack.py
────────────────────────────────────────────────────────────────
Slack integration using Incoming Webhooks.
Requires SLACK_WEBHOOK_URL environment variable.

No OAuth needed for simple notifications.
"""

from __future__ import annotations

import logging
import httpx

log = logging.getLogger(__name__)


class SlackClient:

    def __init__(self, webhook_url: str) -> None:
        self._webhook = webhook_url

    def send(
        self,
        text:    str,
        channel: str | None  = None,
        blocks:  list | None = None,
    ) -> bool:
        """Send a message via webhook. Returns True on success."""
        payload: dict = {"text": text}
        if channel:
            payload["channel"] = channel
        if blocks:
            payload["blocks"] = blocks

        try:
            with httpx.Client(timeout=10) as client:
                r = client.post(self._webhook, json=payload)
                return r.status_code == 200
        except Exception as exc:
            log.error("Slack send failed: %s", exc)
            return False

    def send_project_complete(
        self,
        project_name: str,
        score:        float,
        duration:     float,
        project_id:   int,
    ) -> bool:
        """Send a project completion notification."""
        emoji = "✅" if score >= 7 else "⚠️"
        text  = (
            f"{emoji} *Project Complete:* {project_name}\n"
            f"Quality score: {score:.1f}/10 | "
            f"Duration: {duration:.0f}s | "
            f"ID: #{project_id}"
        )
        return self.send(text)

    def send_alert(self, title: str, message: str) -> bool:
        """Send an alert notification."""
        text = f"🚨 *{title}*\n{message}"
        return self.send(text)

    def send_daily_summary(self, stats: dict) -> bool:
        """Send daily platform summary."""
        text = (
            f"📊 *Daily Summary — AI Company OS*\n"
            f"Agent calls: {stats.get('total_agent_calls', 0)} | "
            f"Projects: {stats.get('total_projects', 0)} | "
            f"Avg response: {stats.get('avg_response_seconds', 0):.0f}s"
        )
        return self.send(text)


def get_slack_client() -> SlackClient | None:
    """Get Slack client from environment. Returns None if not configured."""
    import os
    webhook = os.getenv("SLACK_WEBHOOK_URL", "")
    if not webhook:
        return None
    return SlackClient(webhook)
