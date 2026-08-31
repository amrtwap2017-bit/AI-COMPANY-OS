"""
V7-022 — Triangle Black API Governance Standards
Utilities for consistent API responses across all endpoints.

STANDARDS:
  All responses include X-Request-ID (middleware)
  All responses include X-API-Version: 7.0 (middleware)
  All responses include X-DB-Query-Count (middleware)
  Error format: {"detail": "...", "code": "...", "request_id": "..."}
  List format: {"data": [...], "count": N, "hotel_id": "...", "limit": N}
  Success format: {"success": True, "message": "...", "data": {...}}
"""
from __future__ import annotations
from typing import Any, Optional


API_VERSION = "7.0"


def list_response(
    data: list,
    hotel_id: str,
    limit: int,
    offset: int = 0,
    total: Optional[int] = None,
    extra: Optional[dict] = None,
) -> dict:
    """
    Standard list response envelope for V7 endpoints.
    Provides consistent count, pagination metadata, and hotel scoping.

    Usage:
        return list_response(results, hotel_id=hotel_id, limit=limit)
    """
    count = len(data)
    response = {
        "hotel_id": hotel_id,
        "count": count,
        "limit": limit,
        "offset": offset,
        "data": data,
    }
    if total is not None:
        response["total"] = total
        response["has_more"] = (offset + count) < total
    if extra:
        response.update(extra)
    return response


def success_response(
    message: str,
    data: Optional[Any] = None,
    hotel_id: Optional[str] = None,
) -> dict:
    """
    Standard success response for mutations (POST/PUT/DELETE).

    Usage:
        return success_response("Asset created", data={"id": asset_id})
    """
    response: dict = {"success": True, "message": message}
    if hotel_id:
        response["hotel_id"] = hotel_id
    if data is not None:
        response["data"] = data
    return response


def error_response(
    message: str,
    code: str = "ERROR",
    details: Optional[Any] = None,
    status_hint: int = 400,
) -> dict:
    """
    Standard error response body (use with HTTPException or direct return).

    Usage:
        raise HTTPException(status_code=404, detail=error_response("Not found", "NOT_FOUND"))
    """
    response: dict = {
        "detail": message,
        "code": code,
        "status": status_hint,
    }
    if details:
        response["details"] = details
    return response


# ── API CONTRACT CONSTANTS ───────────────────────────────────────────────────

REQUIRED_RESPONSE_HEADERS = [
    "x-request-id",
    "content-type",
]

REQUIRED_INTELLIGENCE_HEADERS = [
    "x-request-id",
    "x-api-version",
    "content-type",
]

# Error codes — use these consistently
ERROR_CODES = {
    "NOT_FOUND":        "Resource not found",
    "AUTH_REQUIRED":    "Authentication required",
    "FORBIDDEN":        "Access denied",
    "VALIDATION_ERROR": "Request validation failed",
    "CONFLICT":         "Resource already exists",
    "RATE_LIMITED":     "Too many requests",
    "INTERNAL_ERROR":   "Internal server error",
    "DATA_QUALITY":     "Insufficient data quality for this operation",
}
