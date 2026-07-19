"""
app/tasks/repository.py
────────────────────────────────────────────────────────────────
Database operations for BackgroundTask records.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from models.db.background_task import BackgroundTask


class TaskRepository:

    def __init__(self, db: Session) -> None:
        self._db = db

    def get(self, task_id: int) -> BackgroundTask | None:
        return self._db.query(BackgroundTask).filter(
            BackgroundTask.id == task_id
        ).first()

    def list_all(
        self,
        status:    str | None = None,
        task_type: str | None = None,
        limit:     int        = 50,
    ) -> list[BackgroundTask]:
        q = self._db.query(BackgroundTask)
        if status:
            q = q.filter(BackgroundTask.status == status)
        if task_type:
            q = q.filter(BackgroundTask.task_type == task_type)
        return (
            q.order_by(BackgroundTask.created_at.desc())
            .limit(limit)
            .all()
        )

    def cancel(self, task_id: int) -> bool:
        """
        Cancel a PENDING task.
        Running tasks cannot be cancelled (they are in a thread).
        """
        task = self.get(task_id)
        if not task:
            return False
        if task.status != "pending":
            return False
        task.status = "cancelled"
        self._db.commit()
        return True

    def stats(self) -> dict:
        from sqlalchemy import func
        rows = (
            self._db.query(
                BackgroundTask.status,
                func.count(BackgroundTask.id).label("count"),
            )
            .group_by(BackgroundTask.status)
            .all()
        )
        return {r.status: r.count for r in rows}
