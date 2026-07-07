"""
AI Company OS — Standalone API Runner
======================================
Self-contained FastAPI application.
No relative imports. No package hierarchy required.
Imports directly from file paths using importlib.

Run with:
    cd ~/AI-COMPANY-OS
    source .venv/bin/activate
    python3 run_api.py
"""

from __future__ import annotations

import os
import sys
import time
from contextlib import asynccontextmanager
from uuid import UUID, uuid4
from typing import Optional, Any
import re

# ── Environment ───────────────────────────────────────────────────────────────
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://ai:ai123@localhost:5432/ai_company_os")
os.environ.setdefault("QDRANT_HOST", "localhost")
os.environ.setdefault("QDRANT_PORT", "6333")
os.environ.setdefault("OLLAMA_BASE_URL", "http://localhost:11434")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("WORKSPACE_BASE_PATH", "/home/amr/AI-COMPANY-OS/11-WORKSPACES")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("DEBUG", "true")

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv("/home/amr/AI-COMPANY-OS/.env")
except ImportError:
    pass

import httpx
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
from cryptography.fernet import Fernet

# ── Database Setup ────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass

_engine = None
_session_factory = None

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            os.environ["DATABASE_URL"],
            echo=False,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
        )
    return _engine

def get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _session_factory

async def get_db():
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def check_db_health():
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar_one()
            ext = await conn.execute(text(
                "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp','vector')"
            ))
            exts = [r[0] for r in ext.fetchall()]
        return {
            "connected": True,
            "version": version[:60],
            "pgvector": "vector" in exts,
            "uuid_ossp": "uuid-ossp" in exts,
        }
    except Exception as e:
        return {"connected": False, "error": str(e)}

# ── Fernet Encryption ─────────────────────────────────────────────────────────

def get_fernet():
    key = os.environ.get("ENCRYPTION_MASTER_KEY", "")
    if not key:
        key = Fernet.generate_key().decode()
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except Exception:
        return Fernet(Fernet.generate_key())

# ── Prometheus Metrics ────────────────────────────────────────────────────────

from prometheus_client import REGISTRY

def _get_or_create_counter(name, desc, labels):
    try:
        return Counter(name, desc, labels)
    except ValueError:
        return REGISTRY._names_to_collectors.get(name)

def _get_or_create_histogram(name, desc, labels):
    try:
        return Histogram(name, desc, labels)
    except ValueError:
        return REGISTRY._names_to_collectors.get(name)

REQUEST_COUNT = _get_or_create_counter(
    "ai_os_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"],
)
REQUEST_LATENCY = _get_or_create_histogram(
    "ai_os_http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
)

# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=1000)

    @field_validator("slug")
    @classmethod
    def slug_lowercase(cls, v):
        v = v.lower().strip()
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("Slug must contain only lowercase letters, numbers, hyphens")
        return v

class RepoImportRequest(BaseModel):
    git_url: str = Field(min_length=5, max_length=1024)
    branch_target: str = Field(default="main", max_length=100)

class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=100)
    roadmap_goals: str = Field(default="", max_length=10000)

    @field_validator("slug")
    @classmethod
    def slug_lowercase(cls, v):
        return v.lower().strip()

class AcceptanceCriteria(BaseModel):
    must_pass_tests: list[str] = Field(default_factory=list)
    must_have_coverage: float = Field(default=0.0, ge=0.0, le=100.0)
    must_have_endpoints: list[str] = Field(default_factory=list)
    must_not_have_security_issues: bool = Field(default=True)
    architecture_score_minimum: float = Field(default=70.0, ge=0.0, le=100.0)
    custom_checks: list[str] = Field(default_factory=list)

class TaskCreate(BaseModel):
    workspace_id: UUID
    project_id: UUID
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(default="", max_length=10000)
    task_type: str = Field(default="story")
    acceptance_criteria: AcceptanceCriteria = Field(default_factory=AcceptanceCriteria)
    assigned_agent: Optional[str] = None
    model_hint: Optional[str] = None
    max_retries: int = Field(default=5, ge=1, le=10)
    parent_id: Optional[UUID] = None

class ModelRouteRequest(BaseModel):
    task_type: str
    workspace_id: UUID
    complexity: str = Field(default="medium")
    local_only: bool = False
    context_size_estimate: int = Field(default=0, ge=0)

# ── Model Routing Tables ──────────────────────────────────────────────────────

_DEFAULT_ROUTES = {
    "architecture":  ("claude-3-5-sonnet-20241022", "anthropic", "https://api.anthropic.com/v1", 200000, 0.003),
    "coding":        ("gpt-4o",                     "openai",    "https://api.openai.com/v1",   128000, 0.005),
    "research":      ("gemini-2.0-flash",            "google",    "https://generativelanguage.googleapis.com/v1beta", 1000000, 0.00015),
    "reasoning":     ("o3-mini",                     "openai",    "https://api.openai.com/v1",   128000, 0.011),
    "fast_review":   ("claude-3-5-haiku-20241022",   "anthropic", "https://api.anthropic.com/v1", 200000, 0.0008),
    "embedding":     ("nomic-embed-text",             "ollama",    "http://localhost:11434",       8192,   0.0),
    "planning":      ("o3-mini",                     "openai",    "https://api.openai.com/v1",   128000, 0.011),
    "security_scan": ("claude-3-5-haiku-20241022",   "anthropic", "https://api.anthropic.com/v1", 200000, 0.0008),
    "documentation": ("gpt-4o-mini",                "openai",    "https://api.openai.com/v1",   128000, 0.00015),
    "testing":       ("gpt-4o",                     "openai",    "https://api.openai.com/v1",   128000, 0.005),
}

_LOCAL_ROUTES = {
    "coding":        ("qwen2.5-coder:7b",  "ollama", "http://localhost:11434", 32768, 0.0),
    "architecture":  ("qwen2.5-coder:14b", "ollama", "http://localhost:11434", 32768, 0.0),
    "fast_review":   ("qwen2.5-coder:7b",  "ollama", "http://localhost:11434", 32768, 0.0),
    "embedding":     ("nomic-embed-text",  "ollama", "http://localhost:11434", 8192,  0.0),
    "planning":      ("qwen2.5-coder:14b", "ollama", "http://localhost:11434", 32768, 0.0),
    "research":      ("qwen2.5-coder:7b",  "ollama", "http://localhost:11434", 32768, 0.0),
    "reasoning":     ("qwen2.5-coder:14b", "ollama", "http://localhost:11434", 32768, 0.0),
    "documentation": ("qwen2.5-coder:7b",  "ollama", "http://localhost:11434", 32768, 0.0),
    "testing":       ("qwen2.5-coder:7b",  "ollama", "http://localhost:11434", 32768, 0.0),
    "security_scan": ("qwen2.5-coder:7b",  "ollama", "http://localhost:11434", 32768, 0.0),
}

async def check_ollama():
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(f"{os.environ.get('OLLAMA_BASE_URL','http://localhost:11434')}/api/version")
            return r.status_code == 200
    except Exception:
        return False

def has_api_key(provider: str) -> bool:
    keys = {"openai": "OPENAI_API_KEY", "anthropic": "ANTHROPIC_API_KEY", "google": "GOOGLE_API_KEY"}
    return bool(os.environ.get(keys.get(provider, ""), "").strip())

# ── Default agents for new workspaces ─────────────────────────────────────────

_DEFAULT_AGENTS = [
    "planner", "architect", "developer", "tester",
    "reviewer", "security", "git", "memory", "knowledge", "documentation",
]

# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "═" * 60)
    print("  AI COMPANY OS — ENGINEERING HUB v2.0.0")
    print("  Starting up...")
    print("═" * 60)

    print("\n[1/4] Checking PostgreSQL...")
    db_health = await check_db_health()
    if not db_health["connected"]:
        print(f"  FATAL: {db_health.get('error')}")
        raise RuntimeError("Database connection required")
    print(f"  ✓ Connected | pgvector={'✓' if db_health['pgvector'] else '✗'} | uuid-ossp={'✓' if db_health['uuid_ossp'] else '✗'}")

    print("\n[2/4] Checking Qdrant...")
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"http://{os.environ.get('QDRANT_HOST','localhost')}:{os.environ.get('QDRANT_PORT','6333')}/health")
            print(f"  ✓ Qdrant healthy" if r.status_code == 200 else f"  ⚠ Qdrant status {r.status_code}")
    except Exception as e:
        print(f"  ⚠ Qdrant: {e}")

    print("\n[3/4] Checking Ollama...")
    ollama_ok = await check_ollama()
    print(f"  {'✓ Ollama running' if ollama_ok else '⚠ Ollama not responding'}")

    print("\n[4/4] Checking Redis...")
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"), socket_timeout=2)
        pong = await r.ping()
        await r.aclose()
        print(f"  {'✓ Redis healthy' if pong else '⚠ Redis warning'}")
    except Exception as e:
        print(f"  ⚠ Redis: {e}")

    print("\n" + "═" * 60)
    print("  ✓ ENGINEERING HUB READY")
    print("  API:     http://0.0.0.0:8000")
    print("  Docs:    http://localhost:8000/docs")
    print("  Health:  http://localhost:8000/health")
    print("  Metrics: http://localhost:8000/metrics")
    print("═" * 60 + "\n")

    yield

    print("\n[SHUTDOWN] Closing database pool...")
    if _engine:
        await _engine.dispose()
    print("[SHUTDOWN] Clean stop.\n")

# ── Application ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Company OS — Engineering Hub",
    description="Autonomous Engineering Operating System API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def telemetry(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, request.url.path).observe(duration)
    response.headers["X-Response-Time-Ms"] = str(int(duration * 1000))
    return response

# ── Platform Routes ───────────────────────────────────────────────────────────

@app.get("/", tags=["Platform"])
async def root():
    return {"platform": "AI Company OS", "component": "Engineering Hub", "version": "2.0.0", "status": "operational", "docs": "/docs"}

@app.get("/health", tags=["Platform"])
async def health():
    db = await check_db_health()
    qdrant_ok, ollama_ok = False, False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(f"http://{os.environ.get('QDRANT_HOST','localhost')}:{os.environ.get('QDRANT_PORT','6333')}/health")
            qdrant_ok = r.status_code == 200
    except Exception:
        pass
    ollama_ok = await check_ollama()
    healthy = db["connected"]
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={
            "status": "healthy" if healthy else "degraded",
            "components": {
                "database": {"healthy": db["connected"], "pgvector": db.get("pgvector", False)},
                "qdrant": {"healthy": qdrant_ok},
                "ollama": {"healthy": ollama_ok},
            },
            "version": "2.0.0",
        },
    )

@app.get("/metrics", tags=["Platform"])
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# ── Workspace Endpoints ───────────────────────────────────────────────────────

@app.post("/api/v1/workspaces", status_code=201, tags=["Workspaces"])
async def create_workspace(body: WorkspaceCreate):
    from fastapi import Depends
    from sqlalchemy.exc import IntegrityError
    engine = get_engine()
    factory = get_session_factory()

    workspace_base = os.environ.get("WORKSPACE_BASE_PATH", "/home/amr/AI-COMPANY-OS/11-WORKSPACES")
    from pathlib import Path
    workspace_dir = Path(workspace_base) / body.slug
    workspace_dir.mkdir(parents=True, exist_ok=True)
    for d in ["repos", "knowledge", "memory", "artifacts"]:
        (workspace_dir / d).mkdir(exist_ok=True)

    async with factory() as session:
        try:
            result = await session.execute(
                text("""
                    INSERT INTO workspaces (name, slug, description, lifecycle_state)
                    VALUES (:name, :slug, :desc, 'CREATED')
                    RETURNING id, name, slug, description, lifecycle_state, created_at
                """),
                {"name": body.name, "slug": body.slug, "desc": body.description},
            )
            row = result.fetchone()
            await session.flush()

            wid = str(row.id)
            for component in ["VECTOR_STORE", "GRAPH_DB", "FILE_SYSTEM", "MEMORY"]:
                await session.execute(
                    text("INSERT INTO workspace_status (workspace_id, component) VALUES (:wid, :comp)"),
                    {"wid": wid, "comp": component},
                )
            for role in _DEFAULT_AGENTS:
                await session.execute(
                    text("INSERT INTO workspace_agents (workspace_id, agent_role) VALUES (:wid, :role)"),
                    {"wid": wid, "role": role},
                )
            await session.commit()

            return {
                "id": str(row.id),
                "name": row.name,
                "slug": row.slug,
                "description": row.description,
                "lifecycle_state": row.lifecycle_state,
                "created_at": str(row.created_at),
                "workspace_path": str(workspace_dir),
                "agents_provisioned": len(_DEFAULT_AGENTS),
            }
        except Exception as e:
            await session.rollback()
            if "unique" in str(e).lower() or "duplicate" in str(e).lower():
                return JSONResponse(status_code=409, content={"error_code": "WORKSPACE_SLUG_CONFLICT", "message": f"Workspace slug '{body.slug}' already exists."})
            raise

@app.delete("/api/v1/workspaces/{workspace_id}", status_code=202, tags=["Workspaces"])
async def delete_workspace(workspace_id: UUID):
    async with get_session_factory()() as session:
        await session.execute(
            text("UPDATE workspaces SET lifecycle_state='DELETED' WHERE id=:wid"),
            {"wid": str(workspace_id)},
        )
        await session.commit()
    return {"message": "Workspace queued for termination.", "workspace_id": str(workspace_id)}

@app.post("/api/v1/workspaces/{workspace_id}/repos", status_code=201, tags=["Workspaces"])
async def import_repo(workspace_id: UUID, body: RepoImportRequest):
    from pathlib import Path
    workspace_base = os.environ.get("WORKSPACE_BASE_PATH", "/home/amr/AI-COMPANY-OS/11-WORKSPACES")
    async with get_session_factory()() as session:
        ws = await session.execute(text("SELECT slug FROM workspaces WHERE id=:wid"), {"wid": str(workspace_id)})
        row = ws.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "WORKSPACE_NOT_FOUND", "message": f"Workspace {workspace_id} not found."})
        repo_slug = body.git_url.rstrip("/").split("/")[-1].replace(".git", "")
        local_path = str(Path(workspace_base) / row.slug / "repos" / repo_slug)
        try:
            result = await session.execute(
                text("""
                    INSERT INTO workspace_repos (workspace_id, git_url, branch_target, local_path)
                    VALUES (:wid, :url, :branch, :path)
                    RETURNING id
                """),
                {"wid": str(workspace_id), "url": body.git_url, "branch": body.branch_target, "path": local_path},
            )
            repo_id = result.fetchone().id
            await session.commit()
            return {"repo_id": str(repo_id), "workspace_id": str(workspace_id), "git_url": body.git_url, "status": "REGISTERED"}
        except Exception as e:
            await session.rollback()
            if "unique" in str(e).lower():
                return JSONResponse(status_code=409, content={"error_code": "REPO_ALREADY_REGISTERED", "message": "Repository already registered."})
            raise

@app.get("/api/v1/workspaces/{workspace_id}/status", tags=["Workspaces"])
async def get_workspace_status(workspace_id: UUID):
    async with get_session_factory()() as session:
        ws = await session.execute(text("SELECT id, name, slug, lifecycle_state FROM workspaces WHERE id=:wid"), {"wid": str(workspace_id)})
        row = ws.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "WORKSPACE_NOT_FOUND", "message": f"Workspace {workspace_id} not found."})
        comps = await session.execute(text("SELECT component, is_healthy FROM workspace_status WHERE workspace_id=:wid"), {"wid": str(workspace_id)})
        repos = await session.execute(text("SELECT COUNT(*) FROM workspace_repos WHERE workspace_id=:wid"), {"wid": str(workspace_id)})
        return {
            "workspace_id": str(workspace_id),
            "lifecycle_state": row.lifecycle_state,
            "components": [{"name": c.component, "is_healthy": c.is_healthy} for c in comps.fetchall()],
            "repo_count": repos.scalar_one(),
        }

@app.get("/api/v1/workspaces/{workspace_id}/dashboard", tags=["Workspaces"])
async def get_workspace_dashboard(workspace_id: UUID):
    async with get_session_factory()() as session:
        ws = await session.execute(text("SELECT id, name, slug, lifecycle_state FROM workspaces WHERE id=:wid"), {"wid": str(workspace_id)})
        row = ws.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "WORKSPACE_NOT_FOUND", "message": "Not found."})
        projects = await session.execute(text("SELECT id, name, slug FROM projects WHERE workspace_id=:wid"), {"wid": str(workspace_id)})
        tasks = await session.execute(text("SELECT COUNT(*) FROM tasks WHERE workspace_id=:wid AND status NOT IN ('done','failed')"), {"wid": str(workspace_id)})
        return {
            "workspace": {"id": str(row.id), "name": row.name, "slug": row.slug, "lifecycle_state": row.lifecycle_state},
            "projects": [{"id": str(p.id), "name": p.name, "slug": p.slug} for p in projects.fetchall()],
            "active_task_count": tasks.scalar_one(),
        }

# ── Project Endpoints ─────────────────────────────────────────────────────────

@app.post("/api/v1/workspaces/{workspace_id}/projects", status_code=201, tags=["Projects"])
async def create_project(workspace_id: UUID, body: ProjectCreate):
    async with get_session_factory()() as session:
        ws = await session.execute(text("SELECT id FROM workspaces WHERE id=:wid"), {"wid": str(workspace_id)})
        if not ws.fetchone():
            return JSONResponse(status_code=404, content={"error_code": "WORKSPACE_NOT_FOUND", "message": "Workspace not found."})
        try:
            result = await session.execute(
                text("INSERT INTO projects (workspace_id, name, slug, roadmap_goals) VALUES (:wid, :name, :slug, :goals) RETURNING id, name, slug, created_at"),
                {"wid": str(workspace_id), "name": body.name, "slug": body.slug, "goals": body.roadmap_goals},
            )
            row = result.fetchone()
            await session.commit()
            return {"id": str(row.id), "workspace_id": str(workspace_id), "name": row.name, "slug": row.slug, "created_at": str(row.created_at)}
        except Exception as e:
            await session.rollback()
            if "unique" in str(e).lower():
                return JSONResponse(status_code=409, content={"error_code": "PROJECT_SLUG_CONFLICT", "message": f"Project slug '{body.slug}' already exists."})
            raise

@app.get("/api/v1/workspaces/{workspace_id}/projects", tags=["Projects"])
async def list_projects(workspace_id: UUID):
    async with get_session_factory()() as session:
        result = await session.execute(
            text("SELECT id, name, slug, roadmap_goals, created_at FROM projects WHERE workspace_id=:wid ORDER BY created_at DESC"),
            {"wid": str(workspace_id)},
        )
        return [{"id": str(r.id), "name": r.name, "slug": r.slug, "created_at": str(r.created_at)} for r in result.fetchall()]

@app.get("/api/v1/workspaces/{workspace_id}/projects/{project_id}/dashboard", tags=["Projects"])
async def get_project_dashboard(workspace_id: UUID, project_id: UUID):
    async with get_session_factory()() as session:
        proj = await session.execute(text("SELECT id, name, slug FROM projects WHERE id=:pid AND workspace_id=:wid"), {"pid": str(project_id), "wid": str(workspace_id)})
        row = proj.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "PROJECT_NOT_FOUND", "message": "Project not found."})
        tasks = await session.execute(text("SELECT status, COUNT(*) as cnt FROM tasks WHERE project_id=:pid AND workspace_id=:wid GROUP BY status"), {"pid": str(project_id), "wid": str(workspace_id)})
        by_status = {r.status: r.cnt for r in tasks.fetchall()}
        return {"project_id": str(project_id), "name": row.name, "slug": row.slug, "task_summary": {"by_status": by_status, "total": sum(by_status.values())}}

# ── Task Endpoints ────────────────────────────────────────────────────────────

@app.post("/api/v1/tasks", status_code=201, tags=["Tasks"])
async def create_task(body: TaskCreate):
    async with get_session_factory()() as session:
        proj = await session.execute(text("SELECT id FROM projects WHERE id=:pid AND workspace_id=:wid"), {"pid": str(body.project_id), "wid": str(body.workspace_id)})
        if not proj.fetchone():
            return JSONResponse(status_code=404, content={"error_code": "PROJECT_NOT_FOUND", "message": "Project not found in workspace."})
        initial_status = "planning" if body.task_type in ("epic", "feature") else "pending"
        result = await session.execute(
            text("""
                INSERT INTO tasks (workspace_id, project_id, title, description, task_type,
                    acceptance_criteria, assigned_agent, model_hint, status, max_retries, parent_id)
                VALUES (:wid, :pid, :title, :desc, :ttype, CAST(:ac AS jsonb), :agent, :model,
                    :status, :retries, :parent)
                RETURNING id, title, status, task_type, created_at
            """),
            {
                "wid": str(body.workspace_id), "pid": str(body.project_id),
                "title": body.title, "desc": body.description, "ttype": body.task_type,
                "ac": body.acceptance_criteria.model_dump_json(),
                "agent": body.assigned_agent, "model": body.model_hint,
                "status": initial_status, "retries": body.max_retries,
                "parent": str(body.parent_id) if body.parent_id else None,
            },
        )
        row = result.fetchone()
        await session.commit()
        return {
            "id": str(row.id), "workspace_id": str(body.workspace_id),
            "project_id": str(body.project_id), "title": row.title,
            "task_type": row.task_type, "status": row.status,
            "created_at": str(row.created_at),
            "auto_planning": body.task_type in ("epic", "feature"),
        }

@app.get("/api/v1/tasks", tags=["Tasks"])
async def list_tasks(
    workspace_id: UUID = Query(...),
    project_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    async with get_session_factory()() as session:
        sql = "SELECT id, title, task_type, status, assigned_agent, created_at FROM tasks WHERE workspace_id=:wid"
        params: dict[str, Any] = {"wid": str(workspace_id)}
        if project_id:
            sql += " AND project_id=:pid"
            params["pid"] = str(project_id)
        if status_filter:
            sql += " AND status=:status"
            params["status"] = status_filter
        sql += " ORDER BY created_at DESC"
        result = await session.execute(text(sql), params)
        return [{"id": str(r.id), "title": r.title, "task_type": r.task_type, "status": r.status, "assigned_agent": r.assigned_agent} for r in result.fetchall()]

@app.post("/api/v1/tasks/{task_id}/assign", tags=["Tasks"])
async def assign_task(task_id: UUID, workspace_id: UUID = Query(...), assigned_agent: str = Query(...)):
    async with get_session_factory()() as session:
        result = await session.execute(
            text("UPDATE tasks SET assigned_agent=:agent WHERE id=:tid AND workspace_id=:wid RETURNING id, assigned_agent, status"),
            {"agent": assigned_agent, "tid": str(task_id), "wid": str(workspace_id)},
        )
        row = result.fetchone()
        await session.commit()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "TASK_NOT_FOUND", "message": "Task not found."})
        return {"task_id": str(task_id), "assigned_agent": row.assigned_agent, "status": row.status}

@app.post("/api/v1/tasks/{task_id}/execute", status_code=202, tags=["Tasks"])
async def execute_task(task_id: UUID, workspace_id: UUID = Query(...)):
    run_group = uuid4()
    async with get_session_factory()() as session:
        result = await session.execute(
            text("""
                UPDATE tasks SET run_group=:rg, status='executing', retry_count=retry_count+1
                WHERE id=:tid AND workspace_id=:wid AND retry_count < max_retries
                RETURNING id, status, retry_count, max_retries
            """),
            {"rg": str(run_group), "tid": str(task_id), "wid": str(workspace_id)},
        )
        row = result.fetchone()
        await session.commit()
        if not row:
            return JSONResponse(status_code=409, content={"error_code": "TASK_NOT_EXECUTABLE", "message": "Task not found or max retries exceeded."})
        return {"task_id": str(task_id), "run_group": str(run_group), "status": "executing", "retry": row.retry_count}

@app.get("/api/v1/tasks/{task_id}/status", tags=["Tasks"])
async def get_task_status(task_id: UUID, workspace_id: UUID = Query(...)):
    async with get_session_factory()() as session:
        result = await session.execute(
            text("SELECT id, title, status, task_type, assigned_agent, run_group, retry_count, max_retries FROM tasks WHERE id=:tid AND workspace_id=:wid"),
            {"tid": str(task_id), "wid": str(workspace_id)},
        )
        row = result.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "TASK_NOT_FOUND", "message": "Task not found."})
        return {"id": str(row.id), "title": row.title, "status": row.status, "task_type": row.task_type, "assigned_agent": row.assigned_agent, "run_group": str(row.run_group) if row.run_group else None, "retry_count": row.retry_count}

@app.get("/api/v1/tasks/{task_id}/report", tags=["Tasks"])
async def get_task_report(task_id: UUID, workspace_id: UUID = Query(...)):
    async with get_session_factory()() as session:
        task = await session.execute(text("SELECT id, title, status, run_group FROM tasks WHERE id=:tid AND workspace_id=:wid"), {"tid": str(task_id), "wid": str(workspace_id)})
        row = task.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error_code": "TASK_NOT_FOUND", "message": "Task not found."})
        runs, quality = [], None
        if row.run_group:
            br = await session.execute(text("SELECT stage, attempt, is_ok, duration_ms, output_preview, error_message FROM builder_runs WHERE run_group=:rg ORDER BY created_at"), {"rg": str(row.run_group)})
            runs = [{"stage": r.stage, "attempt": r.attempt, "is_ok": r.is_ok, "duration_ms": r.duration_ms} for r in br.fetchall()]
            qs = await session.execute(text("SELECT overall_score, passed_gate FROM quality_scores WHERE run_group=:rg ORDER BY created_at DESC LIMIT 1"), {"rg": str(row.run_group)})
            q = qs.fetchone()
            if q:
                quality = {"overall_score": float(q.overall_score), "passed_gate": q.passed_gate}
        return {"task": {"id": str(row.id), "title": row.title, "status": row.status}, "execution_logs": runs, "quality_score": quality}

# ── Model Router Endpoints ────────────────────────────────────────────────────

@app.post("/api/v1/models/route", tags=["Model Router"])
async def route_model(body: ModelRouteRequest):
    task_type = body.task_type.lower()

    # Check workspace override
    async with get_session_factory()() as session:
        try:
            result = await session.execute(
                text("SELECT model_id, provider FROM workspace_models WHERE workspace_id=:wid AND task_type=:tt LIMIT 1"),
                {"wid": str(body.workspace_id), "tt": task_type},
            )
            override = result.fetchone()
            if override:
                return {"model_id": override.model_id, "provider": override.provider, "is_local": override.provider == "ollama", "source": "workspace_override"}
        except Exception:
            pass

    if body.local_only:
        local = _LOCAL_ROUTES.get(task_type, _LOCAL_ROUTES["coding"])
        return {"model_id": local[0], "provider": local[1], "endpoint": local[2], "context_window": local[3], "estimated_cost_per_1k_tokens": 0.0, "is_local": True, "source": "local_only"}

    route = _DEFAULT_ROUTES.get(task_type)
    if route:
        model_id, provider, endpoint, ctx, cost = route
        if not has_api_key(provider) and provider != "ollama":
            ollama_ok = await check_ollama()
            if ollama_ok:
                local = _LOCAL_ROUTES.get(task_type, _LOCAL_ROUTES["coding"])
                return {"model_id": local[0], "provider": local[1], "endpoint": local[2], "context_window": local[3], "estimated_cost_per_1k_tokens": 0.0, "is_local": True, "source": "fallback_to_local"}
        return {"model_id": model_id, "provider": provider, "endpoint": endpoint, "context_window": ctx, "estimated_cost_per_1k_tokens": cost, "is_local": provider == "ollama", "source": "default_routing"}

    return {"model_id": "gpt-4o-mini", "provider": "openai", "endpoint": "https://api.openai.com/v1", "context_window": 128000, "estimated_cost_per_1k_tokens": 0.00015, "is_local": False, "source": "fallback"}

@app.get("/api/v1/models/available", tags=["Model Router"])
async def list_models():
    ollama_ok = await check_ollama()
    models = []
    for tt, route in _DEFAULT_ROUTES.items():
        mid, prov, ep, ctx, cost = route
        available = has_api_key(prov) if prov != "ollama" else ollama_ok
        models.append({"task_type": tt, "model_id": mid, "provider": prov, "available": available, "context_window": ctx})
    local_models = []
    if ollama_ok:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(f"{os.environ.get('OLLAMA_BASE_URL','http://localhost:11434')}/api/tags")
                if r.status_code == 200:
                    local_models = [{"name": m["name"], "size_gb": round(m.get("size", 0) / (1024**3), 1)} for m in r.json().get("models", [])]
        except Exception:
            pass
    return {"routing_table": models, "ollama_available": ollama_ok, "local_models": local_models}

# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "run_api:app",
        host=os.environ.get("API_HOST", "0.0.0.0"),
        port=int(os.environ.get("API_PORT", "8000")),
        reload=True,
        reload_dirs=["/home/amr/AI-COMPANY-OS"],
        log_level="info",
    )
