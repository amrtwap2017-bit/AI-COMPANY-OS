"""
Analytics Engine
────────────────────────────────────────────────────────────────
Queries platform_events to generate dashboard statistics.

Rules:
  - All DB access via injected Session (not SessionLocal directly).
  - All public methods return typed dicts — no ORM objects leak.
  - Queries are kept simple and index-backed.
  - No business logic — this is a read-only query layer.
"""

from __future__ import annotations

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from models.db.analytics import PlatformEvent


class AnalyticsEngine:

    def __init__(self, db: Session) -> None:
        self._db = db

    # ── Overview ─────────────────────────────────────────────

    def overview(self) -> dict:
        """Platform-wide summary statistics."""
        db = self._db

        total_events = db.query(func.count(PlatformEvent.id)).scalar() or 0
        total_agent_calls = (
            db.query(func.count(PlatformEvent.id))
            .filter(PlatformEvent.event_type == "agent_call")
            .scalar() or 0
        )
        total_chats = (
            db.query(func.count(PlatformEvent.id))
            .filter(PlatformEvent.event_type == "chat_message")
            .scalar() or 0
        )
        total_workflows = (
            db.query(func.count(PlatformEvent.id))
            .filter(PlatformEvent.event_type == "workflow_run")
            .scalar() or 0
        )
        total_projects = (
            db.query(func.count(PlatformEvent.id))
            .filter(PlatformEvent.event_type == "project_run")
            .scalar() or 0
        )
        successful_projects = (
            db.query(func.count(PlatformEvent.id))
            .filter(
                PlatformEvent.event_type == "project_run",
                PlatformEvent.status == "success",
            )
            .scalar() or 0
        )
        avg_duration = (
            db.query(func.avg(PlatformEvent.duration_seconds))
            .filter(PlatformEvent.duration_seconds.isnot(None))
            .scalar()
        )

        return {
            "total_events": total_events,
            "total_agent_calls": total_agent_calls,
            "total_chat_messages": total_chats,
            "total_workflows": total_workflows,
            "total_projects": total_projects,
            "successful_projects": successful_projects,
            "avg_response_seconds": (
                round(float(avg_duration), 2) if avg_duration else None
            ),
        }

    # ── Agents ───────────────────────────────────────────────

    def agent_stats(self) -> list[dict]:
        """Per-agent call statistics — sorted by call volume."""
        db = self._db

        rows = (
            db.query(
                PlatformEvent.agent_name,
                func.count(PlatformEvent.id).label("total_calls"),
                func.avg(PlatformEvent.duration_seconds).label("avg_duration"),
                func.sum(
                    case((PlatformEvent.status == "success", 1), else_=0)
                ).label("success_count"),
                func.sum(
                    case((PlatformEvent.status == "failed", 1), else_=0)
                ).label("failure_count"),
            )
            .filter(
                PlatformEvent.event_type == "agent_call",
                PlatformEvent.agent_name.isnot(None),
            )
            .group_by(PlatformEvent.agent_name)
            .order_by(func.count(PlatformEvent.id).desc())
            .all()
        )

        return [
            {
                "agent": row.agent_name,
                "total_calls": row.total_calls,
                "success_count": int(row.success_count or 0),
                "failure_count": int(row.failure_count or 0),
                "success_rate": (
                    round(int(row.success_count or 0) / row.total_calls * 100, 1)
                    if row.total_calls else 0.0
                ),
                "avg_duration_seconds": (
                    round(float(row.avg_duration), 2)
                    if row.avg_duration else None
                ),
            }
            for row in rows
        ]

    # ── Models ───────────────────────────────────────────────

    def model_stats(self) -> list[dict]:
        """Per-model usage breakdown."""
        db = self._db

        rows = (
            db.query(
                PlatformEvent.model_used,
                func.count(PlatformEvent.id).label("total_calls"),
                func.avg(PlatformEvent.duration_seconds).label("avg_duration"),
            )
            .filter(PlatformEvent.model_used.isnot(None))
            .group_by(PlatformEvent.model_used)
            .order_by(func.count(PlatformEvent.id).desc())
            .all()
        )

        return [
            {
                "model": row.model_used,
                "total_calls": row.total_calls,
                "avg_duration_seconds": (
                    round(float(row.avg_duration), 2)
                    if row.avg_duration else None
                ),
            }
            for row in rows
        ]

    # ── Workflows ────────────────────────────────────────────

    def workflow_stats(self) -> dict:
        """Workflow execution summary."""
        db = self._db

        rows = (
            db.query(
                func.count(PlatformEvent.id).label("total"),
                func.sum(
                    case((PlatformEvent.status == "success", 1), else_=0)
                ).label("successful"),
                func.sum(
                    case((PlatformEvent.status == "failed", 1), else_=0)
                ).label("failed"),
                func.avg(PlatformEvent.duration_seconds).label("avg_duration"),
            )
            .filter(PlatformEvent.event_type == "workflow_run")
            .one()
        )

        total = rows.total or 0
        successful = int(rows.successful or 0)
        failed = int(rows.failed or 0)

        recent = (
            db.query(PlatformEvent)
            .filter(PlatformEvent.event_type == "workflow_run")
            .order_by(PlatformEvent.created_at.desc())
            .limit(5)
            .all()
        )

        return {
            "total": total,
            "successful": successful,
            "failed": failed,
            "success_rate": (
                round(successful / total * 100, 1) if total else 0.0
            ),
            "avg_duration_seconds": (
                round(float(rows.avg_duration), 2) if rows.avg_duration else None
            ),
            "recent": [
                {
                    "id": e.id,
                    "name": (e.extra_data or {}).get("workflow_name", "unnamed"),
                    "status": e.status,
                    "duration": e.duration_seconds,
                    "task_count": (e.extra_data or {}).get("task_count"),
                    "completed": (e.extra_data or {}).get("completed_count"),
                    "created_at": e.created_at.isoformat(),
                }
                for e in recent
            ],
        }

    # ── Projects ─────────────────────────────────────────────

    def project_stats(self) -> dict:
        """Autonomous project execution summary."""
        db = self._db

        rows = (
            db.query(
                func.count(PlatformEvent.id).label("total"),
                func.sum(
                    case((PlatformEvent.status == "success", 1), else_=0)
                ).label("successful"),
                func.avg(PlatformEvent.duration_seconds).label("avg_duration"),
            )
            .filter(PlatformEvent.event_type == "project_run")
            .one()
        )

        total = rows.total or 0
        successful = int(rows.successful or 0)

        return {
            "total": total,
            "successful": successful,
            "failed": total - successful,
            "success_rate": (
                round(successful / total * 100, 1) if total else 0.0
            ),
            "avg_duration_seconds": (
                round(float(rows.avg_duration), 2) if rows.avg_duration else None
            ),
        }

    # ── Timeline ─────────────────────────────────────────────

    def event_timeline(self, limit: int = 50) -> list[dict]:
        """Most recent platform events in reverse chronological order."""
        db = self._db

        events = (
            db.query(PlatformEvent)
            .order_by(PlatformEvent.created_at.desc())
            .limit(min(limit, 200))  # hard cap — never return unbounded data
            .all()
        )

        return [
            {
                "id": e.id,
                "type": e.event_type,
                "agent": e.agent_name,
                "model": e.model_used,
                "status": e.status,
                "duration_seconds": e.duration_seconds,
                "input_chars": e.input_chars,
                "output_chars": e.output_chars,
                "created_at": e.created_at.isoformat(),
            }
            for e in events
        ]


    def safe_agent_stats(self):
        """Safe agent_stats — returns empty list on DB error."""
        try:
            return self.agent_stats()
        except Exception:
            return []

    def safe_event_timeline(self, limit: int = 50):
        """Safe event_timeline — returns empty list on DB error."""
        try:
            return self.event_timeline(limit)
        except Exception:
            return []
