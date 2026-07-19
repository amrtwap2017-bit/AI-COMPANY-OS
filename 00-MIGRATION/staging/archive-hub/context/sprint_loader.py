"""
Sprint Loader — Load task history for a workspace.

Tells the developer agent what was already built and what failed,
so it doesn't rebuild existing modules and learns from past failures.
"""
from __future__ import annotations
from sqlalchemy.orm import Session
from hub.db.engine import engine
from hub.tasks.models import Task


def load_sprint_context(workspace_id: str, limit: int = 20) -> str:
    """
    Return a formatted string of recent task history for prompt injection.

    Shows:
    - Recently completed modules (don't rebuild these)
    - Recently failed tasks (learn from these errors)
    - In-progress tasks (context awareness)
    """
    if not workspace_id:
        return ""

    with Session(engine) as s:
        tasks = (
            s.query(Task)
            .filter(Task.workspace_id == workspace_id)
            .order_by(Task.updated_at.desc())
            .limit(limit)
            .all()
        )

    if not tasks:
        return ""

    done    = [t for t in tasks if t.status == "done"]
    failed  = [t for t in tasks if t.status == "failed"]
    running = [t for t in tasks if t.status in ("executing", "planned")]

    lines = ["SPRINT HISTORY FOR THIS WORKSPACE:", ""]

    if done:
        lines.append("✅ ALREADY BUILT (do not rebuild these modules):")
        for t in done[:10]:
            result  = t.result or {}
            files   = result.get("files", [])
            modules = _extract_modules(files)
            if modules:
                lines.append(f"  - {t.title} → {', '.join(modules)}")
            else:
                lines.append(f"  - {t.title}")
        lines.append("")

    if failed:
        lines.append("❌ PREVIOUSLY FAILED (learn from these errors):")
        for t in failed[:5]:
            error = t.error or ""
            result = t.result or {}
            lines.append(f"  - {t.title}")
            if error:
                lines.append(f"    Error: {error[:200]}")
        lines.append("")

    if running:
        lines.append("🔄 IN PROGRESS:")
        for t in running[:3]:
            lines.append(f"  - {t.title} ({t.status})")
        lines.append("")

    return "\n".join(lines)


def load_completed_modules(workspace_id: str) -> set:
    """
    Return set of module names already built for this workspace.
    Used to skip tasks that are already complete.
    """
    if not workspace_id:
        return set()

    with Session(engine) as s:
        tasks = (
            s.query(Task)
            .filter(
                Task.workspace_id == workspace_id,
                Task.status == "done",
            )
            .all()
        )

    modules = set()
    for t in tasks:
        result = t.result or {}
        files  = result.get("files", [])
        modules.update(_extract_modules(files))
    return modules


def load_failed_context(workspace_id: str) -> str:
    """
    Return details of recent failures for the developer agent to avoid.
    """
    if not workspace_id:
        return ""

    with Session(engine) as s:
        tasks = (
            s.query(Task)
            .filter(
                Task.workspace_id == workspace_id,
                Task.status == "failed",
            )
            .order_by(Task.updated_at.desc())
            .limit(5)
            .all()
        )

    if not tasks:
        return ""

    lines = ["PREVIOUS FAILURES TO AVOID:"]
    for t in tasks:
        result  = t.result or {}
        summary = result.get("summary", "")
        error   = t.error or result.get("error", "")
        lines.append(f"  Task: {t.title}")
        if error:
            lines.append(f"  Error: {error[:300]}")
        if summary:
            lines.append(f"  Summary: {summary[:200]}")
        lines.append("")

    return "\n".join(lines)


def _extract_modules(files: list) -> list:
    """Extract module folder names from a list of file paths."""
    modules = set()
    for f in (files or []):
        parts = str(f).split("/")
        # e.g. src/commercial/maintenance_schedules/router.py → maintenance_schedules
        if len(parts) >= 3 and parts[0] == "src":
            modules.add(parts[2] if len(parts) > 2 else parts[1])
    return sorted(modules)
