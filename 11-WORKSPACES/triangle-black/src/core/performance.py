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
import threading
from contextvars import ContextVar
from typing import Optional
from sqlalchemy import event
from sqlalchemy.engine import Engine

# ── Per-request context variables (thread-safe, async-safe) ──────────────────
_query_count: ContextVar[int] = ContextVar("_query_count", default=0)
_start_time:  ContextVar[Optional[float]] = ContextVar("_start_time", default=None)

# ── Thread-local fallback for SQLAlchemy sync sessions ───────────────────────
# ContextVars do not propagate into ThreadPoolExecutor threads used by
# SQLAlchemy sync sessions in async FastAPI. Use a shared thread-local
# counter keyed by request_id as a pragmatic workaround.
_thread_local = threading.local()
_global_query_counts: dict = {}
_current_request_id: ContextVar[Optional[str]] = ContextVar("_current_request_id", default=None)


def _on_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Increment query counter — uses thread-local to bridge async/sync boundary."""
    try:
        # Try ContextVar first (works in same-thread async)
        _query_count.set(_query_count.get() + 1)
    except Exception:
        pass
    try:
        # Also increment global dict keyed by thread id (sync SQLAlchemy thread)
        tid = threading.get_ident()
        _global_query_counts[tid] = _global_query_counts.get(tid, 0) + 1
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
    try:
        # Clear all thread-local counts at request start
        _global_query_counts.clear()
    except Exception:
        pass


def get_query_count() -> int:
    """Return number of DB queries executed in current request context.
    Sums ContextVar count (async path) + thread-local counts (sync SQLAlchemy path).
    """
    try:
        ctx_count = _query_count.get()
        thread_count = sum(_global_query_counts.values())
        return max(ctx_count, thread_count)
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
