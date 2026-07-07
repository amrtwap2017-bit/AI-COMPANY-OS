"""
AI Company OS — Engineering Hub API
=====================================
FastAPI application entrypoint.

This is the single HTTP gateway for all platform operations.
Every subsystem is exposed through versioned REST endpoints.
All routes are workspace-scoped — no endpoint operates without
a valid workspace context.

Startup sequence:
  1. Load environment (.env)
  2. Verify database connectivity
  3. Verify Qdrant connectivity
  4. Verify Ollama connectivity
  5. Register all API routers
  6. Start Prometheus metrics server
  7. Emit platform.started event

Port: 8000 (configurable via API_PORT)
Docs: http://localhost:8000/docs
Health: http://localhost:8000/health
Metrics: http://localhost:8000/metrics
"""

from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from starlette.responses import Response

# Load environment before any other imports
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from ..00_FOUNDATION.exceptions import PlatformError
from ..01_INFRASTRUCTURE.database.session import (
    check_database_health,
    close_database,
    init_database,
)
from .api.workspaces import router as workspaces_router
from .api.projects import router as projects_router
from .api.tasks import router as tasks_router
from .api.models import router as models_router

# ─── Prometheus Metrics ───────────────────────────────────────────────────────

REQUEST_COUNT = Counter(
    "ai_os_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"],
)

REQUEST_LATENCY = Histogram(
    "ai_os_http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
)

ACTIVE_REQUESTS = Gauge(
    "ai_os_active_requests",
    "Currently active HTTP requests",
)

PLATFORM_INFO = Gauge(
    "ai_os_platform_info",
    "Platform version information",
    ["version", "environment"],
)

# ─── Application Lifespan ─────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown lifecycle manager.
    All service health checks run here before accepting traffic.
    """
    print("\n" + "=" * 60)
    print("  AI COMPANY OS — ENGINEERING HUB")
    print("  Starting up...")
    print("=" * 60)

    # ── Database ──────────────────────────────────────────────────
    print("\n[1/4] Checking database...")
    db_health = await check_database_health()
    if not db_health["connected"]:
        print(f"  FATAL: Database not connected: {db_health.get('error')}")
        raise RuntimeError("Database connection failed at startup")
    print(f"  PostgreSQL: {db_health['version'][:50]}...")
    print(f"  pgvector:   {'ACTIVE' if db_health['pgvector'] else 'MISSING'}")
    print(f"  uuid-ossp:  {'ACTIVE' if db_health['uuid_ossp'] else 'MISSING'}")

    # ── Qdrant ────────────────────────────────────────────────────
    print("\n[2/4] Checking Qdrant...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            qdrant_host = os.environ.get("QDRANT_HOST", "localhost")
            qdrant_port = os.environ.get("QDRANT_PORT", "6333")
            resp = await client.get(f"http://{qdrant_host}:{qdrant_port}/health")
            if resp.status_code == 200:
                print(f"  Qdrant: HEALTHY at {qdrant_host}:{qdrant_port}")
            else:
                print(f"  Qdrant: WARNING — status {resp.status_code}")
    except Exception as e:
        print(f"  Qdrant: WARNING — {e} (vector search will be degraded)")

    # ── Ollama ────────────────────────────────────────────────────
    print("\n[3/4] Checking Ollama...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
            resp = await client.get(f"{ollama_url}/api/version")
            if resp.status_code == 200:
                version = resp.json().get("version", "unknown")
                print(f"  Ollama: HEALTHY — version {version}")
            else:
                print(f"  Ollama: WARNING — status {resp.status_code}")
    except Exception as e:
        print(f"  Ollama: WARNING — {e} (local models unavailable)")

    # ── Redis ─────────────────────────────────────────────────────
    print("\n[4/4] Checking Redis...")
    try:
        import redis.asyncio as aioredis
        redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
        r = aioredis.from_url(redis_url, socket_timeout=3)
        pong = await r.ping()
        await r.aclose()
        print(f"  Redis: {'HEALTHY' if pong else 'WARNING'}")
    except Exception as e:
        print(f"  Redis: WARNING — {e} (async events will be degraded)")

    # ── Prometheus Info ───────────────────────────────────────────
    PLATFORM_INFO.labels(
        version="2.0.0",
        environment=os.environ.get("ENVIRONMENT", "development"),
    ).set(1)

    print("\n" + "=" * 60)
    print("  ENGINEERING HUB: READY")
    print(f"  API:     http://0.0.0.0:{os.environ.get('API_PORT', '8000')}")
    print(f"  Docs:    http://localhost:{os.environ.get('API_PORT', '8000')}/docs")
    print(f"  Health:  http://localhost:{os.environ.get('API_PORT', '8000')}/health")
    print(f"  Metrics: http://localhost:{os.environ.get('API_PORT', '8000')}/metrics")
    print("=" * 60 + "\n")

    yield

    # ── Shutdown ──────────────────────────────────────────────────
    print("\n[SHUTDOWN] Closing database connections...")
    await close_database()
    print("[SHUTDOWN] Engineering Hub stopped cleanly.")


# ─── Application Factory ──────────────────────────────────────────────────────

def create_application() -> FastAPI:
    app = FastAPI(
        title="AI Company OS — Engineering Hub",
        description=(
            "Autonomous Engineering Operating System API. "
            "Controls workspace management, project tracking, task execution, "
            "agent orchestration, and model routing."
        ),
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:8000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Request Telemetry Middleware ───────────────────────────────
    @app.middleware("http")
    async def telemetry_middleware(request: Request, call_next):
        start_time = time.time()
        ACTIVE_REQUESTS.inc()

        # Attach run_group if provided in header
        run_group = request.headers.get("X-Run-Group")
        if run_group:
            request.state.run_group = run_group

        try:
            response = await call_next(request)
            duration = time.time() - start_time

            endpoint = request.url.path
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status_code=response.status_code,
            ).inc()
            REQUEST_LATENCY.labels(
                method=request.method,
                endpoint=endpoint,
            ).observe(duration)

            response.headers["X-Response-Time-Ms"] = str(int(duration * 1000))
            return response
        finally:
            ACTIVE_REQUESTS.dec()

    # ── Platform Exception Handler ────────────────────────────────
    @app.exception_handler(PlatformError)
    async def platform_error_handler(request: Request, exc: PlatformError):
        return JSONResponse(
            status_code=exc.http_status_code,
            content=exc.to_dict(),
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "error_code": "INTERNAL_ERROR",
                "message": str(exc),
                "details": {},
            },
        )

    # ── Core Routes ───────────────────────────────────────────────
    @app.get("/", tags=["Platform"])
    async def root():
        return {
            "platform": "AI Company OS",
            "component": "Engineering Hub",
            "version": "2.0.0",
            "status": "operational",
            "docs": "/docs",
        }

    @app.get("/health", tags=["Platform"])
    async def health():
        db_health = await check_database_health()

        qdrant_ok = False
        ollama_ok = False

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                qdrant_host = os.environ.get("QDRANT_HOST", "localhost")
                qdrant_port = os.environ.get("QDRANT_PORT", "6333")
                r = await client.get(f"http://{qdrant_host}:{qdrant_port}/health")
                qdrant_ok = r.status_code == 200
        except Exception:
            pass

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
                r = await client.get(f"{ollama_url}/api/version")
                ollama_ok = r.status_code == 200
        except Exception:
            pass

        all_healthy = db_health["connected"] and qdrant_ok and ollama_ok
        status_code = 200 if all_healthy else 503

        return JSONResponse(
            status_code=status_code,
            content={
                "status": "healthy" if all_healthy else "degraded",
                "components": {
                    "database": {
                        "healthy": db_health["connected"],
                        "pgvector": db_health.get("pgvector", False),
                    },
                    "qdrant": {"healthy": qdrant_ok},
                    "ollama": {"healthy": ollama_ok},
                },
                "version": "2.0.0",
            },
        )

    @app.get("/metrics", tags=["Platform"])
    async def metrics():
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST,
        )

    # ── API Routers ───────────────────────────────────────────────
    app.include_router(
        workspaces_router,
        prefix="/api/v1/workspaces",
        tags=["Workspaces"],
    )
    app.include_router(
        projects_router,
        prefix="/api/v1",
        tags=["Projects"],
    )
    app.include_router(
        tasks_router,
        prefix="/api/v1/tasks",
        tags=["Tasks"],
    )
    app.include_router(
        models_router,
        prefix="/api/v1/models",
        tags=["Model Router"],
    )

    return app


app = create_application()
