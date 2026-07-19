from sqlalchemy.orm import Session
from sqlalchemy import select

from hub.db.engine import engine
from hub.mcp.models import ToolDefinition, ToolCallAudit

def get_tool_def(name: str) -> ToolDefinition | None:
    with Session(engine) as s:
        return s.execute(select(ToolDefinition).where(ToolDefinition.name == name)).scalar_one_or_none()

def upsert_tool_def(
    name: str,
    description: str,
    required_scopes: list[str] | None = None,
    rate_limit_per_min: int = 60,
    input_schema: dict | None = None,
    output_schema: dict | None = None,
    is_enabled: bool = True,
) -> None:
    with Session(engine) as s:
        row = s.execute(select(ToolDefinition).where(ToolDefinition.name == name)).scalar_one_or_none()
        if not row:
            row = ToolDefinition(
                name=name,
                description=description,
                required_scopes=required_scopes or [],
                rate_limit_per_min=rate_limit_per_min,
                input_schema=input_schema or {},
                output_schema=output_schema or {},
                is_enabled=1 if is_enabled else 0,
            )
            s.add(row)
        else:
            row.description = description
            row.required_scopes = required_scopes or row.required_scopes
            row.rate_limit_per_min = rate_limit_per_min
            row.input_schema = input_schema or row.input_schema
            row.output_schema = output_schema or row.output_schema
            row.is_enabled = 1 if is_enabled else 0
        s.commit()

def write_audit(
    actor_type: str,
    actor_id: str,
    tool_name: str,
    ok: bool,
    args: dict,
    latency_ms: int,
    run_group: str = "",
    result_meta: dict | None = None,
    error: str = "",
) -> None:
    with Session(engine) as s:
        s.add(ToolCallAudit(
            run_group=run_group or "",
            actor_type=actor_type,
            actor_id=actor_id,
            tool_name=tool_name,
            ok=1 if ok else 0,
            args=args or {},
            result_meta=result_meta or {},
            error=error or "",
            latency_ms=latency_ms,
        ))
        s.commit()
