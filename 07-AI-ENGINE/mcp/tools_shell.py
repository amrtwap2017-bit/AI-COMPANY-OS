import subprocess
from hub.mcp.registry import Tool, registry
from hub.mcp.db import upsert_tool_def

ALLOWED = {
    "pytest": ["pytest", "-q"],
}

def _shell_run(args: dict) -> dict:
    name = args["command_name"]
    if name not in ALLOWED:
        raise ValueError(f"Command not allowed: {name}")
    cmd = ALLOWED[name]
    p = subprocess.run(cmd, capture_output=True, text=True)
    return {
        "cmd": cmd,
        "returncode": p.returncode,
        "stdout": p.stdout,
        "stderr": p.stderr,
    }

def register():
    registry.register(Tool("shell.run", "Run allowlisted shell commands (safe mode)", _shell_run))
    upsert_tool_def(
        name="shell.run",
        description="Run allowlisted shell commands",
        required_scopes=["tools.shell.exec"],
        rate_limit_per_min=30,
        input_schema={"type":"object","properties":{"command_name":{"type":"string"}}, "required":["command_name"]},
        output_schema={"type":"object"},
        is_enabled=True,
    )
