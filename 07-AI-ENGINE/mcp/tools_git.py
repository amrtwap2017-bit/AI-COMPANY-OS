import subprocess
from hub.mcp.registry import Tool, registry
from hub.mcp.db import upsert_tool_def

def _run(cmd: list[str], check: bool = True) -> dict:
    p = subprocess.run(cmd, capture_output=True, text=True)
    out = {"cmd": cmd, "returncode": p.returncode, "stdout": p.stdout, "stderr": p.stderr}
    if check and p.returncode != 0:
        raise RuntimeError(f"Command failed: {cmd} rc={p.returncode} stderr={p.stderr}")
    return out

def _git_status(args: dict) -> dict:
    return _run(["git", "status", "--porcelain=v1"], check=True)

def _git_diff(args: dict) -> dict:
    path = args.get("path")
    cmd = ["git", "diff"]
    if path:
        cmd.append(path)
    return _run(cmd, check=True)

def _git_checkout_new_branch(args: dict) -> dict:
    name = args["name"]
    return _run(["git", "checkout", "-b", name], check=True)

def _git_commit_all(args: dict) -> dict:
    message = args["message"]
    r1 = _run(["git", "add", "-A"], check=True)
    r2 = _run(["git", "commit", "-m", message], check=True)
    return {"stage": r1, "commit": r2}

def register():
    registry.register(Tool("git.status", "Git status (porcelain)", _git_status))
    registry.register(Tool("git.diff", "Git diff (optionally for a path)", _git_diff))
    registry.register(Tool("git.checkout_new_branch", "Create and checkout new branch", _git_checkout_new_branch))
    registry.register(Tool("git.commit_all", "Stage all changes and commit", _git_commit_all))

    upsert_tool_def(
        name="git.status",
        description="Git status (porcelain)",
        required_scopes=["tools.git.read"],
        rate_limit_per_min=120,
        input_schema={"type":"object","properties":{}},
        output_schema={"type":"object"},
        is_enabled=True,
    )
    upsert_tool_def(
        name="git.diff",
        description="Git diff (optionally for a path)",
        required_scopes=["tools.git.read"],
        rate_limit_per_min=120,
        input_schema={"type":"object","properties":{"path":{"type":"string"}}},
        output_schema={"type":"object"},
        is_enabled=True,
    )
    upsert_tool_def(
        name="git.checkout_new_branch",
        description="Create and checkout a new git branch",
        required_scopes=["tools.git.write"],
        rate_limit_per_min=30,
        input_schema={"type":"object","properties":{"name":{"type":"string"}}, "required":["name"]},
        output_schema={"type":"object"},
        is_enabled=True,
    )
    upsert_tool_def(
        name="git.commit_all",
        description="Stage all changes and commit",
        required_scopes=["tools.git.write"],
        rate_limit_per_min=30,
        input_schema={"type":"object","properties":{"message":{"type":"string"}}, "required":["message"]},
        output_schema={"type":"object"},
        is_enabled=True,
    )
