"""
PROGRAM-06 — Enterprise AI Orchestration Layer
Port: 8020
The brain that connects all components into one autonomous OS.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from src.project_manager.manager import (
    get_morning_briefing,
    get_project_state_snapshot,
    decide_next_task,
    create_daily_report,
    update_sprint_metrics,
)
from src.execution_orchestrator.pipeline import run_full_pipeline, run_sprint
from src.context_engine.engine import build_focused_context
from src.quality.orchestrator import run_quality_review
from src.knowledge_sync.sync import sync_after_commit, sync_on_startup
from src.memory_sync.sync import (
    capture_decision, capture_failure, capture_lesson,
    recall_relevant, build_institutional_knowledge,
)
from src.self_improvement.engine import (
    run_sprint_retrospective, get_prompt_templates, upsert_prompt_template,
)
from src.settings import TB_WORKSPACE_ID, TB_WORKSPACE_ROOT

app = FastAPI(
    title="Enterprise AI Orchestration Layer",
    version="1.0.0",
    description="PROGRAM-06 — The brain of the AI Engineering OS",
)


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class WorkspaceRequest(BaseModel):
    workspace_id: str = TB_WORKSPACE_ID
    workspace_root: str = TB_WORKSPACE_ROOT

class RunTaskRequest(BaseModel):
    task_id: str
    workspace_id: str = TB_WORKSPACE_ID
    workspace_root: str = TB_WORKSPACE_ROOT

class RunSprintRequest(BaseModel):
    workspace_id: str = TB_WORKSPACE_ID
    workspace_root: str = TB_WORKSPACE_ROOT
    max_tasks: int = 20

class ContextRequest(BaseModel):
    request: str
    workspace_id: str = TB_WORKSPACE_ID
    task_title: str = ""
    task_description: str = ""
    acceptance_criteria: List[str] = []

class ReviewRequest(BaseModel):
    code_files: List[dict]
    task_title: str
    task_id: str = ""
    run_group: str = ""

class MemoryCaptureRequest(BaseModel):
    workspace_id: str = TB_WORKSPACE_ID
    memory_type: str  # decision|failure|lesson
    subject: str
    content: str
    run_group: str = ""

class SyncRequest(BaseModel):
    workspace_id: str = TB_WORKSPACE_ID
    workspace_root: str = TB_WORKSPACE_ROOT

class RetroRequest(BaseModel):
    workspace_id: str = TB_WORKSPACE_ID
    sprint_name: str = "COMMERCIAL Sprint 1"

class PromptUpsertRequest(BaseModel):
    template_name: str
    task_type: str
    content: str
    improvement_reason: str = ""


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/orchestrator/health")
def health():
    return {
        "ok": True,
        "service": "enterprise-ai-orchestrator",
        "version": "1.0.0",
        "port": 8020,
        "default_workspace": TB_WORKSPACE_ID,
    }


# ─── Project Manager ──────────────────────────────────────────────────────────

@app.get("/orchestrator/briefing/{workspace_id}")
def briefing(workspace_id: str, workspace_root: str = TB_WORKSPACE_ROOT):
    return get_morning_briefing(workspace_id, workspace_root)

@app.get("/orchestrator/state/{workspace_id}")
def project_state(workspace_id: str, workspace_root: str = TB_WORKSPACE_ROOT):
    return get_project_state_snapshot(workspace_id, workspace_root)

@app.post("/orchestrator/state/{workspace_id}/refresh")
def refresh_state(workspace_id: str, payload: WorkspaceRequest):
    return get_project_state_snapshot(workspace_id, payload.workspace_root)

@app.post("/orchestrator/decide-next/{workspace_id}")
def decide_next(workspace_id: str, payload: WorkspaceRequest):
    return decide_next_task(workspace_id, payload.workspace_root)

@app.post("/orchestrator/daily-report/{workspace_id}")
def daily_report(workspace_id: str, payload: WorkspaceRequest):
    return create_daily_report(workspace_id, payload.workspace_root)


# ─── Execution ────────────────────────────────────────────────────────────────

@app.post("/orchestrator/run/{workspace_id}")
def run_task(workspace_id: str, payload: RunTaskRequest):
    return run_full_pipeline(
        task_id=payload.task_id,
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
    )

@app.post("/orchestrator/run-sprint/{workspace_id}")
def run_sprint_endpoint(workspace_id: str, payload: RunSprintRequest):
    return run_sprint(
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
        max_tasks=payload.max_tasks,
    )

@app.get("/orchestrator/pipelines/{workspace_id}")
def list_pipelines(workspace_id: str, limit: int = 50):
    from sqlalchemy.orm import Session
    from sqlalchemy import text
    from src.db.engine import engine
    with Session(engine) as s:
        rows = s.execute(
            text("""
                SELECT run_group, stage, stage_status, model_used,
                       duration_ms, created_at
                FROM pipeline_runs
                WHERE workspace_id = :ws
                ORDER BY created_at DESC
                LIMIT :lim
            """),
            {"ws": workspace_id, "lim": limit}
        ).fetchall()
    return [dict(r._mapping) for r in rows]


# ─── Context ──────────────────────────────────────────────────────────────────

@app.post("/orchestrator/context")
def build_context(payload: ContextRequest):
    return build_focused_context(
        request=payload.request,
        workspace_id=payload.workspace_id,
        task_title=payload.task_title,
        task_description=payload.task_description,
        acceptance_criteria=payload.acceptance_criteria,
    )


# ─── Quality ──────────────────────────────────────────────────────────────────

@app.post("/orchestrator/review")
def quality_review(payload: ReviewRequest):
    return run_quality_review(
        code_files=payload.code_files,
        task_title=payload.task_title,
        task_id=payload.task_id,
        run_group=payload.run_group,
    )

@app.get("/orchestrator/quality/{workspace_id}")
def quality_trends(workspace_id: str, limit: int = 20):
    from sqlalchemy.orm import Session
    from sqlalchemy import text
    from src.db.engine import engine
    with Session(engine) as s:
        rows = s.execute(
            text("""
                SELECT stage, AVG(quality_score) as avg_score,
                       COUNT(*) as count, MAX(ts) as last_run
                FROM execution_runs
                WHERE workspace_id = :ws AND quality_score > 0
                GROUP BY stage
                ORDER BY last_run DESC
                LIMIT :lim
            """),
            {"ws": workspace_id, "lim": limit}
        ).fetchall()
    return [dict(r._mapping) for r in rows]


# ─── Knowledge ────────────────────────────────────────────────────────────────

@app.post("/orchestrator/sync/{workspace_id}")
def sync_knowledge(workspace_id: str, payload: SyncRequest):
    return sync_after_commit(workspace_id, payload.workspace_root)

@app.get("/orchestrator/gaps/{workspace_id}")
def knowledge_gaps(workspace_id: str):
    return {"workspace_id": workspace_id, "gaps": [], "message": "Gap analysis requires full graph scan"}


# ─── Memory ───────────────────────────────────────────────────────────────────

@app.post("/orchestrator/memory/capture")
def capture_memory(payload: MemoryCaptureRequest):
    if payload.memory_type == "decision":
        return capture_decision(
            payload.workspace_id,
            payload.subject,
            payload.content,
            [],
            payload.run_group,
        )
    elif payload.memory_type == "failure":
        return capture_failure(
            payload.workspace_id,
            payload.subject,
            payload.content,
            "auto-fix attempted",
            payload.run_group,
        )
    else:
        return capture_lesson(payload.workspace_id, payload.content)

@app.get("/orchestrator/memory/{workspace_id}")
def get_memory(workspace_id: str, query: str = "", memory_type: str = ""):
    if query:
        return recall_relevant(workspace_id, query)
    from src import hub_client
    return hub_client.recall(workspace_id, memory_type)

@app.get("/orchestrator/knowledge/{workspace_id}")
def institutional_knowledge(workspace_id: str):
    doc = build_institutional_knowledge(workspace_id)
    return {"workspace_id": workspace_id, "document": doc}


# ─── Release ──────────────────────────────────────────────────────────────────

@app.post("/orchestrator/release/{workspace_id}")
def prepare_release(workspace_id: str, payload: RetroRequest):
    metrics = update_sprint_metrics(workspace_id, payload.sprint_name)
    retro = run_sprint_retrospective(workspace_id, payload.sprint_name)
    return {
        "ok": True,
        "sprint_name": payload.sprint_name,
        "metrics": metrics,
        "retrospective": retro,
        "message": "Release preparation complete. Review retrospective before tagging.",
    }


# ─── Self Improvement ─────────────────────────────────────────────────────────

@app.post("/orchestrator/retrospective/{workspace_id}")
def retrospective(workspace_id: str, payload: RetroRequest):
    return run_sprint_retrospective(workspace_id, payload.sprint_name)

@app.get("/orchestrator/prompts")
def list_prompts(task_type: str = ""):
    return get_prompt_templates(task_type)

@app.put("/orchestrator/prompts/{template_name}")
def update_prompt(template_name: str, payload: PromptUpsertRequest):
    return upsert_prompt_template(
        template_name=template_name,
        task_type=payload.task_type,
        content=payload.content,
        improvement_reason=payload.improvement_reason,
    )


# ─── Metrics ──────────────────────────────────────────────────────────────────

@app.get("/orchestrator/metrics")
def metrics():
    from sqlalchemy.orm import Session
    from sqlalchemy import text
    from src.db.engine import engine
    with Session(engine) as s:
        pipeline_count = s.execute(text("SELECT COUNT(*) FROM pipeline_runs")).scalar() or 0
        snapshot_count = s.execute(text("SELECT COUNT(*) FROM project_snapshots")).scalar() or 0
        retro_count = s.execute(text("SELECT COUNT(*) FROM sprint_retrospectives")).scalar() or 0
    return {
        "pipeline_runs_total": pipeline_count,
        "project_snapshots_total": snapshot_count,
        "sprint_retrospectives_total": retro_count,
    }


# ─── Triangle Black Integration ───────────────────────────────────────────────
import httpx as _httpx

TB_API = "http://127.0.0.1:8030"

@app.get("/orchestrator/tb/health")
def tb_health():
    """Check Triangle Black API health."""
    try:
        r = _httpx.get(f"{TB_API}/health", timeout=5)
        data = r.json()
        return {"ok": True, "tb_api": data, "url": TB_API}
    except Exception as e:
        return {"ok": False, "error": str(e), "url": TB_API}

@app.get("/orchestrator/tb/stats")
def tb_stats():
    """Get Triangle Black live statistics."""
    results = {}
    endpoints = [
        ("leads", f"{TB_API}/api/v1/leads/?limit=1"),
        ("agents", f"{TB_API}/api/v1/agents/?limit=1"),
        ("quotes", f"{TB_API}/api/v1/quotes/?limit=1"),
    ]
    for name, url in endpoints:
        try:
            r = _httpx.get(url, timeout=5)
            if r.status_code == 200:
                data = r.json()
                results[name] = {
                    "ok": True,
                    "count": len(data) if isinstance(data, list) else "N/A"
                }
            else:
                results[name] = {"ok": False, "status": r.status_code}
        except Exception as e:
            results[name] = {"ok": False, "error": str(e)}
    return {"ok": True, "triangle_black": results, "api_url": TB_API}

@app.get("/orchestrator/tb/tests")
def tb_tests():
    """Run Triangle Black test suite and return results."""
    import subprocess
    tb_root = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
    try:
        r = subprocess.run(
            [f"{tb_root}/.venv/bin/python", "-m", "pytest",
             "tests/", "--tb=no", "-q", "--no-header"],
            capture_output=True, text=True, cwd=tb_root, timeout=60
        )
        lines = r.stdout.strip().split("\n")
        summary = lines[-1] if lines else "no output"
        passed = "passed" in summary
        return {
            "ok": passed,
            "summary": summary,
            "returncode": r.returncode,
            "output": r.stdout[-1000:],
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ─── Startup briefing + briefing history ──────────────────────────────────────
from fastapi import FastAPI as _FA
from contextlib import asynccontextmanager as _acm

@app.on_event("startup")
async def _auto_briefing():
    """Generate morning briefing automatically on every startup."""
    import threading
    def _run():
        try:
            get_morning_briefing(TB_WORKSPACE_ID, TB_WORKSPACE_ROOT)
            print("[Orchestrator] Morning briefing generated on startup.")
        except Exception as e:
            print(f"[Orchestrator] Briefing skipped: {e}")
    threading.Thread(target=_run, daemon=True).start()

@app.get("/orchestrator/briefing/history/{workspace_id}")
def briefing_history(workspace_id: str, limit: int = 7):
    """Last N morning briefings."""
    from sqlalchemy.orm import Session
    from sqlalchemy import text
    from src.db.engine import engine
    with Session(engine) as s:
        rows = s.execute(
            text("""
                SELECT id, snapshot_type, snapshot_data, created_at
                FROM project_snapshots
                WHERE workspace_id = :ws
                  AND snapshot_type = 'morning_briefing'
                ORDER BY created_at DESC
                LIMIT :lim
            """),
            {"ws": workspace_id, "lim": limit}
        ).fetchall()
    return [dict(r._mapping) for r in rows]


# ─── Upgrade 5: TB Test Runner (full + live) ─────────────────────────────────

@app.post("/orchestrator/tb/run-tests")
def tb_run_tests(full: bool = False):
    """
    Run Triangle Black test suite.
    full=True  — runs all tests (unit + live API).
    full=False — runs only live API tests (faster, default).
    """
    import subprocess as _sp
    import os as _os
    tb_root = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
    venv_python = f"{tb_root}/.venv/bin/python"
    tb_env = {
        **_os.environ,
        "TRIANGLE_BLACK_DB_URL": (
            "postgresql+psycopg2://triangleblack:tb123"
            "@127.0.0.1:5432/triangle_black"
        ),
    }
    results = {}

    # Full unit test suite (optional)
    if full:
        r = _sp.run(
            [venv_python, "-m", "pytest", "tests/",
             "--tb=short", "-q", "--no-header"],
            capture_output=True, text=True,
            cwd=tb_root, timeout=120, env=tb_env,
        )
        lines = r.stdout.strip().split("\n")
        summary = lines[-1] if lines else "no output"
        results["unit"] = {
            "ok": r.returncode in (0, 5),
            "summary": summary,
            "output": r.stdout[-2000:],
            "returncode": r.returncode,
        }

    # Live API tests (always run)
    r2 = _sp.run(
        [venv_python, "-m", "pytest", "tests/test_live_api.py",
         "--tb=short", "-q", "--no-header"],
        capture_output=True, text=True,
        cwd=tb_root, timeout=60, env=tb_env,
    )
    lines2 = r2.stdout.strip().split("\n")
    summary2 = lines2[-1] if lines2 else "no output"
    results["live_api"] = {
        "ok": r2.returncode in (0, 5),
        "summary": summary2,
        "output": r2.stdout[-1000:],
        "returncode": r2.returncode,
    }

    overall_ok = all(v["ok"] for v in results.values())

    # Store result in Hub memory
    try:
        from src import hub_client
        hub_client.remember(
            workspace_id=TB_WORKSPACE_ID,
            memory_type="execution",
            subject="tb_tests",
            content=(
                f"Tests {'PASSED' if overall_ok else 'FAILED'}. "
                f"Live API: {results['live_api']['summary']}"
            ),
        )
    except Exception:
        pass  # memory store is non-blocking

    return {"ok": overall_ok, "results": results}


# ─── Upgrade 6: Smart Task Executor ──────────────────────────────────────────

@app.post("/orchestrator/run-smart/{workspace_id}")
def run_smart(workspace_id: str, payload: RunTaskRequest):
    """
    Smart pipeline: generate → validate → test → report production_ready status.
    Returns production_ready=true only when syntax OK and live tests pass.
    """
    from src.execution_orchestrator.pipeline import run_smart_pipeline
    return run_smart_pipeline(
        task_id=payload.task_id,
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
    )


# ─── Workspace Explorer + Sprint Planner ─────────────────────────────────────

class ExploreRequest(BaseModel):
    workspace_root: str = TB_WORKSPACE_ROOT
    store_in_memory: bool = True


class PlanSprintRequest(BaseModel):
    workspace_root: str = TB_WORKSPACE_ROOT
    epic: str = ""
    extra_context: str = ""
    model: str = ""
    create_tasks: bool = True


@app.post("/orchestrator/explore/{workspace_id}")
def explore_workspace_endpoint(workspace_id: str, payload: ExploreRequest):
    """
    Deep scan the workspace and store findings in Hub memory.
    Returns structured exploration report.
    """
    from src.workspace_explorer.explorer import explore_workspace, store_exploration

    findings = explore_workspace(
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
    )

    if payload.store_in_memory:
        store_exploration(workspace_id, findings)

    return {
        "ok": True,
        "workspace_id": workspace_id,
        "scanned_at": findings["scanned_at"],
        "health_score": findings["summary"]["health_score"],
        "issues_found": len(findings["issues"]),
        "missing_count": len(findings["missing"]),
        "strengths_count": len(findings["strengths"]),
        "python_modules": len(findings.get("python", {}).get("commercial_modules", [])),
        "tests_collected": findings.get("tests", {}).get("tests_collected", 0),
        "db_tables": findings.get("database", {}).get("table_count", 0),
        "findings": findings,
    }


@app.get("/orchestrator/workspace-map/{workspace_id}")
def workspace_map(workspace_id: str, workspace_root: str = TB_WORKSPACE_ROOT):
    """
    Get complete workspace map — live state + Hub knowledge.
    The AI OS's view of the project.
    """
    from src.workspace_explorer.explorer import explore_workspace
    from src import hub_client
    from src.project_state.engine import build_project_state

    # Parallel: state + exploration + memory
    state = build_project_state(workspace_id, workspace_root)
    exploration = explore_workspace(workspace_id, workspace_root)
    memories = hub_client.recall(workspace_id)

    return {
        "workspace_id": workspace_id,
        "project_state": {
            "sprint_completion_pct": state.sprint_completion_pct,
            "velocity_pct": state.velocity_pct,
            "tasks_pending": state.tasks_pending,
            "tasks_completed": state.tasks_completed,
            "tasks_failed": state.tasks_failed,
            "next_task": state.recommended_next_task_title,
            "last_commit": state.last_commit_message,
            "branch": state.current_branch,
        },
        "codebase": {
            "health_score": exploration["summary"]["health_score"],
            "python_files": exploration.get("python", {}).get("total_files", 0),
            "complete_modules": exploration.get("python", {}).get("complete_modules", 0),
            "incomplete_modules": exploration.get("python", {}).get("incomplete_modules", 0),
            "tests_collected": exploration.get("tests", {}).get("tests_collected", 0),
            "collection_errors": exploration.get("tests", {}).get("collection_errors", 0),
            "db_tables": exploration.get("database", {}).get("table_count", 0),
            "api_routers": exploration.get("api", {}).get("routers_registered", 0),
        },
        "issues": exploration["issues"][:10],
        "missing": exploration["missing"][:10],
        "todos": exploration["todos"][:5],
        "recent_memories": len(memories),
        "git": exploration["git"],
    }


@app.post("/orchestrator/plan-sprint/{workspace_id}")
def plan_sprint_endpoint(workspace_id: str, payload: PlanSprintRequest):
    """
    Generate a sprint plan using AI.
    1. Explores workspace to understand current state
    2. Calls Ollama to generate tasks
    3. Optionally creates tasks in Hub
    Returns the complete sprint plan.
    """
    from src.workspace_explorer.explorer import explore_workspace, store_exploration
    from src.workspace_explorer.planner import plan_sprint, create_tasks_from_plan

    # Step 1: Explore
    findings = explore_workspace(workspace_id, payload.workspace_root)
    store_exploration(workspace_id, findings)

    # Step 2: Plan
    plan = plan_sprint(
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
        exploration=findings,
        epic=payload.epic,
        extra_context=payload.extra_context,
        model=payload.model or None,
    )

    # Step 3: Create tasks
    created_ids = []
    if payload.create_tasks and plan.get("tasks"):
        created_ids = create_tasks_from_plan(workspace_id, plan)

    return {
        "ok": True,
        "workspace_id": workspace_id,
        "health_score": findings["summary"]["health_score"],
        "sprint_name": plan.get("sprint_name", "AI Generated Sprint"),
        "sprint_goal": plan.get("goal", ""),
        "tasks_generated": len(plan.get("tasks", [])),
        "tasks_created_in_hub": len(created_ids),
        "task_ids": created_ids,
        "plan": plan,
        "exploration_summary": {
            "issues": findings["issues"][:5],
            "missing": findings["missing"][:5],
        },
    }


@app.post("/orchestrator/auto-sprint/{workspace_id}")
def auto_sprint(workspace_id: str, payload: PlanSprintRequest):
    """
    Full autonomous cycle:
    1. Explore workspace
    2. Plan sprint with AI
    3. Create tasks in Hub
    4. Run all tasks through smart pipeline
    5. Return final report
    """
    from src.workspace_explorer.explorer import explore_workspace, store_exploration
    from src.workspace_explorer.planner import plan_sprint, create_tasks_from_plan
    from src.execution_orchestrator.pipeline import run_sprint

    # Explore + Plan + Create
    findings = explore_workspace(workspace_id, payload.workspace_root)
    store_exploration(workspace_id, findings)

    plan = plan_sprint(
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
        exploration=findings,
        epic=payload.epic,
        extra_context=payload.extra_context,
    )

    created_ids = create_tasks_from_plan(workspace_id, plan)

    # Execute sprint
    sprint_result = run_sprint(
        workspace_id=workspace_id,
        workspace_root=payload.workspace_root,
        max_tasks=len(created_ids),
    )

    return {
        "ok": True,
        "workspace_id": workspace_id,
        "sprint_name": plan.get("sprint_name", "Auto Sprint"),
        "tasks_planned": len(plan.get("tasks", [])),
        "tasks_created": len(created_ids),
        "tasks_executed": sprint_result.get("tasks_run", 0),
        "tasks_completed": sprint_result.get("tasks_completed", 0),
        "tasks_failed": sprint_result.get("tasks_failed", 0),
        "health_score_before": findings["summary"]["health_score"],
        "sprint_result": sprint_result,
    }
