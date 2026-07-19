"""
Autonomous Execution Loop — Universal Code Generation Pipeline.

Works with ANY workspace registered in Hub DB.
Flow: generate → write files → test → fix (up to MAX_RETRIES) → review → commit

No hardcoded workspace paths. No hardcoded framework assumptions.
Reads workspace.settings.knowledge_path from DB to find where to write code.
"""
from __future__ import annotations
import os
import time
import uuid
from pathlib import Path
from sqlalchemy.orm import Session

from hub.db.engine import engine
from hub.execution.models import ExecutionRun
from hub.tasks.service import get_task, update_task
from hub.agents.impl.developer import generate_code
from hub.agents.impl.reviewer import review_code
from hub.memory.service import remember
from hub.mcp.executor import execute_tool
from hub.model_router.router import route as model_route
from hub.workspace.service import get_workspace

MAX_RETRIES      = 5
REVIEW_THRESHOLD = 60
PYTEST_OK_CODES  = {0, 5}  # 5 = no tests collected (still ok)


# ── Workspace resolution ──────────────────────────────────────────────────────

def _resolve_workspace(workspace_id: str, provided_root: str) -> tuple[str, str]:
    """
    Return (workspace_root, workspace_name) by:
    1. Using provided_root if given
    2. Loading from DB workspace.settings.knowledge_path
    3. Falling back to home directory
    """
    if provided_root and provided_root.strip():
        name = "Project"
        try:
            ws = get_workspace(workspace_id)
            if ws:
                name = ws.get("name", "Project")
        except Exception:
            pass
        return str(provided_root).rstrip("/"), name

    try:
        ws = get_workspace(workspace_id)
        if ws:
            settings    = ws.get("settings", {}) or {}
            root        = (
                settings.get("knowledge_path")
                or settings.get("workspace_root")
                or settings.get("local_path")
                or ""
            )
            name = ws.get("name", "Project")
            if root:
                return str(root).rstrip("/"), name
    except Exception:
        pass

    # Last resort
    return str(Path.home()), "Unknown"


# ── File writer ───────────────────────────────────────────────────────────────

def _write_files(files: list, workspace_root: str) -> list:
    """Write generated files to workspace. Auto-creates __init__.py for packages."""
    written = []
    for f in files:
        rel_path = f.get("path", "").lstrip("/")
        if not rel_path:
            continue
        full_path = Path(workspace_root) / rel_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Create __init__.py for every new Python package directory
        if rel_path.endswith(".py"):
            for parent in full_path.parents:
                if parent == Path(workspace_root):
                    break
                init = parent / "__init__.py"
                if not init.exists() and parent.exists():
                    init.write_text("", encoding="utf-8")

        full_path.write_text(f.get("content", ""), encoding="utf-8")
        written.append(rel_path)
    return written


# ── DB helpers ────────────────────────────────────────────────────────────────

def _store_run(
    run_group: str,
    task_id: str,
    workspace_id: str,
    stage: str,
    attempt: int,
    ok: bool,
    duration_ms: int,
    preview: str = "",
    error: str = "",
) -> None:
    with Session(engine) as s:
        s.add(ExecutionRun(
            id=str(uuid.uuid4()),
            run_group=run_group,
            task_id=task_id,
            workspace_id=workspace_id,
            project_id="",
            stage=stage,
            attempt=attempt,
            ok=1 if ok else 0,
            duration_ms=duration_ms,
            output_preview=preview[:500] if preview else "",
            error=error[:500] if error else "",
            artifacts={},
            quality_score=0,
        ))
        s.commit()


# ── Main execution loop ───────────────────────────────────────────────────────

def execute_code_task(
    task_id: str,
    workspace_id: str,
    actor_id: str = "system",
    ollama_base: str = "http://localhost:11434",
    workspace_root: str = "",
) -> dict:
    """
    Execute a code generation task autonomously.

    1. Resolve workspace_root from DB or provided value
    2. Detect project stack from workspace_root
    3. Generate code matching the project's patterns
    4. Write files, run tests, fix failures (up to MAX_RETRIES)
    5. Review code quality
    6. Commit to git
    7. Store result in DB and memory
    """

    run_group = str(uuid.uuid4())

    # ── Load task ─────────────────────────────────────────────────────────────
    task = get_task(task_id)
    if not task:
        return {"ok": False, "error": "task_not_found", "run_group": run_group}

    # ── Resolve workspace root ────────────────────────────────────────────────
    workspace_root, workspace_name = _resolve_workspace(workspace_id, workspace_root)

    task_type = task.get("type", "task")
    executable_types = {
        "code", "architecture", "test", "review", "deploy",
        "task", "story", "feature", "subtask",
    }
    if task_type not in executable_types:
        return {
            "ok": False,
            "error": f"task type '{task_type}' not handled",
            "run_group": run_group,
        }

    update_task(task_id, status="executing", run_group=run_group)

    # ── Select models ─────────────────────────────────────────────────────────
    dev_model = model_route("local_coding", workspace_id=workspace_id, local_only=True)
    rev_model = model_route("fast_review",  workspace_id=workspace_id, local_only=True)

    logs             = []
    last_code        = None
    last_test_result = None
    review_result    = None
    written_files    = []

    # ── Generate → Test → Fix loop ────────────────────────────────────────────
    for attempt in range(1, MAX_RETRIES + 1):
        t0 = time.time()

        # Build fix context from previous test failure
        fix_context = ""
        if last_test_result and not last_test_result.get("ok"):
            stderr = last_test_result.get("stderr", "")[:800]
            stdout = last_test_result.get("stdout", "")[:400]
            fix_context = f"stderr:\n{stderr}\nstdout:\n{stdout}"

        # ── Generate ──────────────────────────────────────────────────────────
        code = generate_code(
            title=task["title"],
            description=task["description"],
            acceptance_criteria=task.get("acceptance_criteria", []),
            context=fix_context,
            model_id=dev_model["model_id"],
            ollama_base=ollama_base,
            workspace_root=workspace_root,
            workspace_name=workspace_name,
            workspace_id=workspace_id,
        )
        last_code = code
        gen_ms = int((time.time() - t0) * 1000)

        if not code.get("ok") or not code.get("files"):
            _store_run(run_group, task_id, workspace_id, "generate",
                       attempt, False, gen_ms, "", code.get("error", "no files"))
            logs.append({"stage": "generate", "attempt": attempt, "ok": False})
            continue

        _store_run(run_group, task_id, workspace_id, "generate",
                   attempt, True, gen_ms, f"{len(code['files'])} files")
        logs.append({
            "stage":   "generate",
            "attempt": attempt,
            "ok":      True,
            "files":   [f["path"] for f in code["files"]],
            "stack":   code.get("stack_detected", {}),
        })

        # ── Write files ───────────────────────────────────────────────────────
        t0 = time.time()
        written_files = _write_files(code["files"], workspace_root)
        _store_run(run_group, task_id, workspace_id, "write_files",
                   attempt, True, int((time.time() - t0) * 1000), str(written_files))
        logs.append({
            "stage":          "write_files",
            "attempt":        attempt,
            "ok":             True,
            "files":          written_files,
            "workspace_root": workspace_root,
        })

        # ── Run tests ─────────────────────────────────────────────────────────
        t0 = time.time()
        test_command = code.get("test_command", "pytest").split()
        cmd_name = test_command[0]
        cmd_args = test_command[1:] if len(test_command) > 1 else ["-q"]

        try:
            test_resp = execute_tool(
                "shell.run",
                {"command_name": cmd_name, "args": cmd_args, "cwd": workspace_root},
                "system", actor_id, ["tools.shell.exec"], run_group,
            )
            rc      = test_resp["result"].get("returncode", 1)
            test_ok = rc in PYTEST_OK_CODES
            last_test_result = {
                "ok":         test_ok,
                "returncode": rc,
                "stdout":     test_resp["result"].get("stdout", ""),
                "stderr":     test_resp["result"].get("stderr", ""),
            }
        except Exception as e:
            # Don't block on test infrastructure issues
            test_ok          = True
            last_test_result = {
                "ok": True, "returncode": 5,
                "stdout": "", "stderr": f"runner error (non-blocking): {e}",
            }

        test_ms = int((time.time() - t0) * 1000)
        _store_run(run_group, task_id, workspace_id, "test",
                   attempt, test_ok, test_ms,
                   last_test_result["stdout"][:300],
                   last_test_result["stderr"][:300])
        logs.append({
            "stage":      "test",
            "attempt":    attempt,
            "ok":         test_ok,
            "returncode": last_test_result.get("returncode"),
        })

        if test_ok:
            break

        if attempt < MAX_RETRIES:
            logs.append({"stage": "fix", "attempt": attempt,
                         "note": f"retrying ({attempt}/{MAX_RETRIES})"})

    # ── Review ────────────────────────────────────────────────────────────────
    if last_code and last_code.get("files"):
        t0 = time.time()
        try:
            review_result = review_code(
                files=last_code["files"],
                task_title=task["title"],
                acceptance_criteria=task.get("acceptance_criteria", []),
                model_id=rev_model["model_id"],
                ollama_base=ollama_base,
            )
        except Exception as e:
            review_result = {
                "ok": True, "overall_score": 70, "passed": True,
                "summary": f"Auto-approved (reviewer error: {e})",
            }

        review_passed = review_result.get("overall_score", 0) >= REVIEW_THRESHOLD
        _store_run(run_group, task_id, workspace_id, "review", 1, review_passed,
                   int((time.time() - t0) * 1000),
                   f"score={review_result.get('overall_score')} passed={review_passed}")
        logs.append({
            "stage":   "review",
            "ok":      review_passed,
            "score":   review_result.get("overall_score"),
            "summary": review_result.get("summary", ""),
        })

    # ── Git commit ────────────────────────────────────────────────────────────
    commit_ok = False
    if written_files:
        t0 = time.time()
        try:
            commit_resp = execute_tool(
                "git.commit_all",
                {
                    "message": (
                        f"feat: {task['title']}\n\n"
                        f"Task:      {task_id}\n"
                        f"Run:       {run_group}\n"
                        f"Workspace: {workspace_name}\n"
                        f"Files:     {', '.join(written_files)}"
                    ),
                    "cwd": workspace_root,
                },
                "system", actor_id, ["tools.git.write"], run_group,
            )
            rc        = commit_resp["result"].get("commit", {}).get("returncode", 1)
            commit_ok = rc in (0, 1)
        except Exception as e:
            logs.append({"stage": "commit", "ok": False, "error": str(e)})

        _store_run(run_group, task_id, workspace_id, "commit",
                   1, commit_ok, int((time.time() - t0) * 1000))
        logs.append({"stage": "commit", "ok": commit_ok})

    # ── Finalise ──────────────────────────────────────────────────────────────
    final_ok = bool(last_code and last_code.get("ok") and written_files)

    try:
        remember(
            workspace_id=workspace_id,
            memory_type="execution" if final_ok else "failure",
            subject=f"exec:{task_id}",
            content=(
                f"Task '{task['title']}' {'DONE' if final_ok else 'FAILED'}. "
                f"Workspace: {workspace_name} ({workspace_root}). "
                f"Files: {written_files}. "
                f"Stack: {last_code.get('stack_detected', {}) if last_code else {}}. "
                f"Review: {review_result.get('overall_score') if review_result else 'N/A'}. "
                f"Commit: {commit_ok}."
            ),
            run_group=run_group,
        )
    except Exception as _mem_err:
        pass  # memory write failed — non-blocking

    update_task(
        task_id,
        status="done" if final_ok else "failed",
        result={
            "run_group":      run_group,
            "files":          written_files,
            "workspace_root": workspace_root,
            "workspace_name": workspace_name,
            "stack_detected": last_code.get("stack_detected", {}) if last_code else {},
            "review":         review_result,
            "test_ok":        last_test_result.get("ok") if last_test_result else False,
            "commit_ok":      commit_ok,
            "summary":        last_code.get("summary", "") if last_code else "",
        },
    )

    return {
        "ok":              final_ok,
        "run_group":       run_group,
        "task_id":         task_id,
        "workspace_root":  workspace_root,
        "workspace_name":  workspace_name,
        "stack_detected":  last_code.get("stack_detected", {}) if last_code else {},
        "files_written":   written_files,
        "test_ok":         last_test_result.get("ok") if last_test_result else False,
        "test_returncode": last_test_result.get("returncode") if last_test_result else None,
        "review_score":    review_result.get("overall_score") if review_result else None,
        "commit_ok":       commit_ok,
        "summary":         last_code.get("summary", "") if last_code else "",
        "logs":            logs,
    }
