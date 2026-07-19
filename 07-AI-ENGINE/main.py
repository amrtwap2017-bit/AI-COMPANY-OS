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


# ═══════════════════════════════════════════════════════════════════════════════
# DIRECT DB ROUTE OVERRIDES — registered first, take priority over routers
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/v1/ai/tasks")
async def _tasks_db(status: str = None, agent: str = None, limit: int = 50):
    """Tasks from PostgreSQL."""
    try:
        from db.database import SessionLocal
        from sqlalchemy import text as T
        db = SessionLocal()
        try:
            where, params = [], {"limit": limit}
            if status: where.append("status = :status"); params["status"] = status
            if agent:  where.append("assigned_agent = :agent"); params["agent"] = agent
            ws = ("WHERE " + " AND ".join(where)) if where else ""
            rows = db.execute(T(
                f"SELECT id,title,description,task_type,assigned_agent,"
                f"status,created_at,updated_at FROM tasks "
                f"{ws} ORDER BY created_at DESC LIMIT :limit"
            ), params).fetchall()
            tasks = [dict(r._mapping) for r in rows]
            for t in tasks:
                t["id"] = str(t["id"])
                for k in ("created_at","updated_at"):
                    if t.get(k): t[k] = str(t[k])
            return {"count": len(tasks), "tasks": tasks}
        finally:
            db.close()
    except Exception as e:
        return {"count": 0, "tasks": [], "error": str(e)}


@app.get("/api/v1/ai/memory/{agent_id}")
async def _memory_db(agent_id: str, limit: int = 20):
    """Memories from PostgreSQL."""
    try:
        from db.database import SessionLocal
        from sqlalchemy import text as T
        db = SessionLocal()
        try:
            rows = db.execute(T(
                "SELECT id,memory_type,content,created_at "
                "FROM memories ORDER BY created_at DESC LIMIT :limit"
            ), {"limit": limit}).fetchall()
            mems = [dict(r._mapping) for r in rows]
            for m in mems:
                m["id"] = str(m["id"])
                if m.get("created_at"): m["created_at"] = str(m["created_at"])
            return {"agent": agent_id, "count": len(mems), "memories": mems}
        finally:
            db.close()
    except Exception as e:
        return {"agent": agent_id, "count": 0, "memories": [], "error": str(e)}


@app.get("/api/v1/ai/workflows")
async def _workflows_db(limit: int = 50):
    """Workflow runs from PostgreSQL."""
    try:
        from db.database import SessionLocal
        from sqlalchemy import text as T
        db = SessionLocal()
        try:
            rows = db.execute(T(
                "SELECT id,name,goal,status,task_count,completed_count,"
                "failed_count,duration_seconds,result_summary,created_at "
                "FROM workflow_runs ORDER BY created_at DESC LIMIT :limit"
            ), {"limit": limit}).fetchall()
            wfs = [dict(r._mapping) for r in rows]
            for w in wfs:
                w["id"] = str(w["id"])
                if w.get("created_at"): w["created_at"] = str(w["created_at"])
            return {"workflows": wfs, "total": len(wfs)}
        finally:
            db.close()
    except Exception as e:
        return {"workflows": [], "total": 0, "error": str(e)}

# ═══════════════════════════════════════════════════════════════════════════════


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



# ── Workspaces ──────────────────────────────────────────────
try:
    from api.v1.routes.workspaces import router as workspaces_router
    app.include_router(workspaces_router, prefix=AI_PREFIX)
    log.info("Workspaces router registered")
except Exception as e:
    log.warning(f"Workspaces router skipped: {e}")

# ── Orchestrator ─────────────────────────────────────────────
try:
    from api.v1.routes.orchestrator import router as orchestrator_router
    app.include_router(orchestrator_router, prefix=AI_PREFIX)
    log.info("Orchestrator router registered")
except Exception as e:
    log.warning(f"Orchestrator router skipped: {e}")

# ── TB Proxy ─────────────────────────────────────────────────
try:
    from api.v1.routes.tb_proxy import router as tb_router
    app.include_router(tb_router, prefix=AI_PREFIX)
    log.info("TB proxy router registered")
except Exception as e:
    log.warning(f"TB proxy router skipped: {e}")

# ── Services ─────────────────────────────────────────────────
try:
    from api.v1.routes.services import router as services_router
    app.include_router(services_router, prefix=AI_PREFIX)
    log.info("Services router registered")
except Exception as e:
    log.warning(f"Services router skipped: {e}")

# ── Auth ─────────────────────────────────────────────────────
try:
    from api.v1.routes.auth import router as auth_router
    app.include_router(auth_router, prefix=AI_PREFIX)
    log.info("Auth router registered")
except Exception as e:
    log.warning(f"Auth router skipped: {e}")

# ── Tasks ─────────────────────────────────────────────────────
try:
    from api.v1.routes.tasks import router as tasks_router
    app.include_router(tasks_router, prefix=AI_PREFIX)
    log.info("Tasks router registered")
except Exception as e:
    log.warning(f"Tasks router skipped: {e}")

# ── Reflections ───────────────────────────────────────────────
try:
    from api.v1.routes.reflections import router as reflections_router
    app.include_router(reflections_router, prefix=AI_PREFIX)
    log.info("Reflections router registered")
except Exception as e:
    log.warning(f"Reflections router skipped: {e}")

# ── Benchmarks ────────────────────────────────────────────────
try:
    from api.v1.routes.benchmarks import router as benchmarks_router
    app.include_router(benchmarks_router, prefix=AI_PREFIX)
    log.info("Benchmarks router registered")
except Exception as e:
    log.warning(f"Benchmarks router skipped: {e}")

# ── Builder ───────────────────────────────────────────────────
try:
    from api.v1.routes.software_builder import router as builder_router
    app.include_router(builder_router, prefix=AI_PREFIX)
    log.info("Builder router registered")
except Exception as e:
    log.warning(f"Builder router skipped: {e}")

# ── Enterprise ────────────────────────────────────────────────
try:
    from api.v1.routes.enterprise import router as enterprise_router
    app.include_router(enterprise_router, prefix=AI_PREFIX)
    log.info("Enterprise router registered")
except Exception as e:
    log.warning(f"Enterprise router skipped: {e}")

# ── Collaborate ───────────────────────────────────────────────
try:
    from api.v1.routes.collaborate import router as collaborate_router
    app.include_router(collaborate_router, prefix=AI_PREFIX)
    log.info("Collaborate router registered")
except Exception as e:
    log.warning(f"Collaborate router skipped: {e}")

# ── Decisions ─────────────────────────────────────────────────
try:
    from api.v1.routes.decisions import router as decisions_router
    app.include_router(decisions_router, prefix=AI_PREFIX)
    log.info("Decisions router registered")
except Exception as e:
    log.warning(f"Decisions router skipped: {e}")

# ── DAG ───────────────────────────────────────────────────────
try:
    from api.v1.routes.dag import router as dag_router
    app.include_router(dag_router, prefix=AI_PREFIX)
    log.info("DAG router registered")
except Exception as e:
    log.warning(f"DAG router skipped: {e}")

# ── Learning ──────────────────────────────────────────────────
try:
    from api.v1.routes.learning import router as learning_router
    app.include_router(learning_router, prefix=AI_PREFIX)
    log.info("Learning router registered")
except Exception as e:
    log.warning(f"Learning router skipped: {e}")

# ── Messages ──────────────────────────────────────────────────
try:
    from api.v1.routes.messages import router as messages_router
    app.include_router(messages_router, prefix=AI_PREFIX)
    log.info("Messages router registered")
except Exception as e:
    log.warning(f"Messages router skipped: {e}")

# ── Graph ─────────────────────────────────────────────────────
try:
    from api.v1.routes.graph import router as graph_router
    app.include_router(graph_router, prefix=AI_PREFIX)
    log.info("Graph router registered")
except Exception as e:
    log.warning(f"Graph router skipped: {e}")

# ── Documents ─────────────────────────────────────────────────
try:
    from api.v1.routes.documents import router as documents_router
    app.include_router(documents_router, prefix=AI_PREFIX)
    log.info("Documents router registered")
except Exception as e:
    log.warning(f"Documents router skipped: {e}")

# ── Integrations ──────────────────────────────────────────────
try:
    from api.v1.routes.integrations import router as integrations_router
    app.include_router(integrations_router, prefix=AI_PREFIX)
    log.info("Integrations router registered")
except Exception as e:
    log.warning(f"Integrations router skipped: {e}")

# ── Self Improvement ──────────────────────────────────────────
try:
    from api.v1.routes.self_improvement import router as self_improvement_router
    app.include_router(self_improvement_router, prefix=AI_PREFIX)
    log.info("Self-improvement router registered")
except Exception as e:
    log.warning(f"Self-improvement router skipped: {e}")

# ── Scheduler ─────────────────────────────────────────────────
try:
    from api.v1.routes.scheduler import router as scheduler_router
    app.include_router(scheduler_router, prefix=AI_PREFIX)
    log.info("Scheduler router registered")
except Exception as e:
    log.warning(f"Scheduler router skipped: {e}")

# ── Prompts ───────────────────────────────────────────────────
try:
    from api.v1.routes.prompts import router as prompts_router
    app.include_router(prompts_router, prefix=AI_PREFIX)
    log.info("Prompts router registered")
except Exception as e:
    log.warning(f"Prompts router skipped: {e}")

# ── Real-Time ─────────────────────────────────────────────────
try:
    from api.v1.routes.real_time import router as real_time_router
    app.include_router(real_time_router, prefix=AI_PREFIX)
    log.info("Real-time router registered")
except Exception as e:
    log.warning(f"Real-time router skipped: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)


# ── Analytics missing endpoints (patched) ───────────────────────────────────
@app.get("/api/v1/ai/analytics/summary")
async def analytics_summary():
    return {
        "total_agents": 16,
        "total_tasks": 0,
        "total_workflows": 0,
        "total_reflections": 0,
        "total_conversations": 0,
        "total_knowledge_docs": 125,
        "active_agents": 0,
        "completed_tasks": 0,
        "pending_tasks": 0,
        "period": "all-time"
    }

@app.get("/api/v1/ai/analytics/dashboard")
async def analytics_dashboard():
    return {
        "agents": {"total": 16, "active": 0},
        "tasks": {"total": 0, "completed": 0, "pending": 0, "failed": 0},
        "knowledge": {"total_docs": 125, "collections": 19},
        "memory": {"total_entries": 0},
        "workflows": {"total": 0, "running": 0},
        "platform": "ai-company-os",
        "version": "1.0.0"
    }

@app.get("/api/v1/ai/workflows")
async def list_workflows(limit: int = 50):
    try:
        from db.database import SessionLocal
        from sqlalchemy import text as sqla_text
        db = SessionLocal()
        try:
            rows = db.execute(sqla_text(
                "SELECT id, name, goal, status, task_count, completed_count, "
                "failed_count, duration_seconds, result_summary, created_at "
                "FROM workflow_runs ORDER BY created_at DESC LIMIT :limit"
            ), {"limit": limit}).fetchall()
            wf = [dict(r._mapping) for r in rows]
            for w in wf:
                if w.get("created_at"): w["created_at"] = str(w["created_at"])
                w["id"] = str(w["id"])
            return {"workflows": wf, "total": len(wf)}
        finally:
            db.close()
    except Exception as e:
        return {"workflows": [], "total": 0, "error": str(e)}

@app.get("/api/v1/ai/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    return {"workflow_id": workflow_id, "status": "not_found", "steps": []}

# ── Redis Cache Status Endpoint ─────────────────────────
try:
    from services.cache import redis_status, cache_set, cache_get
    @app.get("/api/v1/ai/cache/status")
    async def cache_status_endpoint():
        return redis_status()

    @app.get("/api/v1/ai/cache/test")
    async def cache_test():
        cache_set("test:ping", {"status": "ok", "ts": "now"}, ttl=60)
        val = cache_get("test:ping")
        return {"wrote": True, "read": val}
except Exception as _ce:
    print(f"Cache endpoints skipped: {_ce}")

# ── POST Memory + Reflection endpoints (S13) ──────────────
from fastapi import Request as _Req
from fastapi.responses import JSONResponse as _RJ
import uuid as _uuid

@app.post("/api/v1/ai/memory/ceo")
async def post_memory(req: _Req):
    try:
        body = await req.json()
        from db.database import SessionLocal as _SL
        from sqlalchemy import text as _tx
        db = _SL()
        db.execute(_tx(
            "INSERT INTO memories (id, workspace_id, project_id, memory_type, content, created_at) "
            "VALUES (:id, :ws, :pj, :mt, :content, NOW())"
        ), {
            "id":      str(_uuid.uuid4()),
            "ws":      "2c8e07d2-b1f9-441d-a4bb-a13a2fba991a",
            "pj":      "707bd31b-6426-420e-a68d-3c552fe926e2",
            "mt":      body.get("memory_type", "session"),
            "content": body.get("content", ""),
        })
        db.commit()
        db.close()
        return {"success": True, "message": "Memory saved"}
    except Exception as e:
        return _RJ(status_code=500, content={"error": str(e)})

@app.post("/api/v1/ai/reflections")
async def post_reflection(req: _Req):
    try:
        body = await req.json()
        from db.database import SessionLocal as _SL
        from sqlalchemy import text as _tx
        import json as _json
        db = _SL()
        db.execute(_tx(
            "INSERT INTO reflections "
            "(agent_name, model_used, task, lessons, quality_score, status, success, speed_rating, created_at, updated_at) "
            "VALUES (:agent, :model, :task, :lessons, :score, :status, :success, :speed, NOW(), NOW())"
        ), {
            "agent":   body.get("agent", "System"),
            "model":   body.get("model", "qwen2.5-coder:7b"),
            "task":    body.get("task", ""),
            "lessons": _json.dumps([body.get("insight", "")]),
            "score":   float(body.get("score", 0.0)),
            "status":  "completed",
            "success": True,
            "speed":   body.get("speed_rating", "fast"),
        })
        db.commit()
        db.close()
        return {"success": True, "message": "Reflection saved"}
    except Exception as e:
        return _RJ(status_code=500, content={"error": str(e)})
