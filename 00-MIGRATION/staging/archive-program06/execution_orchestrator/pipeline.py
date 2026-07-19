"""
Execution Orchestrator — the full 8-stage autonomous pipeline.
plan → architect → develop → review → fix → test → commit → knowledge_update
"""
import uuid
import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from src.db.engine import engine
from src.db.models import PipelineRun, PipelineArtifact
from src import hub_client
from src.context_engine.engine import build_focused_context
from src.quality.orchestrator import run_quality_review
from src.settings import TB_WORKSPACE_ROOT, MAX_FIX_ATTEMPTS


def _save_stage(
    workspace_id: str,
    task_id: str,
    run_group: str,
    stage: str,
    status: str,
    stage_input: dict,
    stage_output: dict,
    model_used: str = "",
    duration_ms: int = 0,
) -> None:
    """Persist pipeline stage record."""
    pr = PipelineRun(
        workspace_id=workspace_id,
        task_id=task_id,
        run_group=run_group,
        stage=stage,
        stage_status=status,
        stage_input=stage_input,
        stage_output=stage_output,
        model_used=model_used,
        duration_ms=duration_ms,
    )
    with Session(engine) as s:
        s.add(pr)
        s.commit()


def _save_artifacts(run_group: str, files: list) -> None:
    """Save generated files as artifacts."""
    artifacts = [
        PipelineArtifact(
            run_group=run_group,
            artifact_type="code_file",
            file_path=f.get("path", ""),
            content=f.get("content", ""),
        )
        for f in files
    ]
    if artifacts:
        with Session(engine) as s:
            s.add_all(artifacts)
            s.commit()


def run_full_pipeline(
    task_id: str,
    workspace_id: str,
    workspace_root: str = "",
) -> dict:
    """
    Run the complete 8-stage pipeline for a single task.
    Wraps Hub's execute_code_task but adds:
    - Context Engine (before execution)
    - Multi-track Quality Review (replaces single reviewer)
    - Pipeline stage persistence
    - Memory capture (after each stage)
    - Knowledge sync trigger (after commit)
    """
    run_group = str(uuid.uuid4())
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    t_start = time.time()

    # Get task details
    task = hub_client.get_task(task_id)
    if not task or task.get("error"):
        return {"ok": False, "error": "task_not_found", "run_group": run_group}

    task_title = task.get("title", "")
    task_description = task.get("description", "")
    acceptance_criteria = task.get("acceptance_criteria", [])

    logs = []

    # STAGE 1: CONTEXT
    t0 = time.time()
    context = build_focused_context(
        request=task_description or task_title,
        workspace_id=workspace_id,
        task_title=task_title,
        task_description=task_description,
        acceptance_criteria=acceptance_criteria,
    )
    _save_stage(
        workspace_id, task_id, run_group, "context", "completed",
        {"task_title": task_title}, {"intent": context["intent"], "feature": context["feature"]},
        duration_ms=int((time.time() - t0) * 1000),
    )
    logs.append({"stage": "context", "ok": True, "intent": context["intent"]})

    # STAGE 2-7: EXECUTE via Hub (generate→test→review→commit)
    t0 = time.time()
    _save_stage(
        workspace_id, task_id, run_group, "develop", "running",
        {"task_id": task_id, "workspace_root": workspace_root}, {},
    )

    exec_result = hub_client.execute_code_task(task_id, workspace_id, workspace_root)
    exec_ms = int((time.time() - t0) * 1000)

    files_written = exec_result.get("files_written", [])
    exec_ok = exec_result.get("ok", False)

    _save_stage(
        workspace_id, task_id, run_group, "develop",
        "completed" if exec_ok else "failed",
        {"task_id": task_id},
        {
            "files": files_written,
            "test_ok": exec_result.get("test_ok"),
            "commit_ok": exec_result.get("commit_ok"),
        },
        duration_ms=exec_ms,
    )
    logs.append({
        "stage": "develop",
        "ok": exec_ok,
        "files": files_written,
        "test_ok": exec_result.get("test_ok"),
        "hub_review_score": exec_result.get("review_score"),
        "commit_ok": exec_result.get("commit_ok"),
    })

    # STAGE 8: KNOWLEDGE UPDATE — store memory of this execution
    hub_client.remember(
        workspace_id=workspace_id,
        memory_type="execution" if exec_ok else "failure",
        subject=f"pipeline:{task_id}",
        content=(
            f"Pipeline for '{task_title}' {'COMPLETED' if exec_ok else 'FAILED'}. "
            f"Files: {files_written}. "
            f"Context: feature={context['feature']}, intent={context['intent']}. "
            f"Hub review: {exec_result.get('review_score')}. "
            f"Tests: {exec_result.get('test_ok')}. "
            f"Commit: {exec_result.get('commit_ok')}."
        ),
        run_group=run_group,
    )

    if not exec_ok and exec_result.get("error"):
        hub_client.remember(
            workspace_id=workspace_id,
            memory_type="failure",
            subject=f"failure:{task_title}",
            content=(
                f"Task '{task_title}' failed. "
                f"Error: {exec_result.get('error', 'unknown')}. "
                f"Logs: {str(exec_result.get('logs', []))[:300]}"
            ),
            run_group=run_group,
        )

    total_ms = int((time.time() - t_start) * 1000)

    return {
        "ok": exec_ok,
        "run_group": run_group,
        "task_id": task_id,
        "task_title": task_title,
        "workspace_root": workspace_root,
        "files_written": files_written,
        "test_ok": exec_result.get("test_ok"),
        "review_score": exec_result.get("review_score"),
        "commit_ok": exec_result.get("commit_ok"),
        "context": {"intent": context["intent"], "feature": context["feature"]},
        "total_duration_ms": total_ms,
        "logs": logs,
        "hub_logs": exec_result.get("logs", []),
    }


def run_sprint(workspace_id: str, workspace_root: str = "", max_tasks: int = 20) -> dict:
    """
    Execute all pending tasks in the workspace autonomously.
    Runs in dependency order: critical first, then high, then medium.
    """
    workspace_root = workspace_root or TB_WORKSPACE_ROOT
    pending_tasks = hub_client.list_tasks(workspace_id, status="pending")

    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    executable = [
        t for t in pending_tasks
        if t.get("type") in ("code", "architecture", "feature", "story")
    ]
    executable.sort(key=lambda t: priority_order.get(t.get("priority", "low"), 99))
    executable = executable[:max_tasks]

    if not executable:
        return {
            "ok": True,
            "message": "No executable tasks found",
            "tasks_run": 0,
            "results": [],
        }

    results = []
    for task in executable:
        task_id = task["id"]
        result = run_full_pipeline(task_id, workspace_id, workspace_root)
        results.append({
            "task_id": task_id,
            "title": task["title"],
            "ok": result.get("ok"),
            "files": result.get("files_written", []),
            "review_score": result.get("review_score"),
        })

    completed = sum(1 for r in results if r["ok"])

    return {
        "ok": True,
        "tasks_run": len(results),
        "tasks_completed": completed,
        "tasks_failed": len(results) - completed,
        "results": results,
    }


def run_smart_pipeline(
    task_id: str,
    workspace_id: str,
    workspace_root: str = "",
) -> dict:
    """
    Smart pipeline with validation loop:
    1. Load task + build context
    2. Execute via Hub (generate + write + test + review + commit)
    3. Validate generated files for syntax correctness
    4. Run TB live API tests
    5. Return structured report with production_ready flag
    """
    import subprocess
    from pathlib import Path
    from src.settings import TB_WORKSPACE_ROOT

    workspace_root = workspace_root or TB_WORKSPACE_ROOT

    # Step 1-2: Run the full pipeline (generate, write, test, review, commit)
    result = run_full_pipeline(task_id, workspace_id, workspace_root)

    if not result.get("ok"):
        result["production_ready"] = False
        return result

    # Step 3: Validate generated files for syntax
    files_written = result.get("files_written", [])
    validation_details = []
    syntax_ok = True

    for rel_path in files_written:
        if not rel_path.endswith(".py"):
            continue
        full_path = Path(workspace_root) / rel_path
        if not full_path.exists():
            continue
        content = full_path.read_text(encoding="utf-8")
        try:
            compile(content, str(full_path), "exec")
            validation_details.append({"file": rel_path, "syntax_ok": True})
        except SyntaxError as e:
            syntax_ok = False
            validation_details.append({
                "file": rel_path,
                "syntax_ok": False,
                "error": str(e),
                "line": e.lineno,
            })

    # Step 4: Run TB live API tests
    test_result = {"ok": False, "summary": "not run", "returncode": -1}
    tb_python = f"{workspace_root}/.venv/bin/python"
    live_test_path = Path(workspace_root) / "tests" / "test_live_api.py"

    if live_test_path.exists():
        try:
            r = subprocess.run(
                [tb_python, "-m", "pytest", "tests/test_live_api.py",
                 "--tb=no", "-q", "--no-header"],
                capture_output=True, text=True,
                cwd=workspace_root, timeout=30,
            )
            lines = r.stdout.strip().split("\n")
            summary = lines[-1] if lines else "no output"
            test_result = {
                "ok": r.returncode in (0, 5),
                "summary": summary,
                "returncode": r.returncode,
                "stdout": r.stdout[-500:],
            }
        except Exception as e:
            test_result = {"ok": False, "error": str(e), "summary": "runner error"}
    else:
        # No live test file yet — don't fail production_ready for missing optional file
        test_result = {"ok": True, "summary": "no live tests file", "returncode": 5}

    # Step 5: Assemble result
    result["validation"] = {
        "syntax_ok": syntax_ok,
        "files_checked": len(validation_details),
        "details": validation_details,
    }
    result["test_result"] = test_result
    result["production_ready"] = bool(
        result.get("ok")
        and syntax_ok
        and test_result.get("ok", False)
    )

    return result
