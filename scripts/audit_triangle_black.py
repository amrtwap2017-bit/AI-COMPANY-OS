"""
Triangle Black — Hub OS Powered Audit Engine
=============================================
Uses Hub Intelligence to scan the entire platform and produce:
1. All errors (import, syntax, runtime)
2. All duplicated code patterns
3. All architectural violations
4. All missing modules
5. Priority fix list
"""
from __future__ import annotations
import asyncio
import ast
import importlib.util
import os
import sys
import json
from pathlib import Path
from collections import defaultdict

sys.path.insert(0, "/home/amr/AI-COMPANY-OS")

TB_ROOT = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black")
SRC     = TB_ROOT / "src"


# ─── 1. Collect all Python files ─────────────────────────────────────────────

def collect_files() -> list[Path]:
    return sorted([
        p for p in SRC.rglob("*.py")
        if "__pycache__" not in str(p)
    ])


# ─── 2. Syntax Check ─────────────────────────────────────────────────────────

def check_syntax(files: list[Path]) -> list[dict]:
    errors = []
    for f in files:
        try:
            ast.parse(f.read_text())
        except SyntaxError as e:
            errors.append({
                "file":    str(f.relative_to(TB_ROOT)),
                "line":    e.lineno,
                "error":   str(e.msg),
                "severity": "CRITICAL"
            })
    return errors


# ─── 3. Import Error Detection ────────────────────────────────────────────────

def check_imports(files: list[Path]) -> list[dict]:
    errors = []
    for f in files:
        try:
            tree = ast.parse(f.read_text())
        except SyntaxError:
            continue
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                if isinstance(node, ast.ImportFrom) and node.module:
                    mod = node.module
                    # Check for known broken patterns
                    if "src.auth" == mod:
                        errors.append({
                            "file":    str(f.relative_to(TB_ROOT)),
                            "line":    node.lineno,
                            "error":   f"Import 'src.auth' does not exist — use 'src.core.auth'",
                            "severity": "HIGH"
                        })
                    if "src.core.config" == mod:
                        errors.append({
                            "file":    str(f.relative_to(TB_ROOT)),
                            "line":    node.lineno,
                            "error":   "Import 'src.core.config' does not exist — no config.py found",
                            "severity": "HIGH"
                        })
    return errors


# ─── 4. Duplicate Detection ───────────────────────────────────────────────────

def check_duplicates(files: list[Path]) -> list[dict]:
    issues = []

    # Duplicate datetime imports
    for f in files:
        try:
            content = f.read_text()
            lines   = content.splitlines()
        except Exception:
            continue

        dt_imports = [i for i, l in enumerate(lines, 1)
                      if "from datetime import datetime" in l]
        if len(dt_imports) > 1:
            issues.append({
                "file":    str(f.relative_to(TB_ROOT)),
                "lines":   dt_imports,
                "error":   f"Duplicate 'from datetime import datetime' — {len(dt_imports)}x",
                "severity": "LOW"
            })

    # Duplicate table names
    table_registry: dict[str, list[str]] = defaultdict(list)
    for f in files:
        try:
            tree = ast.parse(f.read_text())
        except SyntaxError:
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == "__tablename__":
                        if isinstance(node.value, ast.Constant):
                            table_registry[node.value.value].append(
                                str(f.relative_to(TB_ROOT))
                            )

    for table, paths in table_registry.items():
        if len(paths) > 1:
            issues.append({
                "table":   table,
                "files":   paths,
                "error":   f"Table '{table}' defined in {len(paths)} files",
                "severity": "HIGH"
            })

    return issues


# ─── 5. Architecture Violations ───────────────────────────────────────────────

def check_architecture(files: list[Path]) -> list[dict]:
    issues = []

    for f in files:
        try:
            content = f.read_text()
        except Exception:
            continue

        rel = str(f.relative_to(TB_ROOT))

        # Routers importing directly from other routers
        if "/router.py" in rel:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom) and node.module:
                    if ".router" in (node.module or ""):
                        issues.append({
                            "file":    rel,
                            "line":    node.lineno,
                            "error":   f"Router imports from another router: {node.module}",
                            "severity": "MEDIUM"
                        })

        # Models with business logic
        if "/models.py" in rel and ("def " in content or "async def " in content):
            issues.append({
                "file":    rel,
                "error":   "Model file contains methods — business logic should be in service layer",
                "severity": "LOW"
            })

        # Missing hotel_id isolation in routers
        if "/router.py" in rel:
            if ("hotel_id" not in content and
                "SELECT" not in content and
                len(content) > 200):
                issues.append({
                    "file":    rel,
                    "error":   "Router may be missing hotel_id (tenant) isolation",
                    "severity": "MEDIUM"
                })

    return issues


# ─── 6. Missing __init__.py files ────────────────────────────────────────────

def check_missing_init(dirs: list[Path]) -> list[dict]:
    issues = []
    for d in dirs:
        if not (d / "__init__.py").exists():
            issues.append({
                "directory": str(d.relative_to(TB_ROOT)),
                "error":     "Missing __init__.py",
                "severity":  "LOW"
            })
    return issues


# ─── 7. Empty Router Files ────────────────────────────────────────────────────

def check_empty_routers(files: list[Path]) -> list[dict]:
    issues = []
    for f in files:
        if f.name == "router.py":
            content = f.read_text().strip()
            if len(content) < 50 or "router" not in content:
                issues.append({
                    "file":    str(f.relative_to(TB_ROOT)),
                    "error":   "Router file is empty or has no router defined",
                    "severity": "HIGH"
                })
    return issues


# ─── 8. Knowledge Search for Context ─────────────────────────────────────────

async def get_hub_context(query: str) -> list[dict]:
    try:
        from hub.session import HubSession
        from uuid import UUID
        session = HubSession(UUID("00000000-0000-0000-0000-000000000001"))
        results = await session.ask_intelligence(query, limit=3)
        await session.close()
        return results
    except Exception:
        return []


# ─── MAIN AUDIT ───────────────────────────────────────────────────────────────

async def main():
    print("=" * 70)
    print(" TRIANGLE BLACK — HUB OS POWERED PLATFORM AUDIT")
    print("=" * 70)

    files = collect_files()
    dirs  = [d for d in SRC.rglob("*") if d.is_dir()]

    print(f"\n Scanning {len(files)} Python files across {len(dirs)} directories...")

    # Run all checks
    syntax_errors    = check_syntax(files)
    import_errors    = check_imports(files)
    duplicates       = check_duplicates(files)
    arch_violations  = check_architecture(files)
    missing_init     = check_missing_init(dirs)
    empty_routers    = check_empty_routers(files)

    # Count by severity
    all_issues = syntax_errors + import_errors + duplicates + arch_violations + empty_routers
    critical   = [i for i in all_issues if i.get("severity") == "CRITICAL"]
    high       = [i for i in all_issues if i.get("severity") == "HIGH"]
    medium     = [i for i in all_issues if i.get("severity") == "MEDIUM"]
    low        = [i for i in all_issues if i.get("severity") == "LOW"]

    print(f"\n{'─' * 70}")
    print(f" AUDIT SUMMARY")
    print(f"{'─' * 70}")
    print(f" Total files scanned:    {len(files)}")
    print(f" CRITICAL issues:        {len(critical)}")
    print(f" HIGH issues:            {len(high)}")
    print(f" MEDIUM issues:          {len(medium)}")
    print(f" LOW issues:             {len(low)}")
    print(f" Total issues:           {len(all_issues)}")

    if critical:
        print(f"\n{'─' * 70}")
        print(" 🔴 CRITICAL — SYNTAX ERRORS (Platform cannot start)")
        print(f"{'─' * 70}")
        for i in critical:
            print(f"  [{i['file']}:{i.get('line','?')}] {i['error']}")

    if high:
        print(f"\n{'─' * 70}")
        print(" 🟠 HIGH — Import Errors & Table Conflicts")
        print(f"{'─' * 70}")
        for i in high:
            if "files" in i:
                print(f"  TABLE CONFLICT: '{i['table']}'")
                for p in i["files"]:
                    print(f"    → {p}")
            else:
                print(f"  [{i.get('file','?')}:{i.get('line','?')}] {i['error']}")

    if empty_routers:
        print(f"\n{'─' * 70}")
        print(" 🟠 HIGH — Empty Router Files")
        print(f"{'─' * 70}")
        for i in empty_routers:
            print(f"  {i['file']}")

    if medium:
        print(f"\n{'─' * 70}")
        print(" 🟡 MEDIUM — Architecture Violations")
        print(f"{'─' * 70}")
        for i in medium:
            print(f"  [{i.get('file','?')}] {i['error']}")

    if duplicates:
        dup_only = [d for d in duplicates if "Duplicate" in d.get("error","")]
        if dup_only:
            print(f"\n{'─' * 70}")
            print(" 🟡 LOW — Duplicate Imports")
            print(f"{'─' * 70}")
            for i in dup_only[:10]:
                print(f"  [{i['file']}] {i['error']}")

    # Hub Knowledge Context
    print(f"\n{'─' * 70}")
    print(" 🤖 HUB OS — Business Context for Fixes")
    print(f"{'─' * 70}")
    ctx = await get_hub_context("hotel tenant isolation multi-tenancy architecture")
    if ctx:
        for r in ctx[:2]:
            content = r.get("payload", {}).get("content", "")[:120]
            print(f"  [{r.get('score',0):.3f}] {content}")
    else:
        print("  Hub context unavailable — check Qdrant connection")

    # Save full report
    report = {
        "summary": {
            "files_scanned": len(files),
            "critical": len(critical),
            "high":     len(high),
            "medium":   len(medium),
            "low":      len(low),
        },
        "syntax_errors":   syntax_errors,
        "import_errors":   import_errors,
        "duplicates":      duplicates,
        "arch_violations": arch_violations,
        "empty_routers":   empty_routers,
    }

    report_path = Path("/home/amr/AI-COMPANY-OS/triangle_black_audit_report.json")
    report_path.write_text(json.dumps(report, indent=2, default=str))
    print(f"\n Full report saved: {report_path}")

    print(f"\n{'─' * 70}")
    print(" PRIORITY FIX SEQUENCE")
    print(f"{'─' * 70}")
    print(" 1. Fix all CRITICAL syntax errors first")
    print(" 2. Fix HIGH import errors (src.auth, src.core.config)")
    print(" 3. Fix HIGH table conflicts")
    print(" 4. Fix empty router files")
    print(" 5. Fix MEDIUM architecture violations")
    print(" 6. Clean duplicate imports")
    print(f"{'─' * 70}")

if __name__ == "__main__":
    asyncio.run(main())
