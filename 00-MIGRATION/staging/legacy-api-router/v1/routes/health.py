"""
app/api/v1/routes/health.py
────────────────────────────────────────────────────────────────
Health check endpoints for production monitoring.

GET /health        Full health check with all service states
GET /health/live   Liveness probe (is process running?)
GET /health/ready  Readiness probe (can serve traffic?)
GET /health/db     Database-only check
"""

from __future__ import annotations

import time
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


def _check_postgres() -> dict:
    start = time.perf_counter()
    try:
        from app.db.database import check_db_connection
        ok = check_db_connection()
        return {
            "status":    "ok" if ok else "error",
            "latency_ms": round((time.perf_counter() - start) * 1000, 1),
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


def _check_ollama() -> dict:
    start = time.perf_counter()
    try:
        from app.services.ollama import ollama_service
        models = ollama_service.list_models()
        return {
            "status":     "ok",
            "models":     len(models),
            "latency_ms": round((time.perf_counter() - start) * 1000, 1),
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


def _check_qdrant() -> dict:
    start = time.perf_counter()
    try:
        from app.vector.qdrant import vector_service
        ok = vector_service.health()
        colls = vector_service.list_collections() if ok else []
        return {
            "status":      "ok" if ok else "error",
            "collections": len(colls),
            "latency_ms":  round((time.perf_counter() - start) * 1000, 1),
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


def _check_memory_store() -> dict:
    try:
        from app.memory.vector_store import memory_vector_store
        stats = memory_vector_store.collection_stats()
        return {
            "status": "ok" if stats.get("ready") else "error",
            "points": stats.get("points_count", 0),
        }
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


@router.get("/health")
def health_check() -> dict:
    """
    Full health check.
    Returns status of every external dependency.
    """
    postgres = _check_postgres()
    ollama   = _check_ollama()
    qdrant   = _check_qdrant()
    memory   = _check_memory_store()

    all_ok = all(
        s["status"] == "ok"
        for s in [postgres, ollama, qdrant]
    )

    return {
        "status":      "healthy" if all_ok else "degraded",
        "service":     settings.APP_NAME,
        "version":     settings.APP_VERSION,
        "environment": settings.ENV,
        "checks": {
            "postgres":     postgres,
            "ollama":       ollama,
            "qdrant":       qdrant,
            "memory_store": memory,
        },
    }


@router.get("/health/live")
def liveness() -> dict:
    """
    Liveness probe.
    Returns 200 if the process is running.
    Used by Docker/k8s to decide whether to restart the container.
    """
    return {"status": "alive", "service": settings.APP_NAME}


@router.get("/health/ready")
def readiness() -> dict:
    """
    Readiness probe.
    Returns 200 only if the app can serve traffic.
    Used by load balancers to route requests.
    """
    postgres = _check_postgres()
    if postgres["status"] != "ok":
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail={"status": "not_ready", "reason": "database unavailable"},
        )
    return {"status": "ready", "service": settings.APP_NAME}


@router.get("/health/db")
def database_health() -> dict:
    """Database-specific health check with connection pool stats."""
    postgres = _check_postgres()
    try:
        from app.db.database import engine
        pool = engine.pool
        return {
            **postgres,
            "pool": {
                "size":        pool.size(),
                "checked_in":  pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow":    pool.overflow(),
            },
        }
    except Exception:
        return postgres
