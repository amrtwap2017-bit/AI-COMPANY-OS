from pathlib import Path
from .registry import Tool, registry
from hub.mcp.db import upsert_tool_def

def _read_text(args: dict) -> dict:
    path = Path(args["path"]).expanduser()
    text = path.read_text(encoding=args.get("encoding", "utf-8"))
    return {"path": str(path), "text": text}

def register():
    registry.register(Tool(
        name="filesystem.read_text",
        description="Read a text file from disk",
        handler=_read_text,
    ))

    upsert_tool_def(
        name="filesystem.read_text",
        description="Read a text file from disk",
        required_scopes=["tools.filesystem.read"],
        rate_limit_per_min=120,
        input_schema={"type":"object","properties":{"path":{"type":"string"}}, "required":["path"]},
        output_schema={"type":"object","properties":{"path":{"type":"string"},"text":{"type":"string"}}},
        is_enabled=True,
    )
