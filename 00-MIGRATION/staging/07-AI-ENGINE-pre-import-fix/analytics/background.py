"""
Analytics Background Writer
────────────────────────────────────────────────────────────────
Drains an in-process queue and writes events to the database
in a background thread.

Design decisions:
- Queue is bounded (maxsize=1000) to prevent unbounded memory growth.
- If the queue is full, the event is silently dropped.
  Analytics must NEVER block or fail the main request.
- The writer thread is a daemon — it dies with the process.
- One thread is sufficient; events are low-frequency relative
  to DB write throughput.
"""

import queue
import threading
import logging
from typing import Any

log = logging.getLogger(__name__)

_event_queue: queue.Queue[dict[str, Any] | None] = queue.Queue(maxsize=1000)
_writer_thread: threading.Thread | None = None
_started = False
_lock = threading.Lock()


def _write_loop() -> None:
    """
    Background thread: drain queue, write to DB.
    Runs until None sentinel is received.
    """
    from app.db.database import SessionLocal
    from app.models.db.analytics import PlatformEvent

    while True:
        try:
            item = _event_queue.get(timeout=2.0)
            if item is None:
                break  # shutdown signal

            db = SessionLocal()
            try:
                event = PlatformEvent(**item)
                db.add(event)
                db.commit()
            except Exception as exc:
                log.debug("Analytics write failed: %s", exc)
                db.rollback()
            finally:
                db.close()

        except queue.Empty:
            continue
        except Exception as exc:
            log.debug("Analytics loop error: %s", exc)


def start() -> None:
    """
    Start the background writer thread.
    Safe to call multiple times — only starts once.
    """
    global _writer_thread, _started

    with _lock:
        if _started:
            return
        _writer_thread = threading.Thread(
            target=_write_loop,
            name="analytics-writer",
            daemon=True,
        )
        _writer_thread.start()
        _started = True
        log.info("Analytics background writer started")


def enqueue(event_data: dict[str, Any]) -> None:
    """
    Submit an event for background writing.
    Non-blocking. Drops silently if queue is full.
    """
    try:
        _event_queue.put_nowait(event_data)
    except queue.Full:
        pass  # Drop — analytics must never block


def stop() -> None:
    """
    Gracefully stop the writer thread.
    Called on application shutdown.
    """
    global _started
    try:
        _event_queue.put_nowait(None)  # sentinel
    except queue.Full:
        pass
    _started = False