import time
import uuid
import httpx
from sqlalchemy.orm import Session
from hub.db.engine import engine
from hub.execution.models import ExecutionRun
from hub.tasks.service import get_task, update_task
from hub.context.packs import build_context_pack
from hub.model_router.router import route as model_route
from hub.foundation.settings import settings

def _store_run(run_id: str, run_group: str, task_id: str, workspace_id: str, project_id: str, stage: str, attempt: int, ok: bool, duration_ms: int, output_preview: str = "", error: str = "", artifacts: dict | None = None) -> None:
    with Session(engine) as s:
        s.add(ExecutionRun(
            id=run_id,
            run_group=run_group,
            task_id=task_id,
            workspace_id=workspace_id,
            project_id=project_id or "",
            stage=stage,
            attempt=attempt,
            ok=1 if ok else 0,
            duration_ms=duration_ms,
            output_preview=output_preview[:500],
            error=error,
            artifacts=artifacts or {},
        ))
        s.commit()

def execute_task(task_id: str, workspace_id: str, project_id: str = "", actor_id: str = "system") -> dict:
    run_group = str(uuid.uuid4())
    task = get_task(task_id)
    if not task:
        return {"ok": False, "error": "task_not_found", "run_group": run_group}

    update_task(task_id, status="executing", run_group=run_group)
    run_logs = []
    ok = False
    error = ""

    try:
        # Stage 1: build context pack
        t0 = time.time()
        model = model_route("general", workspace_id=workspace_id)
        pack = build_context_pack(
            user_request=task["title"] + " " + task["description"],
            intent="engineering",
            repo_key=workspace_id,
        )
        _store_run(str(uuid.uuid4()), run_group, task_id, workspace_id, project_id, "context", 1, True, int((time.time()-t0)*1000), f"pack_id={pack.context_pack_id} model={model['model_id']}")
        run_logs.append({"stage": "context", "ok": True, "model": model["model_id"], "context_pack_id": pack.context_pack_id})

        # Stage 2: delegate to AI Company OS if available
        t0 = time.time()
        aicos_url = settings.ai_company_os_base_url
        try:
            resp = httpx.post(
                f"{aicos_url}/api/v1/tasks/{task_id}/run",
                params={"workspace_id": workspace_id},
                timeout=300,
            )
            if resp.status_code == 200:
                aicos_result = resp.json()
                _store_run(str(uuid.uuid4()), run_group, task_id, workspace_id, project_id, "aicos_execute", 1, True, int((time.time()-t0)*1000), str(aicos_result)[:500])
                run_logs.append({"stage": "aicos_execute", "ok": True, "result": aicos_result})
                ok = True
                update_task(task_id, status="done", result={"run_logs": run_logs, "aicos": aicos_result})
                return {"ok": True, "run_group": run_group, "run_logs": run_logs, "aicos_result": aicos_result}
            else:
                raise RuntimeError(f"AICOS returned {resp.status_code}: {resp.text[:200]}")
        except httpx.RequestError as e:
            # AI Company OS not available, run local fallback
            _store_run(str(uuid.uuid4()), run_group, task_id, workspace_id, project_id, "aicos_execute", 1, False, int((time.time()-t0)*1000), "", str(e))
            run_logs.append({"stage": "aicos_execute", "ok": False, "error": str(e), "note": "AICOS unreachable, running local fallback"})

        # Local fallback: just mark as planned
        update_task(task_id, status="done", result={"run_logs": run_logs, "model": model, "note": "local_fallback"})
        ok = True
        return {"ok": True, "run_group": run_group, "run_logs": run_logs, "model": model, "note": "local_fallback"}

    except Exception as e:
        error = str(e)
        update_task(task_id, status="failed", error=error)
        return {"ok": False, "run_group": run_group, "error": error, "run_logs": run_logs}
