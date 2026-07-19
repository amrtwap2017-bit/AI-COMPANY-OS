import time
import uuid
from sqlalchemy.orm import Session

from hub.db.engine import engine
from hub.builder.models import BuilderRun
from hub.mcp.executor import execute_tool
from hub.benchmarks.service import run_and_store as run_benchmark_and_store

def execute_plan(plan: dict, actor_type: str, actor_id: str, scopes: list[str]) -> dict:
    run_group = str(uuid.uuid4())
    t0 = time.time()
    ok = False
    error = ""
    results = []

    requirement = plan.get("requirement", "")

    try:
        for step in plan.get("steps", []):
            tool = step["tool"]
            args = step.get("args", {})
            resp = execute_tool(
                tool_name=tool,
                args=args,
                actor_type=actor_type,
                actor_id=actor_id,
                scopes=scopes,
                run_group=run_group,
            )
            results.append({"tool": tool, "args": args, "resp": resp})

        gate = plan.get("benchmark_gate", {}) or {}
        if gate.get("enabled"):
            bench = run_benchmark_and_store(
                run_group=run_group,
                benchmark_id=gate.get("benchmark_id", "default"),
                agent_name=gate.get("agent_name"),
                use_llm_scoring=gate.get("use_llm_scoring"),
            )
            results.append({"benchmark_gate": bench})
            if not bench.get("ok", True):
                raise RuntimeError("Benchmark regression detected")

        ok = True
        return {"ok": True, "run_group": run_group, "results": results}
    except Exception as e:
        error = str(e)
        return {"ok": False, "run_group": run_group, "error": error, "results": results}
    finally:
        duration_ms = int((time.time() - t0) * 1000)
        with Session(engine) as s:
            s.add(BuilderRun(
                run_group=run_group,
                actor_type=actor_type,
                actor_id=actor_id,
                requirement=requirement,
                plan=plan,
                results=results,
                ok=1 if ok else 0,
                error=error,
                duration_ms=duration_ms,
            ))
            s.commit()
