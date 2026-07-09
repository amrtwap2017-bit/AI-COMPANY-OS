"""
TB Agent — Task Executor
Applies AI-generated code to files, runs tests, commits.
"""
from __future__ import annotations
import re
import subprocess
import json
from pathlib import Path
from datetime import datetime
from rich.console import Console
from rich.syntax import Syntax
from rich.panel import Panel
from agent.core.config import WORKSPACE, PLANS_DIR
from agent.memory.indexer import write_file, get_file

console = Console()


def extract_code_blocks(text: str) -> list[dict]:
    """
    Extract all code blocks from LLM response.
    Returns list of {lang, filename, code} dicts.
    """
    blocks = []
    # Match ```lang [filename]\n...code...\n```
    pattern = re.compile(
        r"```(\w+)?\s*(?:#\s*FILE:\s*(.+?)\s*\n|(?:file:\s*(.+?)\s*\n))?(.+?)```",
        re.DOTALL | re.IGNORECASE,
    )
    for match in pattern.finditer(text):
        lang     = match.group(1) or ""
        filename = (match.group(2) or match.group(3) or "").strip()
        code     = match.group(4).strip()
        blocks.append({"lang": lang, "filename": filename, "code": code})
    return blocks


def extract_file_writes(text: str) -> list[dict]:
    """
    Extract explicit file write instructions from LLM response.
    Looks for: WRITE FILE: path/to/file.py
    """
    writes = []
    lines = text.split("\n")
    current_file = None
    current_code = []
    in_code = False

    for line in lines:
        if line.strip().upper().startswith("WRITE FILE:"):
            if current_file and current_code:
                writes.append({"filename": current_file, "code": "\n".join(current_code)})
            current_file = line.split(":", 1)[1].strip()
            current_code = []
            in_code = False
        elif line.strip() == "```" or line.strip().startswith("```"):
            in_code = not in_code
        elif in_code and current_file:
            current_code.append(line)

    if current_file and current_code:
        writes.append({"filename": current_file, "code": "\n".join(current_code)})

    return writes


def apply_file(filename: str, code: str, dry_run: bool = False) -> bool:
    """Write code to file after user confirmation."""
    if not filename:
        return False

    console.print(f"\n[bold cyan]→ Would write:[/bold cyan] {filename}")
    syntax = Syntax(code[:500] + ("..." if len(code) > 500 else ""),
                    filename.split(".")[-1] or "text",
                    theme="monokai", line_numbers=True)
    console.print(Panel(syntax, title=filename, border_style="cyan"))

    if dry_run:
        console.print("[yellow]DRY RUN — not writing[/yellow]")
        return False

    answer = console.input("[bold]Apply this file? [Y/n]: [/bold]").strip().lower()
    if answer in ("", "y", "yes"):
        write_file(filename, code)
        console.print(f"[green]✓ Written: {filename}[/green]")
        return True
    console.print("[yellow]Skipped[/yellow]")
    return False


def run_tests() -> tuple[bool, str]:
    """Run pytest and return (passed, output)."""
    env = {
        "TRIANGLE_BLACK_DB_URL": "postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black",
        "PYTHONPATH": str(WORKSPACE),
        "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    }
    result = subprocess.run(
        [str(WORKSPACE / ".venv/bin/pytest"), "tests/", "-q", "--tb=short", "--no-header"],
        cwd=WORKSPACE,
        capture_output=True,
        text=True,
        env={**__import__("os").environ, **env},
    )
    output = result.stdout + result.stderr
    passed = result.returncode == 0
    return passed, output


def check_api_health() -> bool:
    """Check if TB API is running."""
    import urllib.request
    try:
        urllib.request.urlopen("http://127.0.0.1:8020/health", timeout=3)
        return True
    except Exception:
        return False


def git_commit(message: str, tag: str = "") -> bool:
    """Stage all changes and commit."""
    subprocess.run(["git", "add", "-A"], cwd=WORKSPACE, check=True)
    result = subprocess.run(
        ["git", "commit", "-m", message],
        cwd=WORKSPACE, capture_output=True, text=True,
    )
    if result.returncode != 0:
        if "nothing to commit" in result.stdout:
            console.print("[yellow]Nothing to commit[/yellow]")
            return True
        console.print(f"[red]Commit failed: {result.stderr}[/red]")
        return False
    if tag:
        subprocess.run(
            ["git", "tag", "-a", tag, "-m", tag],
            cwd=WORKSPACE, check=False,
        )
    console.print(f"[green]✓ Committed: {message}[/green]")
    return True


def save_plan(plan_text: str, name: str = "") -> Path:
    """Save a plan to disk for reference."""
    PLANS_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    slug = name.replace(" ", "-").lower()[:30] if name else "plan"
    path = PLANS_DIR / f"{ts}-{slug}.md"
    path.write_text(plan_text)
    return path
