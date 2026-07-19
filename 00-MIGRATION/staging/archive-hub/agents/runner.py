import time
from sqlalchemy.orm import Session

from hub.db.engine import engine
from hub.agents.models import AgentRun
from hub.context.packs import build_context_pack
from hub.mcp.executor import execute_tool

def run_agent(
    actor_type: str,
    actor_id: str,
    intent: str,
    user_request: str,
    scopes: list[str],
    run_group: str = "",
) -> dict:
    t0 = time.time()
    ok = False
    error = ""

    plan = {"steps": [{"tool": "filesystem.read_text", "args": {"path": "README.md"}}]}
    tool_calls = []
    output = {}

    try:
        pack = build_context_pack(user_request=user_request, intent=intent)
        output["context_pack"] = {"id": pack.context_pack_id, "version": pack.version}

        resp = execute_tool(
            tool_name="filesystem.read_text",
            args={"path": "README.md"},
            actor_type=actor_type,
            actor_id=actor_id,
            scopes=scopes or [],
            run_group=run_group or "",
        )
        tool_calls.append({"name": "filesystem.read_text", "ok": True})
        output["readme_preview"] = resp["result"]["text"][:200]

        ok = True
        return {"ok": True, "run_group": run_group, "plan": plan, "output": output}
    except Exception as e:
        error = str(e)
        tool_calls.append({"ok": False, "error": error})
        return {"ok": False, "run_group": run_group, "plan": plan, "error": error}
    finally:
        duration_ms = int((time.time() - t0) * 1000)
        with Session(engine) as s:
            s.add(AgentRun(
                run_group=run_group or "",
                actor_type=actor_type,
                actor_id=actor_id,
                intent=intent,
                user_request=user_request,
                plan=plan,
                tool_calls=tool_calls,
                output=output,
                ok=1 if ok else 0,
                error=error,
                duration_ms=duration_ms,
            ))
            s.commit()
