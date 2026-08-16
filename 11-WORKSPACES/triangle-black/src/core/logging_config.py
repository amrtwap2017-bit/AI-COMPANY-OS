"""
Triangle Black — Structured Logging (Sprint-199)
JSON log format with request_id and hotel_id context.

Usage:
    from src.core.logging_config import get_logger, set_log_context, clear_log_context
    logger = get_logger("my.module")
    set_log_context(request_id="abc123", hotel_id="hotel-001")
    logger.info("Processing work order", extra={"wo_id": "wo-123"})
"""
from __future__ import annotations
import logging
import json
import time
import sys
import os
from contextvars import ContextVar
from typing import Optional

# ── Context variables for per-request data ────────────────────────────────────
_ctx_request_id: ContextVar[str] = ContextVar("request_id", default="")
_ctx_hotel_id:   ContextVar[str] = ContextVar("hotel_id",   default="")
_ctx_actor:      ContextVar[str] = ContextVar("actor",       default="")

def set_log_context(
    request_id: str = "",
    hotel_id:   str = "",
    actor:      str = "",
) -> None:
    if request_id: _ctx_request_id.set(request_id)
    if hotel_id:   _ctx_hotel_id.set(hotel_id)
    if actor:      _ctx_actor.set(actor)

def clear_log_context() -> None:
    _ctx_request_id.set("")
    _ctx_hotel_id.set("")
    _ctx_actor.set("")

def get_log_context() -> dict:
    return {
        "request_id": _ctx_request_id.get(),
        "hotel_id":   _ctx_hotel_id.get(),
        "actor":      _ctx_actor.get(),
    }

# ── JSON log formatter ────────────────────────────────────────────────────────
class TBJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        ctx = get_log_context()
        log_entry = {
            "ts":         time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level":      record.levelname,
            "logger":     record.name,
            "msg":        record.getMessage(),
            "request_id": ctx["request_id"] or getattr(record, "request_id", ""),
            "hotel_id":   ctx["hotel_id"]   or getattr(record, "hotel_id",   ""),
            "actor":      ctx["actor"]      or getattr(record, "actor",       ""),
        }
        # Include any extra fields added via extra= parameter
        for key, val in record.__dict__.items():
            if key not in (
                "name","msg","args","levelname","levelno","pathname","filename",
                "module","exc_info","exc_text","stack_info","lineno","funcName",
                "created","msecs","relativeCreated","thread","threadName",
                "processName","process","request_id","hotel_id","actor","message"
            ):
                try:
                    json.dumps(val)
                    log_entry[key] = val
                except (TypeError, ValueError):
                    log_entry[key] = str(val)

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str)

# ── Setup function ────────────────────────────────────────────────────────────
_configured = False

def setup_logging(level: str = "WARNING", json_format: bool = False) -> None:
    global _configured
    if _configured:
        return
    _configured = True

    log_level = getattr(logging, level.upper(), logging.WARNING)
    use_json  = json_format or os.environ.get("LOG_FORMAT", "").lower() == "json"

    root = logging.getLogger()
    root.setLevel(log_level)

    if root.handlers:
        root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if use_json:
        handler.setFormatter(TBJsonFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s %(levelname)s [%(name)s] %(message)s"
        ))

    root.addHandler(handler)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
