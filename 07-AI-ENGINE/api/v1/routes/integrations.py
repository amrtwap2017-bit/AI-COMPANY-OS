"""
app/api/v1/routes/integrations.py
External integrations API endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


# ── GitHub ────────────────────────────────────────────────────

@router.get("/integrations/github/status")
def github_status() -> dict:
    """Check if GitHub integration is configured."""
    from integrations.github import get_github_client
    client = get_github_client()
    if not client:
        return {"configured": False, "message": "Set GITHUB_TOKEN env var"}
    try:
        user = client.get_user()
        return {"configured": True, "user": user}
    except Exception as e:
        return {"configured": True, "error": str(e)}


@router.get("/integrations/github/repos")
def list_repos(per_page: int = Query(default=10, ge=1, le=50)) -> dict:
    """List GitHub repositories."""
    from integrations.github import get_github_client
    client = get_github_client()
    if not client:
        raise HTTPException(status_code=503, detail="GITHUB_TOKEN not configured")
    return {"repos": client.list_repos(per_page=per_page)}


@router.get("/integrations/github/{owner}/{repo}/issues")
def list_issues(owner: str, repo: str, state: str = "open") -> dict:
    """List GitHub issues for a repository."""
    from integrations.github import get_github_client
    client = get_github_client()
    if not client:
        raise HTTPException(status_code=503, detail="GITHUB_TOKEN not configured")
    issues = client.list_issues(f"{owner}/{repo}", state=state)
    return {"repo": f"{owner}/{repo}", "issues": issues}


class CreateIssueRequest(BaseModel):
    owner:  str
    repo:   str
    title:  str
    body:   str
    labels: list[str] = []


@router.post("/integrations/github/issues")
def create_issue(req: CreateIssueRequest) -> dict:
    """Create a GitHub issue."""
    from integrations.github import get_github_client
    client = get_github_client()
    if not client:
        raise HTTPException(status_code=503, detail="GITHUB_TOKEN not configured")
    return client.create_issue(
        repo=f"{req.owner}/{req.repo}",
        title=req.title,
        body=req.body,
        labels=req.labels,
    )


# ── Slack ─────────────────────────────────────────────────────

@router.get("/integrations/slack/status")
def slack_status() -> dict:
    """Check if Slack integration is configured."""
    from integrations.slack import get_slack_client
    client = get_slack_client()
    return {
        "configured": client is not None,
        "message": "Set SLACK_WEBHOOK_URL env var" if not client else "Ready",
    }


class SlackMessageRequest(BaseModel):
    text:    str
    channel: str | None = None


@router.post("/integrations/slack/send")
def send_slack(req: SlackMessageRequest) -> dict:
    """Send a message to Slack."""
    from integrations.slack import get_slack_client
    client = get_slack_client()
    if not client:
        raise HTTPException(status_code=503, detail="SLACK_WEBHOOK_URL not configured")
    ok = client.send(req.text, channel=req.channel)
    return {"sent": ok}


@router.post("/integrations/slack/summary")
def send_slack_summary() -> dict:
    """Send daily platform summary to Slack."""
    from integrations.slack import get_slack_client
    from analytics.engine import AnalyticsEngine
    from db.database import SessionLocal

    client = get_slack_client()
    if not client:
        raise HTTPException(status_code=503, detail="SLACK_WEBHOOK_URL not configured")

    db = SessionLocal()
    try:
        stats = AnalyticsEngine(db).overview()
    finally:
        db.close()

    ok = client.send_daily_summary(stats)
    return {"sent": ok}
