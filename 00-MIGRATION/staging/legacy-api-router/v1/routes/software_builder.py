"""
app/api/v1/routes/software_builder.py
────────────────────────────────────────────────────────────────
Software Builder API — Sprints 41-45.
All routes for code execution, TDD, browser automation,
git workflows, and project scaffolding.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()


# ── Sprint 41: Code Execution Loop ────────────────────────────

class CodeLoopRequest(BaseModel):
    agent_name:     str         = "backend"
    task:           str
    language:       str         = "python"
    initial_code:   str | None  = None
    max_iterations: int         = 5
    timeout_s:      int         = 60


class RunCodeRequest(BaseModel):
    code:     str
    filename: str = "solution.py"
    command:  str | None = None


@router.post("/builder/code/run-loop")
def run_code_loop(req: CodeLoopRequest) -> dict:
    """
    Sprint 41: Code Execution Feedback Loop.
    Agent writes code → executes → reads error → fixes → repeats.
    Returns when all iterations complete or code passes.
    WARNING: Calls Ollama. May take several minutes.
    """
    from app.tools.code_execution import code_execution_engine

    result = code_execution_engine.run_loop(
        agent_name=req.agent_name,
        task=req.task,
        language=req.language,
        initial_code=req.initial_code,
        max_iterations=req.max_iterations,
        timeout_s=req.timeout_s,
    )

    return {
        "success":      result.success,
        "iterations":   result.iterations,
        "final_output": result.final_output,
        "working_dir":  result.working_dir,
        "files_created": result.files_created,
        "history": [
            {
                "iteration": h.iteration,
                "exit_code": h.exit_code,
                "success":   h.success,
                "stdout":    h.stdout[:500],
                "stderr":    h.stderr[:500],
                "duration_s": h.duration_s,
            }
            for h in result.history
        ],
    }


@router.post("/builder/code/run-once")
def run_code_once(req: RunCodeRequest) -> dict:
    """Run code once without an agent. Returns stdout/stderr/exit_code."""
    from app.tools.code_execution import code_execution_engine

    result = code_execution_engine.write_and_run(
        code=req.code,
        filename=req.filename,
        command=req.command,
    )

    return {
        "success":   result.success,
        "exit_code": result.exit_code,
        "stdout":    result.stdout,
        "stderr":    result.stderr,
        "duration_s": result.duration_s,
    }


# ── Sprint 42: TDD ────────────────────────────────────────────

class TDDRequest(BaseModel):
    requirement:    str
    module_name:    str = "solution"
    language:       str = "python"
    test_agent:     str = "tester"
    impl_agent:     str = "backend"
    max_iterations: int = 5


@router.post("/builder/tdd/run")
def run_tdd(req: TDDRequest) -> dict:
    """
    Sprint 42: Test-Driven Development.
    Tester writes tests → Backend implements → iterate until green.
    WARNING: Calls Ollama multiple times. Takes several minutes.
    """
    from app.tools.tdd_engine import tdd_engine

    result = tdd_engine.run(
        requirement=req.requirement,
        module_name=req.module_name,
        language=req.language,
        test_agent=req.test_agent,
        impl_agent=req.impl_agent,
        max_iterations=req.max_iterations,
    )

    return {
        "success":        result.success,
        "total_duration": result.total_duration,
        "working_dir":    result.working_dir,
        "tests_written":  result.tests_written[:1000],
        "implementation": result.implementation[:1000],
        "test_runs": [
            {
                "iteration": r.iteration,
                "passed":    r.passed,
                "failed":    r.failed,
                "total":     r.total,
                "success":   r.success,
                "duration_s": r.duration_s,
            }
            for r in result.test_runs
        ],
        "error": result.error,
    }


# ── Sprint 43: Browser Automation ─────────────────────────────

class ScreenshotRequest(BaseModel):
    url:    str
    wait_s: float = 2.0


class ClickRequest(BaseModel):
    url:      str
    selector: str


class FillRequest(BaseModel):
    url:    str
    fields: dict[str, str]


class VerifyRequest(BaseModel):
    url:        str
    assertions: list[str]


@router.post("/builder/browser/screenshot")
def browser_screenshot(req: ScreenshotRequest) -> dict:
    """Sprint 43: Take screenshot of a URL."""
    from app.tools.browser import browser_tool

    result = browser_tool.run("screenshot", url=req.url, wait_s=req.wait_s)

    if not result.success:
        raise HTTPException(status_code=502, detail=result.error)

    return result.output


@router.post("/builder/browser/click")
def browser_click(req: ClickRequest) -> dict:
    """Sprint 43: Click an element on a page."""
    from app.tools.browser import browser_tool

    result = browser_tool.run("click", url=req.url, selector=req.selector)

    if not result.success:
        raise HTTPException(status_code=502, detail=result.error)

    return result.output


@router.post("/builder/browser/fill")
def browser_fill(req: FillRequest) -> dict:
    """Sprint 43: Fill form fields on a page."""
    from app.tools.browser import browser_tool

    result = browser_tool.run("fill", url=req.url, fields=req.fields)

    if not result.success:
        raise HTTPException(status_code=502, detail=result.error)

    return result.output


@router.post("/builder/browser/verify")
def browser_verify(req: VerifyRequest) -> dict:
    """Sprint 43: Verify text/elements exist on a page."""
    from app.tools.browser import browser_tool

    result = browser_tool.run("verify", url=req.url, assertions=req.assertions)

    return {
        "success":    result.success,
        "assertions": result.output.get("assertions", {}),
        "all_passed": result.output.get("all_passed", False),
    }


# ── Sprint 44: Git Workflow ────────────────────────────────────

class BranchRequest(BaseModel):
    branch_name: str
    from_branch: str = "main"


class CommitRequest(BaseModel):
    message:  str
    add_all:  bool = True


class PRRequest(BaseModel):
    title:  str
    body:   str
    branch: str | None = None
    base:   str = "main"
    repo:   str | None = None


class FullWorkflowRequest(BaseModel):
    feature_name: str
    task:         str
    agent_name:   str = "backend"
    language:     str = "python"
    create_pr:    bool = False
    repo:         str | None = None


@router.post("/builder/git/branch")
def create_branch(req: BranchRequest) -> dict:
    """Sprint 44: Create a new git branch."""
    from app.tools.git_workflow import git_workflow_tool

    result = git_workflow_tool.run("create_branch", **req.model_dump())
    return {"success": result.success, "output": result.output, "error": result.error}


@router.post("/builder/git/commit")
def git_commit(req: CommitRequest) -> dict:
    """Sprint 44: Stage all changes and commit."""
    from app.tools.git_workflow import git_workflow_tool

    result = git_workflow_tool.run("stage_and_commit", **req.model_dump())
    return {"success": result.success, "output": result.output, "error": result.error}


@router.post("/builder/git/pr")
def create_pr(req: PRRequest) -> dict:
    """Sprint 44: Create a GitHub pull request."""
    from app.tools.git_workflow import git_workflow_tool

    result = git_workflow_tool.run("create_pr", **req.model_dump())

    if not result.success:
        raise HTTPException(status_code=502, detail=result.error)

    return result.output


@router.post("/builder/git/workflow")
def full_git_workflow(req: FullWorkflowRequest) -> dict:
    """Sprint 44: Full workflow — branch → code → commit → optional PR."""
    from app.tools.git_workflow import git_workflow_tool

    result = git_workflow_tool.run("full_workflow", **req.model_dump())
    return {"success": result.success, "output": result.output, "error": result.error}


@router.get("/builder/git/branch")
def current_branch() -> dict:
    """Get current git branch."""
    from app.tools.git_workflow import git_workflow_tool

    result = git_workflow_tool.run("current_branch")
    return {"branch": result.output}


# ── Sprint 45: Project Templates ──────────────────────────────

class ScaffoldRequest(BaseModel):
    template_id:   str
    project_name:  str
    description:   str   = ""
    output_dir:    str | None = None
    run_install:   bool  = False
    queue_tasks:   bool  = True


@router.get("/builder/templates")
def list_templates() -> dict:
    """Sprint 45: List all available project templates."""
    from app.templates.library import list_templates as _list

    return {"templates": _list()}


@router.get("/builder/templates/{template_id}")
def get_template(template_id: str) -> dict:
    """Sprint 45: Get details of a specific template."""
    from app.templates.library import get_template as _get

    template = _get(template_id)
    if not template:
        raise HTTPException(status_code=404, detail=f"Template {template_id!r} not found")

    return {
        "id":           template.id,
        "name":         template.name,
        "description":  template.description,
        "tech_stack":   template.tech_stack,
        "directories":  template.directories,
        "files":        [f.path for f in template.files],
        "install_cmds": template.install_cmds,
        "agent_tasks":  template.agent_tasks,
    }


@router.post("/builder/scaffold")
def scaffold_project(req: ScaffoldRequest) -> dict:
    """
    Sprint 45: Scaffold a complete project from a template.
    Creates directory structure, files, and queues agent tasks.
    """
    from app.templates.scaffold import project_scaffold

    result = project_scaffold.scaffold(
        template_id=req.template_id,
        project_name=req.project_name,
        description=req.description,
        output_dir=req.output_dir,
        run_install=req.run_install,
        queue_tasks=req.queue_tasks,
    )

    if not result.success:
        raise HTTPException(status_code=422, detail=result.error)

    return {
        "success":      result.success,
        "project_path": result.project_path,
        "files_created": result.files_created,
        "dirs_created": result.dirs_created,
        "setup_results": result.setup_results,
        "agent_tasks":  result.agent_tasks,
        "message":      f"Project scaffolded at {result.project_path}",
    }


# ── Upgrade: Project-scoped execution ────────────────────────

class ProjectCodeRequest(BaseModel):
    agent_name:     str         = "backend"
    task:           str
    project_name:   str         = ""
    language:       str         = "python"
    files:          dict[str, str] = {}  # filename → content to pre-populate
    max_iterations: int         = 8
    timeout_s:      int         = 120


@router.post("/builder/code/project")
def run_project_code(req: ProjectCodeRequest) -> dict:
    """
    Code execution with project isolation and pre-populated files.
    Each project_name gets its own isolated workspace directory.
    Pre-populate files (e.g. existing modules) before the agent runs.
    """
    from app.tools.code_execution import code_execution_engine
    from pathlib import Path

    # Create isolated workspace
    work_dir = code_execution_engine._create_workspace(
        req.agent_name, req.project_name
    )

    # Pre-populate files if provided
    for filename, content in req.files.items():
        filepath = work_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(content, encoding="utf-8")

    result = code_execution_engine.run_loop(
        agent_name=req.agent_name,
        task=req.task,
        language=req.language,
        working_dir=str(work_dir),
        max_iterations=req.max_iterations,
        timeout_s=req.timeout_s,
    )

    return {
        "success":      result.success,
        "iterations":   result.iterations,
        "final_output": result.final_output,
        "working_dir":  result.working_dir,
        "files_created": result.files_created,
        "history": [
            {
                "iteration": h.iteration,
                "exit_code": h.exit_code,
                "success":   h.success,
                "stdout":    h.stdout[:500],
                "stderr":    h.stderr[:300],
                "duration_s": h.duration_s,
            }
            for h in result.history
        ],
    }


@router.get("/builder/workspaces")
def list_workspaces() -> dict:
    """List all code execution workspaces."""
    from app.tools.code_execution import WORKSPACE_ROOT
    from pathlib import Path

    workspaces = []
    if WORKSPACE_ROOT.exists():
        for agent_dir in sorted(WORKSPACE_ROOT.iterdir()):
            if agent_dir.is_dir():
                for session_dir in sorted(agent_dir.iterdir(), reverse=True)[:3]:
                    if session_dir.is_dir():
                        files = list(session_dir.glob("*"))
                        workspaces.append({
                            "agent":   agent_dir.name,
                            "session": session_dir.name,
                            "path":    str(session_dir),
                            "files":   [f.name for f in files if f.is_file()],
                        })

    return {"workspaces": workspaces[:20]}
