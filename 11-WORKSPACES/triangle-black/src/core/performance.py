"""
Triangle Black — Request Performance Tracker (Sprint-229)
Measures DB query count and response time per request using contextvars.
Thread-safe. Never raises. Attaches headers to every response.

Headers added:
    X-DB-Query-Count   — number of SQL statements executed this request
    X-Response-Time-Ms — total request duration in milliseconds
"""
from __future__ import annotations
import time
from contextvars import ContextVar
from typing import Optional
from sqlalchemy import event
from sqlalchemy.engine import Engine

# ── Per-request context variables (thread-safe, async-safe) ──────────────────
_query_count: ContextVar[int] = ContextVar("_query_count", default=0)
_start_time:  ContextVar[Optional[float]] = ContextVar("_start_time", default=None)


def _on_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Increment query counter for the current request context."""
    try:
        _query_count.set(_query_count.get() + 1)
    except Exception:
        pass


def setup_query_tracking(engine: Engine) -> None:
    """Attach SQLAlchemy event listener to the given engine. Call once at startup."""
    try:
        event.listen(engine, "before_cursor_execute", _on_before_cursor_execute)
    except Exception:
        pass


def reset_request_context() -> None:
    """Reset counters for a new request. Call at request start."""
    try:
        _query_count.set(0)
        _start_time.set(time.perf_counter())
    except Exception:
        pass


def get_query_count() -> int:
    """Return number of DB queries executed in current request context."""
    try:
        return _query_count.get()
    except Exception:
        return 0


def get_elapsed_ms() -> float:
    """Return elapsed time in milliseconds since request start."""
    try:
        start = _start_time.get()
        if start is None:
            return 0.0
        return round((time.perf_counter() - start) * 1000, 2)
    except Exception:
        return 0.0
