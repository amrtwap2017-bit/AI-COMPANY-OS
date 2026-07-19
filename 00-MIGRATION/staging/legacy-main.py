"""
AI Company OS — Application Entry Point
────────────────────────────────────────────────────────────────
Owns:
  - FastAPI app creation
  - Lifespan (startup / shutdown hooks)
  - Middleware registration
  - Route registration
  - Exception handlers

Nothing else lives here.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.router import router
from app.core.config import settings
from app.core.limiter import limiter
import app.core.logger  # configure logging on import


# ── Lifespan ──────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup → serve requests → shutdown.
    All background services start here and stop here.
    """
    import logging
    log = logging.getLogger(__name__)

    # ── Startup ───────────────────────────────────────────────
    log.info(
        "Starting %s v%s [%s]",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.ENV,
    )

    from app.analytics.background import start as start_analytics
    start_analytics()
    log.info("Analytics background writer started")

    from app.tasks.queue import task_queue
    task_queue.start()
    log.info("Background task queue started")

    from app.memory.vector_store import memory_vector_store
    memory_vector_store.setup()
    log.info("Memory vector store ready")

    from app.core.scheduler import scheduler as platform_scheduler
    platform_scheduler.start()
    log.info("Platform scheduler started")

    from app.core.scheduler import scheduler as platform_scheduler
    platform_scheduler.start()
    log.info("Platform scheduler started")

    from app.core.scheduler import scheduler as platform_scheduler
    platform_scheduler.start()
    log.info("Platform scheduler started")

    log.info("🚀 %s is ready", settings.APP_NAME)

    yield  # ← application serves requests here

    # ── Shutdown ──────────────────────────────────────────────
    log.info("Shutting down %s…", settings.APP_NAME)

    from app.analytics.background import stop as stop_analytics
    stop_analytics()

    from app.core.scheduler import scheduler as platform_scheduler
    platform_scheduler.stop()

    from app.core.scheduler import scheduler as platform_scheduler
    platform_scheduler.stop()

    from app.core.scheduler import scheduler as platform_scheduler
    platform_scheduler.stop()

    from app.tasks.queue import task_queue
    task_queue.stop()

    log.info("Shutdown complete")


# ── Application ───────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url="/docs"    if not settings.is_production else None,
    redoc_url="/redoc"  if not settings.is_production else None,
    lifespan=lifespan,
)


# ── Middleware (order matters — first added = outermost) ───────

# 1. Request ID — must be outermost to track all errors
from app.core.middleware import RequestIDMiddleware
app.add_middleware(RequestIDMiddleware)

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
)

# 3. Security headers
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"]        = "DENY"
    response.headers["X-XSS-Protection"]       = "1; mode=block"
    response.headers["Referrer-Policy"]        = "strict-origin-when-cross-origin"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    return response


# ── Exception Handlers ────────────────────────────────────────

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    log = logging.getLogger(__name__)
    request_id = getattr(request.state, "request_id", "unknown")
    log.exception(
        "Unhandled exception on %s %s",
        request.method,
        request.url.path,
        extra={"request_id": request_id},
    )
    return JSONResponse(
        status_code=500,
        content={
            "error":      "Internal server error",
            "request_id": request_id,
        },
    )


# ── Routes ────────────────────────────────────────────────────

app.include_router(router)


# ── Root ──────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "project":     settings.APP_NAME,
        "version":     settings.APP_VERSION,
        "environment": settings.ENV,
        "docs":        "/docs" if not settings.is_production else None,
        "health":      "/api/v1/health",
    }
