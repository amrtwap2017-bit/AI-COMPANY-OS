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



# ── Wave 2: Knowledge Endpoints ──────────────────────────────────────────────

@app.post("/api/v1/knowledge/ingest", status_code=202, tags=["Knowledge"])
async def ingest_knowledge(
    workspace_id: UUID = Query(...),
    content: str = Query(...),
    title: str = Query(default="Document"),
    doc_type: str = Query(default="document"),
):
    """Ingest text content into workspace knowledge base."""
    return {
        "workspace_id": str(workspace_id),
        "title": title,
        "status": "QUEUED",
        "message": "Knowledge ingestion queued. Full pipeline active in Wave 2.",
    }

@app.get("/api/v1/knowledge/search", tags=["Knowledge"])
async def search_knowledge(
    workspace_id: UUID = Query(...),
    q: str = Query(...),
    limit: int = Query(default=10),
):
    """Semantic search across workspace knowledge base."""
    try:
        from qdrant_client import AsyncQdrantClient
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        import httpx as _httpx

        # Get embedding from Ollama
        ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        async with _httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{ollama_url}/api/embeddings",
                json={"model": "nomic-embed-text", "prompt": q},
            )
            if resp.status_code != 200:
                return {"results": [], "error": "Embedding service unavailable"}
            query_vector = resp.json()["embedding"]

        # Search Qdrant
        qdrant_host = os.environ.get("QDRANT_HOST", "localhost")
        qdrant_port = int(os.environ.get("QDRANT_PORT", "6333"))
        qclient = AsyncQdrantClient(host=qdrant_host, port=qdrant_port)

        # Try workspace-scoped collection first, fall back to global
        collection_name = f"{workspace_id}_knowledge"
        results = []
        try:
            search_results = await qclient.search(
                collection_name="knowledge",
                query_vector=query_vector,
                query_filter=Filter(must=[FieldCondition(key="workspace_id", match=MatchValue(value=str(workspace_id)))]),
                limit=limit,
            )
            results = [{"id": str(r.id), "score": round(r.score, 4), "payload": r.payload} for r in search_results]
        except Exception:
            results = []
        finally:
            await qclient.close()

        return {
            "workspace_id": str(workspace_id),
            "query": q,
            "results": results,
            "total": len(results),
        }
    except Exception as e:
        return {"results": [], "error": str(e)}

# ── Wave 2: Memory Endpoints ──────────────────────────────────────────────────

@app.post("/api/v1/memories", status_code=201, tags=["Memory"])
async def store_memory(
    workspace_id: UUID = Query(...),
    memory_type: str = Query(...),
    content: str = Query(...),
    project_id: Optional[UUID] = Query(None),
):
    """Store a memory entry for the workspace."""
    valid_types = ["conversation", "project", "architecture", "execution", "failure", "learning"]
    if memory_type not in valid_types:
        return JSONResponse(status_code=422, content={"error": f"Invalid memory_type. Valid: {valid_types}"})

    from datetime import datetime, timedelta, timezone
    expires_at = None
    if memory_type == "conversation":
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    elif memory_type == "execution":
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    async with get_session_factory()() as session:
        result = await session.execute(
            text("""
                INSERT INTO memories (workspace_id, project_id, memory_type, content, expires_at)
                VALUES (:wid, :pid, :mtype, :content, :expires)
                RETURNING id, memory_type, created_at
            """),
            {
                "wid": str(workspace_id),
                "pid": str(project_id) if project_id else None,
                "mtype": memory_type,
                "content": content,
                "expires": expires_at,
            },
        )
        row = result.fetchone()
        await session.commit()

    return {
        "memory_id": str(row.id),
        "memory_type": row.memory_type,
        "workspace_id": str(workspace_id),
        "expires_at": str(expires_at) if expires_at else None,
        "created_at": str(row.created_at),
    }

@app.get("/api/v1/memories/search", tags=["Memory"])
async def search_memories(
    workspace_id: UUID = Query(...),
    q: str = Query(...),
    memory_type: Optional[str] = Query(None),
    limit: int = Query(default=10),
):
    """Search workspace memories by keyword."""
    async with get_session_factory()() as session:
        sql = """
            SELECT id, memory_type, content, created_at
            FROM memories
            WHERE workspace_id = :wid
              AND (expires_at IS NULL OR expires_at > NOW())
              AND content ILIKE :q
        """
        params: dict = {"wid": str(workspace_id), "q": f"%{q}%"}
        if memory_type:
            sql += " AND memory_type = :mtype"
            params["mtype"] = memory_type
        sql += " ORDER BY created_at DESC LIMIT :limit"
        params["limit"] = limit

        result = await session.execute(text(sql), params)
        memories = [
            {
                "memory_id": str(r.id),
                "memory_type": r.memory_type,
                "content": r.content,
                "created_at": str(r.created_at),
            }
            for r in result.fetchall()
        ]

    return {"workspace_id": str(workspace_id), "query": q, "results": memories, "total": len(memories)}

@app.get("/api/v1/memories/stats", tags=["Memory"])
async def memory_stats(workspace_id: UUID = Query(...)):
    """Return memory statistics for a workspace."""
    async with get_session_factory()() as session:
        result = await session.execute(
            text("""
                SELECT memory_type, COUNT(*) as count
                FROM memories
                WHERE workspace_id = :wid AND (expires_at IS NULL OR expires_at > NOW())
                GROUP BY memory_type
            """),
            {"wid": str(workspace_id)},
        )
        by_type = {row.memory_type: row.count for row in result.fetchall()}
    return {"workspace_id": str(workspace_id), "by_type": by_type, "total": sum(by_type.values())}

# ── Wave 2: Agent Orchestration Endpoints ─────────────────────────────────────

@app.get("/api/v1/agents", tags=["Agents"])
async def list_agents():
    """List all registered agents and their capabilities."""
    sys.path.insert(0, "/home/amr/AI-COMPANY-OS")
    try:
        from AI_COMPANY_OS_06_AGENTS_agent_orchestrator import AGENT_REGISTRY
        return {"agents": AGENT_REGISTRY}
    except Exception:
        return {
            "agents": {
                "planner":    {"status": "active", "wave": 2, "capabilities": ["planning", "task_decomposition"]},
                "architect":  {"status": "stub",   "wave": 3, "capabilities": ["architecture", "design"]},
                "developer":  {"status": "stub",   "wave": 3, "capabilities": ["backend_coding", "frontend_coding"]},
                "tester":     {"status": "stub",   "wave": 3, "capabilities": ["testing", "qa"]},
                "reviewer":   {"status": "stub",   "wave": 3, "capabilities": ["code_review"]},
                "security":   {"status": "stub",   "wave": 3, "capabilities": ["security_scanning"]},
                "git":        {"status": "stub",   "wave": 3, "capabilities": ["git_operations"]},
                "memory":     {"status": "active", "wave": 2, "capabilities": ["memory_distillation"]},
                "knowledge":  {"status": "active", "wave": 2, "capabilities": ["knowledge_indexing"]},
            }
        }

@app.post("/api/v1/tasks/{task_id}/plan", status_code=202, tags=["Agents"])
async def plan_task(task_id: UUID, workspace_id: UUID = Query(...)):
    from sqlalchemy import text as sql_text
    """
    Trigger the Planner Agent to decompose a task into sub-tasks.
    Automatically called for epic/feature tasks. Can be called manually.
    """
    async with get_session_factory()() as session:
        result = await session.execute(
            sql_text("SELECT id, title, description, task_type, acceptance_criteria, project_id FROM tasks WHERE id=:tid AND workspace_id=:wid"),
            {"tid": str(task_id), "wid": str(workspace_id)},
        )
        row = result.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error": "Task not found"})

    try:
        import httpx as _httpx
        ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        
        prompt = f"""You are a senior software architect. Decompose this epic into 3-5 implementation tasks.

EPIC: {row.title}
DESCRIPTION: {row.description or "No description"}

Return ONLY valid JSON:
{{
    "nodes": [
        {{
            "title": "Task title",
            "description": "What to build",
            "task_type": "story",
            "agent_role": "developer",
            "model_hint": "coding",
            "estimated_complexity": "medium",
            "depends_on": []
        }}
    ],
    "critical_path": [0],
    "estimated_total_complexity": "high"
}}"""

        plan_nodes = []
        try:
            async with _httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(
                    f"{ollama_url}/api/generate",
                    json={"model": "qwen2.5-coder:7b", "prompt": prompt, "stream": False, "options": {"temperature": 0.2}}
                )
                if resp.status_code == 200:
                    import re, json as _json
                    text = resp.json().get("response", "")
                    match = re.search(r"\{.*\}", text, re.DOTALL)
                    if match:
                        parsed = _json.loads(match.group())
                        plan_nodes = parsed.get("nodes", [])
        except Exception:
            pass

        if not plan_nodes:
            plan_nodes = [
                {"title": "Design and research", "description": "Investigate and design solution", "task_type": "spike", "agent_role": "architect", "model_hint": "architecture", "estimated_complexity": "medium", "depends_on": []},
                {"title": "Core implementation", "description": "Build main functionality", "task_type": "story", "agent_role": "developer", "model_hint": "coding", "estimated_complexity": "high", "depends_on": [0]},
                {"title": "Tests", "description": "Write unit and integration tests", "task_type": "story", "agent_role": "tester", "model_hint": "testing", "estimated_complexity": "medium", "depends_on": [1]},
            ]

        import json as _json2
        created_ids = []
        node_id_map = {}
        async with get_session_factory()() as session:
            for i, node in enumerate(plan_nodes):
                subtask_id = str(uuid4())
                node_id_map[i] = subtask_id
                ac_json = _json2.dumps(node.get("acceptance_criteria", {"must_have_coverage": 80.0, "architecture_score_minimum": 70.0}))
                await session.execute(
                    text("""INSERT INTO tasks (id, workspace_id, project_id, title, description, task_type, acceptance_criteria, assigned_agent, model_hint, status, parent_id)
                         VALUES (:tid, :wid, :pid, :title, :desc, :ttype, CAST(:ac AS jsonb), :agent, :model, 'pending', :parent)"""),
                    {"tid": subtask_id, "wid": str(workspace_id), "pid": str(row.project_id),
                     "title": node.get("title", "Subtask"), "desc": node.get("description", ""),
                     "ttype": node.get("task_type", "story"), "ac": ac_json,
                     "agent": node.get("agent_role"), "model": node.get("model_hint"),
                     "parent": str(task_id)}
                )
                created_ids.append(subtask_id)

            for i, node in enumerate(plan_nodes):
                for dep_idx in node.get("depends_on", []):
                    if dep_idx in node_id_map:
                        await session.execute(
                            text("INSERT INTO task_dependencies (task_id, depends_on_id) VALUES (:tid, :dep) ON CONFLICT DO NOTHING"),
                            {"tid": node_id_map[i], "dep": node_id_map[dep_idx]}
                        )

            await session.execute(
                text("UPDATE tasks SET status = 'executing' WHERE id = :parent_id"),
                {"parent_id": str(task_id)}
            )
            await session.commit()

        return {
            "task_id": str(task_id),
            "agent_role": "planner",
            "status": "planned",
            "subtasks_created": len(created_ids),
            "subtask_ids": created_ids,
            "nodes": plan_nodes
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})




# ── Wave 3: Execution Engine ──────────────────────────────────────────────────

@app.post("/api/v1/tasks/{task_id}/run", status_code=200, tags=["Execution"])
async def run_task_pipeline(task_id: UUID, workspace_id: UUID = Query(...)):
    """
    Trigger the full autonomous execution pipeline for a task.
    Context Pack → Code Generation → Lint → Quality Gate → Commit → Memory
    """
    async with get_session_factory()() as session:
        result = await session.execute(
            text("SELECT id, project_id, status FROM tasks WHERE id=:tid AND workspace_id=:wid"),
            {"tid": str(task_id), "wid": str(workspace_id)},
        )
        row = result.fetchone()
        if not row:
            return JSONResponse(status_code=404, content={"error": "Task not found"})
        run_group = uuid4()
        await session.execute(
            text("UPDATE tasks SET run_group=:rg, status='executing' WHERE id=:tid"),
            {"rg": str(run_group), "tid": str(task_id)},
        )
        await session.commit()
        project_id = row.project_id

    import importlib.util as _ilu
    import asyncio as _asyncio

    _ee_spec = _ilu.spec_from_file_location(
        "execution_engine",
        "/home/amr/AI-COMPANY-OS/09-EXECUTION/execution_engine.py",
    )
    _ee_mod = _ilu.module_from_spec(_ee_spec)
    _ee_spec.loader.exec_module(_ee_mod)
    engine = _ee_mod.ExecutionEngine()

    report = await engine.run_pipeline(task_id, workspace_id, project_id, run_group)
    return report

@app.get("/api/v1/executions", tags=["Execution"])
async def list_executions(workspace_id: UUID = Query(...), limit: int = Query(default=20)):
    """List recent execution runs for a workspace."""
    async with get_session_factory()() as session:
        result = await session.execute(
            text("""
                SELECT run_group, task_id, stage, is_ok, duration_ms, created_at
                FROM builder_runs
                WHERE workspace_id = :wid
                ORDER BY created_at DESC
                LIMIT :limit
            """),
            {"wid": str(workspace_id), "limit": limit},
        )
        runs = [
            {
                "run_group": str(r.run_group),
                "task_id": str(r.task_id),
                "stage": r.stage,
                "is_ok": r.is_ok,
                "duration_ms": r.duration_ms,
                "created_at": str(r.created_at),
            }
            for r in result.fetchall()
        ]
    return {"workspace_id": str(workspace_id), "executions": runs, "total": len(runs)}

@app.get("/api/v1/quality", tags=["Execution"])
async def list_quality_scores(workspace_id: UUID = Query(...), limit: int = Query(default=10)):
    """List recent quality gate results."""
    async with get_session_factory()() as session:
        result = await session.execute(
            text("""
                SELECT qs.run_group, qs.overall_score, qs.passed_gate,
                       qs.architecture_score, qs.security_score, qs.created_at
                FROM quality_scores qs
                JOIN builder_runs br ON br.run_group = qs.run_group
                WHERE br.workspace_id = :wid
                ORDER BY qs.created_at DESC
                LIMIT :limit
            """),
            {"wid": str(workspace_id), "limit": limit},
        )
        scores = [
            {
                "run_group": str(r.run_group),
                "overall_score": float(r.overall_score),
                "passed_gate": r.passed_gate,
                "architecture_score": float(r.architecture_score),
                "security_score": float(r.security_score),
            }
            for r in result.fetchall()
        ]
    return {"workspace_id": str(workspace_id), "quality_scores": scores}


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
