"""
AI Company OS — AI Engine Entry Point
======================================
Serves all AI OS capabilities under /api/v1/ai/
Runs independently from the Business API (triangle-black).
Port: 8001
Business API: 8000
"""
from __future__ import annotations
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

log = logging.getLogger(__name__)

# ── Lifespan ──────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("AI Engine starting...")

    # Analytics background writer
    try:
        from analytics.background import start as start_analytics
        start_analytics()
        log.info("Analytics background writer started")
    except Exception as e:
        log.warning(f"Analytics background writer skipped: {e}")

    # Memory vector store
    try:
        from memory.vector_store import memory_vector_store
        memory_vector_store.setup()
        log.info("Memory vector store ready")
    except Exception as e:
        log.warning(f"Memory vector store skipped: {e}")

    # Platform scheduler
    try:
        from core.scheduler import scheduler
        scheduler.start()
        log.info("Platform scheduler started")
    except Exception as e:
        log.warning(f"Scheduler skipped: {e}")

    log.info("AI Engine ready on port 8001")
    yield

    log.info("AI Engine shutting down...")
    try:
        from analytics.background import stop as stop_analytics
        stop_analytics()
    except Exception:
        pass
    try:
        from core.scheduler import scheduler
        scheduler.stop()
    except Exception:
        pass
    log.info("AI Engine shutdown complete")


# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="AI Company OS — AI Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Rate Limiter ──────────────────────────────────────────────
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except Exception:
    pass

# ── Middleware ────────────────────────────────────────────────
import uuid

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# ── Exception Handler ─────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    log.exception("Unhandled exception %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "request_id": request_id},
    )

# ── Routes ────────────────────────────────────────────────────
AI_PREFIX = "/api/v1/ai"

# Health — always first
@app.get(f"{AI_PREFIX}/health")
def health():
    return {"status": "ok", "service": "ai-engine", "version": "1.0.0"}

@app.get("/")
def root():
    return {"service": "AI Company OS — AI Engine", "version": "1.0.0", "docs": "/docs"}

# Agents
try:
    from agents.registry import list_agents
    @app.get(f"{AI_PREFIX}/agents")
    def get_agents():
        return {"agents": list_agents()}
    log.info("Agents route registered")
except Exception as e:
    log.warning(f"Agents route skipped: {e}")

# Analytics
try:
    from api.v1.routes.analytics import router as analytics_router
    app.include_router(analytics_router, prefix=AI_PREFIX)
    log.info("Analytics router registered")
except Exception as e:
    log.warning(f"Analytics router skipped: {e}")

# Memory
try:
    from api.v1.routes.memory import router as memory_router
    app.include_router(memory_router, prefix=AI_PREFIX)
    log.info("Memory router registered")
except Exception as e:
    log.warning(f"Memory router skipped: {e}")

# Knowledge
try:
    from api.v1.routes.knowledge import router as knowledge_router
    app.include_router(knowledge_router, prefix=AI_PREFIX)
    log.info("Knowledge router registered")
except Exception as e:
    log.warning(f"Knowledge router skipped: {e}")

# Chat
try:
    from api.v1.routes.chat import router as chat_router
    app.include_router(chat_router, prefix=AI_PREFIX)
    log.info("Chat router registered")
except Exception as e:
    log.warning(f"Chat router skipped: {e}")

# Workflows
try:
    from api.v1.routes.workflows import router as workflows_router
    app.include_router(workflows_router, prefix=AI_PREFIX)
    log.info("Workflows router registered")
except Exception as e:
    log.warning(f"Workflows router skipped: {e}")

# Tools
try:
    from api.v1.routes.tools import router as tools_router
    app.include_router(tools_router, prefix=AI_PREFIX)
    log.info("Tools router registered")
except Exception as e:
    log.warning(f"Tools router skipped: {e}")

# Projects
try:
    from api.v1.routes.projects import router as projects_router
    app.include_router(projects_router, prefix=AI_PREFIX)
    log.info("Projects router registered")
except Exception as e:
    log.warning(f"Projects router skipped: {e}")

# Models
try:
    from api.v1.routes.models import router as models_router
    app.include_router(models_router, prefix=AI_PREFIX)
    log.info("Models router registered")
except Exception as e:
    log.warning(f"Models router skipped: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
