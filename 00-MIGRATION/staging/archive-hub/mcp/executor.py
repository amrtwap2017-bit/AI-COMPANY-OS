import time
from fastapi import HTTPException

from hub.mcp.registry import registry
from hub.mcp.db import get_tool_def, write_audit
from hub.mcp.policy import is_allowed
from hub.mcp.limiter import allow_call

def execute_tool(
    tool_name: str,
    args: dict,
    actor_type: str,
    actor_id: str,
    scopes: list[str],
    run_group: str = "",
) -> dict:
    t0 = time.time()
    ok = False
    error = ""
    count = 0

    tool_def = get_tool_def(tool_name)
    if not tool_def:
        raise HTTPException(status_code=404, detail=f"Unknown tool: {tool_name}")

    if not tool_def.is_enabled:
        raise HTTPException(status_code=403, detail=f"Tool disabled: {tool_name}")

    if not is_allowed(tool_def.required_scopes or [], scopes or []):
        raise HTTPException(status_code=403, detail=f"Missing required scopes for {tool_name}: {tool_def.required_scopes}")

    allowed, count = allow_call(
        actor_id=actor_id,
        tool_name=tool_name,
        limit_per_min=int(tool_def.rate_limit_per_min),
    )
    if not allowed:
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded for {tool_name}")

    try:
        result = registry.call(tool_name, args or {})
        ok = True
        return {"result": result, "rate_limit_counter": count}
    except Exception as e:
        error = str(e)
        raise
    finally:
        latency_ms = int((time.time() - t0) * 1000)
        write_audit(
            actor_type=actor_type,
            actor_id=actor_id,
            tool_name=tool_name,
            ok=ok,
            args=args or {},
            latency_ms=latency_ms,
            run_group=run_group or "",
            result_meta={"rate_limit_counter": count},
            error=error,
        )
