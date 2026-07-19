"""
Hub API Application — Triangle Black
=====================================
Unified FastAPI gateway for the Hub OS.
"""
from __future__ import annotations
import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from hub.core.loader import platform_layer, get_root
from hub.core import settings, kernel

# ── Resolve platform components ────────────────────────────────────────────────
def _load_session():
    from hub.api.routers._base import load_platform_file
    return load_platform_file("01-INFRASTRUCTURE/database/session.py")

def _load_exceptions():
    from hub.api.routers._base import load_platform_file
    return load_platform_file("00-FOUNDATION/exceptions.py")

db_session = _load_session()
exceptions = _load_exceptions()
PlatformError = exceptions.PlatformError

# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "=" * 60)
    print("  TRIANGLE BLACK — HUB OS API")
    print("=" * 60)

    kernel.initialize()

    # Database health check
    db_health = await db_session.check_database_health()
    if db_health["connected"]:
        print(f"  PostgreSQL : CONNECTED")
        print(f"  pgvector   : {'ACTIVE' if db_health.get('pgvector') else 'MISSING'}")
    else:
        print(f"  PostgreSQL : FAILED — {db_health.get('error')}")

    # Qdrant health check
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"http://{settings.qdrant_host}:{settings.qdrant_port}/health")
            print(f"  Qdrant     : {'HEALTHY' if r.status_code == 200 else 'WARNING'}")
    except Exception as e:
        print(f"  Qdrant     : WARNING — {e}")

    # Ollama health check
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.ollama_url}/api/version")
            print(f"  Ollama     : {'HEALTHY' if r.status_code == 200 else 'WARNING'}")
    except Exception as e:
        print(f"  Ollama     : WARNING — {e}")

    print("=" * 60)
    print(f"  API Docs   : http://localhost:{settings.api_port}/docs")
    print("=" * 60 + "\n")

    yield

    await db_session.close_database()
    print("[HUB OS] Shutdown complete.")

# ── Application Factory ────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title="Triangle Black — Hub OS",
        description="Autonomous Engineering Operating System for Enterprise Hospitality Supply Chain",
        version="2.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def timing_middleware(request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        response.headers["X-Process-Time"] = str(round(time.time() - start, 4))
        return response

    @app.exception_handler(PlatformError)
    async def platform_error_handler(request: Request, exc):
        return JSONResponse(status_code=exc.http_status_code, content=exc.to_dict())

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        return JSONResponse(status_code=500, content={"error": str(exc)})

    @app.get("/", tags=["Platform"])
    async def root():
        return {"platform": "Triangle Black Hub OS", "version": "2.0.0", "status": "operational", "docs": "/docs"}

    @app.get("/health", tags=["Platform"])
    async def health():
        db_health = await db_session.check_database_health()
        return {
            "status": "healthy" if db_health["connected"] else "degraded",
            "database": {"connected": db_health["connected"], "pgvector": db_health.get("pgvector", False)},
            "version": "2.0.0",
        }

    # ── Register Routers ──
    from hub.api.routers import workspaces, projects, tasks, models
    app.include_router(workspaces.router, prefix="/api/v1/workspaces", tags=["Workspaces"])
    app.include_router(projects.router,   prefix="/api/v1/projects",   tags=["Projects"])
    app.include_router(tasks.router,      prefix="/api/v1/tasks",      tags=["Tasks"])
    app.include_router(models.router,     prefix="/api/v1/models",     tags=["Models"])

    return app

app = create_app()
