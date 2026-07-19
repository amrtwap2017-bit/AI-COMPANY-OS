"""
Workspace Explorer — reads a workspace and builds a complete picture.
Used by the sprint planner to understand what exists and what's missing.
"""
import os
import subprocess
import json
from pathlib import Path
from datetime import datetime
from typing import Optional
from src import hub_client
from src.settings import OLLAMA_BASE_URL, MODELS
import httpx


def _git(cmd: list, cwd: str) -> str:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=10)
        return r.stdout.strip()
    except Exception:
        return ""


def _read_file_safe(path: Path, max_bytes: int = 4000) -> str:
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
        return content[:max_bytes]
    except Exception:
        return ""


def _count_todos(content: str) -> int:
    return content.upper().count("TODO") + content.upper().count("FIXME") + content.upper().count("HACK")


def explore_workspace(workspace_id: str, workspace_root: str) -> dict:
    """
    Deep scan of a workspace. Returns structured findings.
    Stores results in Hub memory for the sprint planner to use.
    """
    root = Path(workspace_root)
    findings = {
        "workspace_id": workspace_id,
        "workspace_root": workspace_root,
        "scanned_at": datetime.utcnow().isoformat(),
        "project_type": [],
        "languages": [],
        "structure": {},
        "git": {},
        "python": {},
        "nodejs": {},
        "tests": {},
        "api": {},
        "database": {},
        "issues": [],
        "strengths": [],
        "missing": [],
        "todos": [],
        "file_count": 0,
    }

    if not root.exists():
        findings["issues"].append(f"Workspace root does not exist: {workspace_root}")
        return findings

    # ── GIT STATE ─────────────────────────────────────────────────────────────
    findings["git"] = {
        "branch": _git(["git", "rev-parse", "--abbrev-ref", "HEAD"], workspace_root),
        "last_commit": _git(["git", "log", "-1", "--pretty=%s"], workspace_root),
        "last_commit_hash": _git(["git", "rev-parse", "--short", "HEAD"], workspace_root),
        "uncommitted": _git(["git", "status", "--porcelain"], workspace_root).count("\n") + 1
            if _git(["git", "status", "--porcelain"], workspace_root) else 0,
        "recent_commits": _git(["git", "log", "--oneline", "-10"], workspace_root),
        "contributors": _git(["git", "log", "--pretty=%aN", "--no-merges"], workspace_root).split("\n")[:5],
    }

    # ── PROJECT TYPE DETECTION ─────────────────────────────────────────────────
    if (root / "pyproject.toml").exists() or (root / "setup.py").exists() or             (root / "src").exists() and list((root / "src").rglob("*.py")):
        findings["project_type"].append("python")
        findings["languages"].append("Python")
    if (root / "package.json").exists():
        findings["project_type"].append("nodejs")
        findings["languages"].append("TypeScript/JavaScript")
        try:
            pkg = json.loads((root / "package.json").read_text())
            findings["nodejs"] = {
                "name": pkg.get("name", ""),
                "version": pkg.get("version", ""),
                "framework": "Next.js" if "next" in pkg.get("dependencies", {}) else
                             "React" if "react" in pkg.get("dependencies", {}) else "unknown",
                "dependencies": list(pkg.get("dependencies", {}).keys()),
                "scripts": list(pkg.get("scripts", {}).keys()),
                "has_node_modules": (root / "node_modules").exists(),
            }
        except Exception:
            pass

    # ── PYTHON ANALYSIS ────────────────────────────────────────────────────────
    if "python" in findings["project_type"]:
        src_dir = root / "src"
        py_files = list(root.rglob("*.py")) if not src_dir.exists() else list(src_dir.rglob("*.py"))
        findings["file_count"] = len(py_files)

        # Collect modules
        modules = []
        commercial = root / "src" / "commercial"
        if commercial.exists():
            for d in sorted(commercial.iterdir()):
                if d.is_dir() and not d.name.startswith("_"):
                    files = list(d.glob("*.py"))
                    has_model = (d / "models.py").exists()
                    has_router = (d / "router.py").exists()
                    has_repo = (d / "repository.py").exists()
                    has_schema = (d / "schemas.py").exists()
                    complete = all([has_model, has_router, has_repo, has_schema])
                    modules.append({
                        "name": d.name,
                        "files": len(files),
                        "complete": complete,
                        "missing": [
                            f for f, exists in [
                                ("models.py", has_model),
                                ("router.py", has_router),
                                ("repository.py", has_repo),
                                ("schemas.py", has_schema),
                            ] if not exists
                        ],
                    })
                    if not complete:
                        findings["issues"].append(
                            f"Incomplete module: src/commercial/{d.name} — missing {[f for f, e in [('models.py',has_model),('router.py',has_router),('repository.py',has_repo),('schemas.py',has_schema)] if not e]}"
                        )

        findings["python"] = {
            "total_files": len(py_files),
            "commercial_modules": modules,
            "complete_modules": sum(1 for m in modules if m["complete"]),
            "incomplete_modules": sum(1 for m in modules if not m["complete"]),
        }

        # Syntax check all Python files
        syntax_errors = []
        import ast
        for pyf in py_files[:100]:  # limit for speed
            try:
                ast.parse(pyf.read_text())
            except SyntaxError as e:
                syntax_errors.append(f"{pyf.relative_to(root)}: line {e.lineno}: {e.msg}")
        if syntax_errors:
            findings["issues"].extend([f"SYNTAX ERROR: {e}" for e in syntax_errors])
            findings["python"]["syntax_errors"] = syntax_errors
        else:
            findings["strengths"].append(f"All {len(py_files)} Python files pass syntax check")

        # TODOs
        all_todos = []
        for pyf in py_files[:50]:
            content = _read_file_safe(pyf)
            n = _count_todos(content)
            if n > 0:
                all_todos.append(f"{pyf.relative_to(root)}: {n} TODOs")
        findings["todos"] = all_todos[:20]

        # Core files check
        core_files = [
            root / "src" / "core" / "base.py",
            root / "src" / "core" / "database.py",
            root / "src" / "core" / "auth.py",
            root / "src" / "core" / "tenant.py",
            root / "src" / "main.py",
        ]
        for cf in core_files:
            if not cf.exists():
                findings["missing"].append(f"Core file missing: {cf.relative_to(root)}")
            else:
                findings["strengths"].append(f"Core file exists: {cf.relative_to(root)}")

    # ── TEST ANALYSIS ──────────────────────────────────────────────────────────
    test_dir = root / "tests"
    if test_dir.exists():
        test_files = list(test_dir.rglob("test_*.py"))
        conftest = (test_dir / "conftest.py").exists()

        # Run pytest --collect-only for quick count
        # Use workspace venv python if available
        import shutil
        venv_python = str(root / ".venv" / "bin" / "python")
        pytest_python = venv_python if os.path.exists(venv_python) else "python3"
        collect_result = subprocess.run(
            [pytest_python, "-m", "pytest", "tests/", "--collect-only", "-q", "--no-header"],
            capture_output=True, text=True, cwd=workspace_root, timeout=30,
            env={**os.environ, "TRIANGLE_BLACK_DB_URL": os.environ.get("TRIANGLE_BLACK_DB_URL", "")}
        )
        collected = 0
        errors = 0
        for line in collect_result.stdout.split("\n"):
            if "test" in line.lower() and "::" in line:
                collected += 1
            if "ERROR" in line:
                errors += 1

        findings["tests"] = {
            "test_files": len(test_files),
            "has_conftest": conftest,
            "tests_collected": collected,
            "collection_errors": errors,
            "test_files_list": [str(f.relative_to(root)) for f in test_files[:20]],
        }

        if errors > 0:
            findings["issues"].append(f"{errors} test collection errors — tests cannot run")
        elif collected > 0:
            findings["strengths"].append(f"{collected} tests collected across {len(test_files)} files")
        else:
            findings["missing"].append("No tests collected — test suite may be empty")
    else:
        findings["missing"].append("No tests/ directory found")

    # ── API ANALYSIS ───────────────────────────────────────────────────────────
    main_py = root / "src" / "main.py"
    if main_py.exists():
        content = _read_file_safe(main_py)
        router_count = content.count("include_router")
        findings["api"] = {
            "main_py_exists": True,
            "routers_registered": router_count,
            "has_cors": "CORSMiddleware" in content,
            "has_health": "/health" in content,
        }
        findings["strengths"].append(f"API main.py: {router_count} routers registered")

    # ── DATABASE ANALYSIS ──────────────────────────────────────────────────────
    try:
        db_url = os.environ.get("TRIANGLE_BLACK_DB_URL", "")
        if db_url:
            from sqlalchemy import create_engine, inspect, text
            eng = create_engine(db_url, pool_pre_ping=True)
            insp = inspect(eng)
            tables = insp.get_table_names()
            table_info = {}
            with eng.connect() as conn:
                for t in tables[:20]:
                    try:
                        count = conn.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar()
                        cols = len(insp.get_columns(t))
                        table_info[t] = {"rows": count, "cols": cols}
                    except Exception:
                        pass
            findings["database"] = {
                "connected": True,
                "tables": table_info,
                "table_count": len(tables),
            }
            findings["strengths"].append(f"Database connected: {len(tables)} tables")
    except Exception as e:
        findings["database"] = {"connected": False, "error": str(e)[:100]}

    # ── SUMMARY ────────────────────────────────────────────────────────────────
    findings["summary"] = {
        "total_issues": len(findings["issues"]),
        "total_missing": len(findings["missing"]),
        "total_strengths": len(findings["strengths"]),
        "health_score": max(0, min(100,
            100
            - len(findings["issues"]) * 10
            - len(findings["missing"]) * 5
            + len(findings["strengths"]) * 2
        )),
    }

    return findings


def store_exploration(workspace_id: str, findings: dict) -> None:
    """Store exploration results in Hub memory for sprint planner."""
    # Store as structured memory
    hub_client.remember(
        workspace_id=workspace_id,
        memory_type="architecture",
        subject="workspace_exploration",
        content=json.dumps({
            "scanned_at": findings["scanned_at"],
            "health_score": findings["summary"]["health_score"],
            "issues": findings["issues"][:10],
            "missing": findings["missing"][:10],
            "strengths": findings["strengths"][:5],
            "python_modules": findings.get("python", {}).get("commercial_modules", []),
            "test_count": findings.get("tests", {}).get("tests_collected", 0),
            "table_count": findings.get("database", {}).get("table_count", 0),
        }),
    )

    # Store issues separately
    if findings["issues"]:
        hub_client.remember(
            workspace_id=workspace_id,
            memory_type="failure",
            subject="exploration_issues",
            content="\n".join(findings["issues"][:20]),
        )

    # Store todos
    if findings["todos"]:
        hub_client.remember(
            workspace_id=workspace_id,
            memory_type="architecture",
            subject="todos_found",
            content="\n".join(findings["todos"][:10]),
        )
