import os
import fnmatch
import hashlib
from pathlib import Path
from hub.mcp.registry import Tool, registry
from hub.mcp.db import upsert_tool_def

DEFAULT_EXCLUDES = [
    ".git/**",
    ".venv/**",
    "**/__pycache__/**",
    "**/*.pyc",
    "node_modules/**",
    ".next/**",
    "dist/**",
    "build/**",
    ".pytest_cache/**",
]

def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def _is_excluded(rel_posix: str, patterns: list[str]) -> bool:
    for pat in patterns:
        if fnmatch.fnmatch(rel_posix, pat):
            return True
    return False

def _repo_scan(args: dict) -> dict:
    root = Path(args.get("root", ".")).resolve()
    max_files = int(args.get("max_files", 5000))
    hash_files = bool(args.get("hash_files", True))
    excludes = args.get("excludes") or DEFAULT_EXCLUDES

    files = []
    count = 0

    for dirpath, dirnames, filenames in os.walk(root):
        rel_dir = str(Path(dirpath).resolve().relative_to(root)).replace("\\", "/")
        if rel_dir == ".":
            rel_dir = ""

        pruned = []
        for d in list(dirnames):
            rel = (f"{rel_dir}/{d}" if rel_dir else d).replace("\\", "/")
            if _is_excluded(rel + "/**", excludes) or _is_excluded(rel, excludes):
                pruned.append(d)
        for d in pruned:
            dirnames.remove(d)

        for fn in filenames:
            rel = (f"{rel_dir}/{fn}" if rel_dir else fn).replace("\\", "/")
            if _is_excluded(rel, excludes):
                continue

            p = (Path(dirpath) / fn).resolve()
            try:
                st = p.stat()
            except FileNotFoundError:
                continue

            rec = {"path": rel, "size": st.st_size, "mtime": int(st.st_mtime)}
            if hash_files and st.st_size <= 5 * 1024 * 1024:
                rec["sha256"] = sha256_file(p)

            files.append(rec)
            count += 1
            if count >= max_files:
                return {"root": str(root), "truncated": True, "max_files": max_files, "count": count, "files": files}

    return {"root": str(root), "truncated": False, "max_files": max_files, "count": count, "files": files}

def register():
    registry.register(Tool(
        name="repo.scan",
        description="Scan a repository directory and return file inventory (optionally sha256).",
        handler=_repo_scan,
    ))

    upsert_tool_def(
        name="repo.scan",
        description="Scan repository and return file inventory",
        required_scopes=["tools.repo.read"],
        rate_limit_per_min=10,
        input_schema={"type":"object"},
        output_schema={"type":"object"},
        is_enabled=True,
    )
