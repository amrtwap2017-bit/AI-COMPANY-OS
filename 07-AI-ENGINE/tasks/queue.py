"""
app/tasks/queue.py
────────────────────────────────────────────────────────────────
Pure Python background task queue.

Architecture:
  - Bounded in-process queue (thread-safe)
  - ThreadPoolExecutor with configurable workers
  - DB-backed persistence for task status
  - Survives request completion — tasks continue running

No Redis. No Celery. No external dependencies.
Same pattern as app/analytics/background.py — proven in production.

Usage:
    task_id = task_queue.submit(
        task_type="project_run",
        task_name="Q4 Market Analysis",
        params={"name": "Q4 Market Analysis", "goal": "..."},
        handler=run_project_task,
    )
"""

from __future__ import annotations

import logging
import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Any, Callable

log = logging.getLogger(__name__)

MAX_WORKERS    = 2       # parallel long-running tasks
QUEUE_MAXSIZE  = 100     # pending task limit


class TaskItem:
    """One item in the task queue."""

    def __init__(
        self,
        task_id:   int,
        task_type: str,
        task_name: str,
        params:    dict,
        handler:   Callable[[int, dict], Any],
    ) -> None:
        self.task_id   = task_id
        self.task_type = task_type
        self.task_name = task_name
        self.params    = params
        self.handler   = handler


class TaskQueue:
    """
    Thread-safe background task queue.
    Submit tasks from any HTTP handler — they run in the background.
    """

    def __init__(self) -> None:
        self._queue:   queue.Queue[TaskItem | None] = queue.Queue(maxsize=QUEUE_MAXSIZE)
        self._pool:    ThreadPoolExecutor | None    = None
        self._started: bool                         = False
        self._lock:    threading.Lock               = threading.Lock()

    def start(self) -> None:
        """Start the worker pool. Call once on application startup."""
        with self._lock:
            if self._started:
                return
            self._pool    = ThreadPoolExecutor(
                max_workers=MAX_WORKERS,
                thread_name_prefix="task-worker",
            )
            self._started = True
            log.info("TaskQueue started with %d workers", MAX_WORKERS)

    def stop(self) -> None:
        """Drain and stop. Call on application shutdown."""
        try:
            self._queue.put_nowait(None)  # sentinel
        except queue.Full:
            pass
        if self._pool:
            self._pool.shutdown(wait=True, cancel_futures=False)
            log.info("TaskQueue stopped")

    def submit(
        self,
        task_type: str,
        task_name: str,
        params:    dict,
        handler:   Callable[[int, dict], Any],
        submitted_by: str = "system",
    ) -> int:
        """
        Submit a task for background execution.
        Returns the task_id immediately — caller does not wait.
        """
        if not self._started:
            self.start()

        task_id = self._create_db_record(
            task_type=task_type,
            task_name=task_name,
            params=params,
            submitted_by=submitted_by,
        )

        item = TaskItem(
            task_id=task_id,
            task_type=task_type,
            task_name=task_name,
            params=params,
            handler=handler,
        )

        try:
            self._queue.put_nowait(item)
        except queue.Full:
            self._mark_failed(task_id, "Task queue is full — try again later")
            return task_id

        # Submit to thread pool
        if self._pool:
            self._pool.submit(self._drain_one, item)

        log.info(
            "Task submitted: id=%d type=%s name=%r",
            task_id, task_type, task_name,
        )
        return task_id

    def _drain_one(self, item: TaskItem) -> None:
        """Execute one task item. Runs inside a worker thread."""
        start = time.time()
        self._mark_running(item.task_id)

        try:
            # Remove from queue (it was already put there for tracking)
            try:
                self._queue.get_nowait()
                self._queue.task_done()
            except queue.Empty:
                pass

            result = item.handler(item.task_id, item.params)
            duration = time.time() - start

            result_id = getattr(result, "project_id", None) or \
                        getattr(result, "dag_id",     None) or \
                        getattr(result, "collab_id",  None)

            self._mark_complete(item.task_id, result_id, duration)
            log.info(
                "Task complete: id=%d type=%s duration=%.1fs",
                item.task_id, item.task_type, duration,
            )

        except Exception as exc:
            duration = time.time() - start
            self._mark_failed(item.task_id, str(exc), duration)
            log.error(
                "Task failed: id=%d type=%s error=%s",
                item.task_id, item.task_type, exc,
            )

    # ── DB helpers ────────────────────────────────────────────

    def _create_db_record(
        self,
        task_type:    str,
        task_name:    str,
        params:       dict,
        submitted_by: str,
    ) -> int:
        from db.database import SessionLocal
        from models.db.background_task import BackgroundTask

        db = SessionLocal()
        try:
            task = BackgroundTask(
                task_type=task_type,
                task_name=task_name,
                status="pending",
                params=params,
                submitted_by=submitted_by,
                progress=0.0,
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            return task.id
        finally:
            db.close()

    def _mark_running(self, task_id: int) -> None:
        from db.database import SessionLocal
        from models.db.background_task import BackgroundTask

        db = SessionLocal()
        try:
            task = db.query(BackgroundTask).filter(
                BackgroundTask.id == task_id
            ).first()
            if task:
                task.status     = "running"
                task.started_at = datetime.now(timezone.utc).isoformat()
                task.progress   = 0.1
                db.commit()
        finally:
            db.close()

    def _mark_complete(
        self,
        task_id:   int,
        result_id: int | None,
        duration:  float,
    ) -> None:
        from db.database import SessionLocal
        from models.db.background_task import BackgroundTask

        db = SessionLocal()
        try:
            task = db.query(BackgroundTask).filter(
                BackgroundTask.id == task_id
            ).first()
            if task:
                task.status           = "complete"
                task.completed_at     = datetime.now(timezone.utc).isoformat()
                task.duration_seconds = round(duration, 2)
                task.progress         = 1.0
                task.result_id        = result_id
                db.commit()
        finally:
            db.close()

    def _mark_failed(
        self,
        task_id:  int,
        error:    str,
        duration: float = 0.0,
    ) -> None:
        from db.database import SessionLocal
        from models.db.background_task import BackgroundTask

        db = SessionLocal()
        try:
            task = db.query(BackgroundTask).filter(
                BackgroundTask.id == task_id
            ).first()
            if task:
                task.status           = "failed"
                task.error            = error[:2000]
                task.completed_at     = datetime.now(timezone.utc).isoformat()
                task.duration_seconds = round(duration, 2)
                db.commit()
        finally:
            db.close()

    def update_progress(
        self,
        task_id:  int,
        progress: float,
        message:  str = "",
    ) -> None:
        """Update task progress (0.0 to 1.0). Call from within handler."""
        from db.database import SessionLocal
        from models.db.background_task import BackgroundTask

        db = SessionLocal()
        try:
            task = db.query(BackgroundTask).filter(
                BackgroundTask.id == task_id
            ).first()
            if task:
                task.progress         = min(max(progress, 0.0), 1.0)
                task.progress_message = message[:500] if message else None
                db.commit()
        except Exception as exc:
            log.debug("Progress update failed: %s", exc)
        finally:
            db.close()


# Module-level singleton — started by lifespan hook
task_queue = TaskQueue()
