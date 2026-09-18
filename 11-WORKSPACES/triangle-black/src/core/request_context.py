"""
Request Correlation Middleware — V15 P1
Adds request_id and correlation_id to every HTTP request.
Enables: tracing HTTP → service → DB → notification → audit.

USAGE in services:
    from src.core.request_context import get_current_request_id
    request_id = get_current_request_id()
"""
from __future__ import annotations
import uuid
import logging
from typing import Optional
from contextvars import ContextVar

logger = logging.getLogger("tb.request")

# Context variable — survives async context switches
_request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
_hotel_id_var: ContextVar[Optional[str]] = ContextVar("hotel_id", default=None)


def get_current_request_id() -> Optional[str]:
    """Get current request ID from context (usable in services/repositories)."""
    return _request_id_var.get()


def get_current_hotel_id() -> Optional[str]:
    """Get current hotel ID from context."""
    return _hotel_id_var.get()


class RequestContextMiddleware:
    """
    ASGI middleware that:
    1. Generates or propagates request_id
    2. Adds X-Request-ID to response headers
    3. Sets context vars for service-layer tracing
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return

        # Extract or generate request ID
        headers = dict(scope.get("headers", []))
        incoming_id = headers.get(b"x-request-id", b"").decode("utf-8", errors="ignore")
        request_id = incoming_id or f"tb-{uuid.uuid4().hex[:12]}"

        # Set in context
        token = _request_id_var.set(request_id)

        async def send_with_request_id(message):
            if message["type"] == "http.response.start":
                # Add request ID to response headers
                headers_list = list(message.get("headers", []))
                headers_list.append(
                    (b"x-request-id", request_id.encode("utf-8"))
                )
                message = {**message, "headers": headers_list}
            await send(message)

        try:
            await self.app(scope, receive, send_with_request_id)
        finally:
            _request_id_var.reset(token)
