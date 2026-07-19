"""
app/core/middleware.py
────────────────────────────────────────────────────────────────
Production middleware:
  - RequestIDMiddleware: adds X-Request-ID to every request/response
  - Request timing: logs duration of every request
  - Structured error responses: consistent JSON error format

Request IDs allow tracing a single request across all log lines.
Every log entry that happens during a request should include the ID.
"""

from __future__ import annotations

import time
import uuid
import logging
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

log = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Adds a unique X-Request-ID header to every request and response.
    If the client sends X-Request-ID, that value is used (trust upstream).
    Otherwise a new UUID4 is generated.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = (
            request.headers.get("X-Request-ID")
            or str(uuid.uuid4())
        )

        # Make request_id available to route handlers
        request.state.request_id = request_id

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception as exc:
            log.exception(
                "Unhandled exception",
                extra={"request_id": request_id, "path": request.url.path},
            )
            return JSONResponse(
                status_code=500,
                content={
                    "error":      "Internal server error",
                    "request_id": request_id,
                },
            )

        duration_ms = round((time.perf_counter() - start_time) * 1000, 1)

        # Add headers to response
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        # Log every request (INFO level — not too noisy)
        log.info(
            "%s %s %d %.1fms",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            extra={
                "request_id":  request_id,
                "method":      request.method,
                "path":        request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )

        return response
