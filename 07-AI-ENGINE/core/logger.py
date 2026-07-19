"""
app/core/logger.py
────────────────────────────────────────────────────────────────
Structured JSON logging for production.

In development: human-readable colored output
In production:  JSON lines for log aggregators (Loki, Datadog, etc.)

Every log line includes:
  timestamp, level, logger, message, request_id (if available)

Usage:
    from core.logger import get_logger
    log = get_logger(__name__)
    log.info("Agent called", extra={"agent": "researcher", "duration": 87.3})
"""

from __future__ import annotations

import logging
import sys
from core.config import settings


def _configure_logging() -> None:
    """Configure the root logger based on environment."""

    if settings.ENV == "production":
        # JSON output for log aggregators
        try:
            from pythonjsonlogger import jsonlogger

            handler = logging.StreamHandler(sys.stdout)
            formatter = jsonlogger.JsonFormatter(
                fmt="%(asctime)s %(name)s %(levelname)s %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%S",
            )
            handler.setFormatter(formatter)

            root = logging.getLogger()
            root.handlers.clear()
            root.addHandler(handler)
            root.setLevel(logging.INFO)

        except ImportError:
            # Fallback if python-json-logger not installed
            _configure_dev_logging()

    else:
        _configure_dev_logging()

    # Silence noisy libraries
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.WARNING if settings.ENV == "production" else logging.INFO
    )
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def _configure_dev_logging() -> None:
    """Human-readable format for development."""
    logging.basicConfig(
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
    )


def get_logger(name: str) -> logging.Logger:
    """Get a named logger. Use this everywhere instead of logging.getLogger."""
    return logging.getLogger(name)


# Configure on import
_configure_logging()

# Module-level default logger
logger = get_logger("ai-company-os")
