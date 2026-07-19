"""
Project State Engine — single source of truth for workspace state.
Reads from ai_hub DB tables directly (tasks, memories, execution_runs).
"""
import subprocess
from datetime import datetime, timezone
from dataclasses import dataclass, field
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.db.engine import engine
from src import hub_client

# Task types that produce code and count toward sprint velocity
VELOCITY_TYPES = {"code", "architecture", "feature", "story"}


@dataclass
class ProjectState:
    workspace_id: str
    workspace_name: str
    # Sprint
    active_sprint: str
    sprint_completion_pct: float
    # Tasks — all tasks
    tasks_total: int
    tasks_completed: int
    tasks_in_progress: int
    tasks_failed: int
    tasks_blocked: int
    tasks_pending: int
    # Velocity — code-producing tasks only
    velocity_total: int
    velocity_done: int
    velocity_pct: float
    # Git
    current_branch: str
    last_commit_hash: str
    last_commit_message: str
    uncommitted_files: List[str]
    # Quality
    avg_review_score: float
    # Risks
    overdue_tasks: List[str]
    failing_tasks: List[str]
    # Recommended
    recommended_next_task_id: str
    recommended_next_task_title: str
    recommended_next_reason: str
    # Meta
    snapshot_at: str


def _git_info(workspace_root: str) -> dict:
    """Get git state from Triangle Black repo."""
    def run(cmd):
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, cwd=workspace_root)
            return r.stdout.strip()
        except Exception:
            return ""

    branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    commit_hash = run(["git", "rev-parse", "--short", "HEAD"])
    commit_msg = run(["git", "log", "-1", "--pretty=%s"])
    status_out = run(["git", "status", "--porcelain"])
    uncommitted = [
        line[3:].strip()
        for line in status_out.splitlines()
        if line.strip()
    ]
    return {
        "branch": branch or "main",
        "hash": commit_hash or "unknown",
        "message": commit_msg or "",
        "uncommitted": uncommitted,
    }


def get_task_counts(workspace_id: str) -> dict:
    """
    Count tasks accurately.
    - All tasks counted for total/status breakdown
    - Only code-producing tasks (code, architecture, feature, story) count for velocity
    """
    with Session(engine) as s:
        all_rows = s.execute(
            text("SELECT status, type FROM tasks WHERE workspace_id = :ws"),
            {"ws": workspace_id},
        ).fetchall()

    total = len(all_rows)

    # Status counts across ALL tasks
    status_counts: dict[str, int] = {}
    for row in all_rows:
        status = row[0]
        status_counts[status] = status_counts.get(status, 0) + 1

    # Velocity: only code-producing task types
    velocity_tasks = [r for r in all_rows if r[1] in VELOCITY_TYPES]
    velocity_done = [r for r in velocity_tasks if r[0] == "done"]
    velocity_total = len(velocity_tasks)
    velocity_done_count = len(velocity_done)

    return {
        "total": total,
        "completed": status_counts.get("done", 0),
        "in_progress": (
            status_counts.get("executing", 0) + status_counts.get("planning", 0)
        ),
        "failed": status_counts.get("failed", 0),
        "blocked": status_counts.get("blocked", 0),
        "pending": (
            status_counts.get("pending", 0) + status_counts.get("planned", 0)
        ),
        # Velocity metrics
        "velocity_total": velocity_total,
        "velocity_done": velocity_done_count,
        "velocity_pct": round(
            velocity_done_count / velocity_total * 100
            if velocity_total > 0
            else 0.0,
            1,
        ),
    }


def get_avg_review_score(workspace_id: str) -> float:
    """Get average review score from execution_runs."""
    with Session(engine) as s:
        result = s.execute(
            text("""
                SELECT AVG(quality_score)
                FROM execution_runs
                WHERE workspace_id = :ws
                  AND stage = 'review'
                  AND quality_score > 0
            """),
            {"ws": workspace_id},
        ).scalar()
    return round(float(result or 0.0), 1)


def get_failing_tasks(workspace_id: str) -> List[str]:
    """Get titles of failed tasks."""
    with Session(engine) as s:
        rows = s.execute(
            text("""
                SELECT title FROM tasks
                WHERE workspace_id = :ws AND status = 'failed'
                ORDER BY updated_at DESC LIMIT 10
            """),
            {"ws": workspace_id},
        ).fetchall()
    return [r[0] for r in rows]


def pick_next_task(workspace_id: str) -> dict:
    """Pick highest priority pending code/architecture task.
    Queries DB directly to avoid hub list endpoint 100-item limit.
    """
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}

    # Query DB directly — avoids hub endpoint limit
    with Session(engine) as s:
        rows = s.execute(
            text("""
                SELECT id, title, type, priority, status
                FROM tasks
                WHERE workspace_id = :ws
                  AND status IN ('pending', 'planned')
                ORDER BY
                  CASE priority
                    WHEN 'critical' THEN 0
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    ELSE 3
                  END,
                  created_at ASC
                LIMIT 1
            """),
            {"ws": workspace_id}
        ).fetchone()

    if not rows:
        return {
            "id": "",
            "title": "No pending tasks",
            "reason": "Sprint may be complete",
        }

    return {
        "id": rows[0],
        "title": rows[1],
        "reason": (
            f"Highest priority pending task (priority={rows[3]}, "
            f"type={rows[2]})"
        ),
    }


def build_project_state(workspace_id: str, workspace_root: str) -> ProjectState:
    """Build complete project state snapshot."""
    ws = hub_client.get_workspace(workspace_id)
    ws_name = ws.get("name", "Unknown") if isinstance(ws, dict) else "Unknown"

    counts = get_task_counts(workspace_id)

    # Sprint completion uses velocity (code tasks only) — not all tasks
    # This prevents docs/epics/deploys from inflating completion %
    velocity_pct = counts["velocity_pct"]

    git = _git_info(workspace_root)
    avg_score = get_avg_review_score(workspace_id)
    failing = get_failing_tasks(workspace_id)
    next_task = pick_next_task(workspace_id)

    return ProjectState(
        workspace_id=workspace_id,
        workspace_name=ws_name,
        active_sprint="COMMERCIAL Sprint 2",
        sprint_completion_pct=velocity_pct,  # velocity-based, not raw task count
        tasks_total=counts["total"],
        tasks_completed=counts["completed"],
        tasks_in_progress=counts["in_progress"],
        tasks_failed=counts["failed"],
        tasks_blocked=counts["blocked"],
        tasks_pending=counts["pending"],
        velocity_total=counts["velocity_total"],
        velocity_done=counts["velocity_done"],
        velocity_pct=velocity_pct,
        current_branch=git["branch"],
        last_commit_hash=git["hash"],
        last_commit_message=git["message"],
        uncommitted_files=git["uncommitted"],
        avg_review_score=avg_score,
        overdue_tasks=[],
        failing_tasks=failing[:5],
        recommended_next_task_id=next_task["id"],
        recommended_next_task_title=next_task["title"],
        recommended_next_reason=next_task["reason"],
        snapshot_at=datetime.now(timezone.utc).isoformat(),
    )
