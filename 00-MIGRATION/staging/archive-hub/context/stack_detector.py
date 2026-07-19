"""
Stack Detector — Scans ANY project directory and extracts tech stack.
Used by the developer agent to generate code matching the project's own patterns.
"""
from __future__ import annotations
import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class StackConfig:
    language: str = "python"
    framework: str = "fastapi"
    db_layer: str = "sqlalchemy_sync"
    auth_pattern: str = "jwt"
    test_runner: str = "pytest"
    test_command: str = "pytest -q"
    router_pattern: str = "APIRouter"
    model_pattern: str = "Column()"
    async_style: bool = False
    file_structure: str = "modular"
    src_root: str = "src"
    example_router: str = ""
    example_model: str = ""
    example_test: str = ""
    example_schema: str = ""
    detected_modules: list = field(default_factory=list)


_FRAMEWORK_SIGNALS = {
    "fastapi": ["from fastapi", "FastAPI(", "APIRouter"],
    "django":  ["from django", "django.db", "urlpatterns"],
    "flask":   ["from flask", "Flask(__name__", "@app.route"],
    "express": ["require('express')", "express()", "router.get("],
}

_DB_SIGNALS = {
    "sqlalchemy_sync":  ["from sqlalchemy.orm import Session", "Column(", "declarative_base"],
    "sqlalchemy_async": ["AsyncSession", "mapped_column(", "async_sessionmaker"],
    "django_orm":       ["models.Model", "CharField(", "ForeignKey("],
    "prisma":           ["from prisma", "prisma.client"],
}

_SKIP_DIRS = {".venv", "__pycache__", ".git", "node_modules", "migrations", "alembic", "dist"}


def _read_sample(path: Path, max_chars: int = 2000) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")[:max_chars]
    except Exception:
        return ""


def _detect_from_content(content: str, signals: dict) -> str:
    scores = {name: sum(1 for p in patterns if p in content)
              for name, patterns in signals.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else list(signals.keys())[0]


def _collect_python_files(root: Path, max_files: int = 40) -> list:
    result = []
    for p in root.rglob("*.py"):
        if any(skip in p.parts for skip in _SKIP_DIRS):
            continue
        result.append(p)
        if len(result) >= max_files:
            break
    return result


def _find_best_example(files: list, keywords: list, max_chars: int = 2000) -> str:
    scored = []
    for f in files:
        content = _read_sample(f, max_chars)
        score = sum(1 for kw in keywords if kw in content)
        scored.append((score, content))
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[0][1] if scored and scored[0][0] > 0 else ""


def _find_existing_modules(root: Path) -> list:
    modules = []
    for candidate in ["src", "app", "lib"]:
        src = root / candidate
        if src.exists():
            for child in src.iterdir():
                if child.is_dir() and not child.name.startswith(("_", ".")):
                    modules.append(child.name)
            if modules:
                break
    return modules[:20]


def detect_stack(workspace_root: str) -> StackConfig:
    """Scan workspace and return StackConfig with real examples."""
    root = Path(workspace_root)
    if not root.exists():
        return StackConfig()

    cfg = StackConfig()
    source_files = _collect_python_files(root)

    if not source_files:
        return cfg

    all_content = "\n".join(_read_sample(f, 300) for f in source_files[:20])

    cfg.framework   = _detect_from_content(all_content, _FRAMEWORK_SIGNALS)
    cfg.db_layer    = _detect_from_content(all_content, _DB_SIGNALS)
    cfg.async_style = all_content.count("async def") > all_content.count("\ndef ")

    for candidate in ["src", "app", "lib", "."]:
        if (root / candidate).exists():
            cfg.src_root = candidate
            break

    if cfg.framework == "fastapi":
        cfg.example_router = _find_best_example(
            source_files, ["APIRouter", "@router.post", "@router.get", "Depends(get_db)"])
        cfg.example_model  = _find_best_example(
            source_files, ["Column(", "__tablename__", "from sqlalchemy"])
        cfg.example_schema = _find_best_example(
            source_files, ["BaseModel", "class Config", "from pydantic"])
        cfg.example_test   = _find_best_example(
            source_files, ["def test_", "pytest.fixture", "assert res.status_code"])
        cfg.model_pattern  = "Column()" if "Column(" in all_content else "mapped_column()"

    cfg.detected_modules = _find_existing_modules(root)
    return cfg
