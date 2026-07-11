"""
TB Agent CLI — Triangle Black Autonomous AI Agent
Entry point for ./tb-agent commands
"""
from __future__ import annotations
import sys
import os


def main():
    """Main entry point for tb-agent CLI."""
    args = sys.argv[1:]
    command = args[0] if args else "help"

    if command == "status":
        _cmd_status()
    elif command == "index":
        force = "--force" in args
        _cmd_index(force=force)
    elif command == "analyze":
        _cmd_analyze()
    elif command == "plan":
        goal = " ".join(args[1:]) if len(args) > 1 else ""
        _cmd_plan(goal)
    elif command == "ask":
        question = " ".join(args[1:]) if len(args) > 1 else ""
        _cmd_ask(question)
    elif command == "test":
        _cmd_test()
    elif command in ("help", "--help", "-h"):
        _cmd_help()
    else:
        print(f"❌ Unknown command: {command}")
        _cmd_help()


def _cmd_status():
    """Check all services."""
    import subprocess
    print("🔺 Triangle Black — Agent Status Check")
    print()

    # Check API
    try:
        import urllib.request
        with urllib.request.urlopen("http://127.0.0.1:8020/health", timeout=3) as r:
            import json
            data = json.loads(r.read())
            print(f"  ✅ API     → {data.get('version', '?')} | DB: {data.get('database', '?')} | http://127.0.0.1:8020")
    except Exception as e:
        print(f"  ❌ API     → Not reachable ({e})")

    # Check Ollama
    try:
        import urllib.request as _ur
        import json as _json
        with _ur.urlopen("http://localhost:11434/api/tags", timeout=3) as r:
            data = _json.loads(r.read())
            models = [m["name"] for m in data.get("models", [])]
            print(f"  ✅ Ollama  → {len(models)} models: {', '.join(models[:4])}")
    except Exception as e:
        print(f"  ❌ Ollama  → Not reachable ({e})")

    # Check DB
    try:
        import subprocess
        result = subprocess.run(
            ["docker", "exec", "ai-postgres", "psql", "-U", "ai", "-d",
             "triangle_black", "-c", "SELECT COUNT(*) FROM leads;"],
            capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            count = [l.strip() for l in result.stdout.splitlines() if l.strip().isdigit()]
            print(f"  ✅ DB      → ai-postgres:5432 | leads: {count[0] if count else '?'}")
        else:
            print(f"  ❌ DB      → {result.stderr[:80]}")
    except Exception as e:
        print(f"  ❌ DB      → {e}")

    # Check ChromaDB
    chroma_path = os.path.join(os.path.dirname(__file__), ".chromadb")
    if os.path.exists(chroma_path):
        print(f"  ✅ ChromaDB → {chroma_path}")
    else:
        print(f"  ⚠️  ChromaDB → Not indexed yet. Run: ./tb-agent index")

    print()


def _cmd_index(force: bool = False):
    """Index codebase into ChromaDB."""
    print("📚 Indexing codebase into ChromaDB...")
    try:
        from agent.memory.indexer import CodebaseIndexer
        indexer = CodebaseIndexer()
        indexer.index(force=force)
        print("✅ Indexing complete")
    except ImportError as e:
        print(f"❌ Indexer not available: {e}")
    except Exception as e:
        print(f"❌ Indexing failed: {e}")


def _cmd_analyze():
    """AI analyzes codebase — minimal prompt to avoid timeout."""
    print("🧠 Analyzing Triangle Black...")
    try:
        from agent.core.llm import OllamaClient
        import os

        # Load just the backlog and blockers (small files)
        brain_dir = "/home/amr/AI-COMPANY-OS/brains/triangle-black"
        backlog  = ""
        blockers = ""
        bootstrap = ""
        for fname, var in [
            ("08-CURRENT-BACKLOG.md",   "backlog"),
            ("09-CURRENT-BLOCKERS.md",  "blockers"),
            ("00-BRAIN-BOOTSTRAP.md",   "bootstrap"),
        ]:
            fpath = os.path.join(brain_dir, fname)
            if os.path.exists(fpath):
                with open(fpath) as f:
                    txt = f.read()[:600]
                if var == "backlog":   backlog   = txt
                if var == "blockers":  blockers  = txt
                if var == "bootstrap": bootstrap = txt

        prompt = f"""Triangle Black is a hotel engineering CRM at v4.3.0.
Stack: FastAPI + PostgreSQL + Next.js. Tests: 111 passing.

BACKLOG:
{backlog}

BLOCKERS:
{blockers}

In 5 bullet points, what are the top priorities to work on next?
Be brief and specific."""

        client = OllamaClient()
        print("⏳ Thinking (using qwen2.5-coder)...")
        response = client.plan(prompt)
        print()
        print(response)
    except Exception as e:
        print(f"❌ Analysis failed: {e}")


def _cmd_plan(goal: str):
    """Generate a sprint plan for a goal."""
    if not goal:
        print("Usage: ./tb-agent plan \"your goal\"")
        return
    print(f"📋 Planning: {goal}")
    try:
        from agent.core.llm import OllamaClient
        client = OllamaClient()
        prompt = f"""You are a senior engineer for Triangle Black hotel CRM.
Create a detailed implementation plan for: {goal}

The system uses:
- FastAPI backend (src/core/actions.py for business logic)
- PostgreSQL with SQLAlchemy
- Next.js portals (portal/, client-portal/, admin-portal/)
- JWT auth with role guards (require_agent, require_manager, require_admin)

Output a step-by-step implementation plan."""
        response = client.plan(prompt)
        print()
        print(response)
    except Exception as e:
        print(f"❌ Planning failed: {e}")


def _cmd_ask(question: str):
    """Ask AI about the codebase — short focused prompt."""
    if not question:
        print("Usage: ./tb-agent ask \"your question\"")
        return
    print(f"💬 {question}")
    try:
        from agent.core.llm import OllamaClient
        from agent.memory.indexer import CodebaseIndexer
        import os

        # Get 3 most relevant code chunks only
        context = ""
        indexer = CodebaseIndexer()
        if indexer.count() > 0:
            results = indexer.search(question, n_results=3)
            parts = [f"[{r['file']}]\n{r['content'][:300]}" for r in results]
            context = "\n---\n".join(parts)
            print(f"📚 {len(results)} relevant chunks found")

        # Read only bootstrap (tiny)
        bootstrap = ""
        bpath = "/home/amr/AI-COMPANY-OS/brains/triangle-black/00-BRAIN-BOOTSTRAP.md"
        if os.path.exists(bpath):
            with open(bpath) as f:
                bootstrap = f.read()[:500]

        prompt = f"""You are an engineer on Triangle Black (hotel CRM, v4.3.0, FastAPI+Next.js).

PROJECT: {bootstrap}

RELEVANT CODE:
{context}

QUESTION: {question}

Answer in 3-5 sentences using the project context above."""

        client = OllamaClient()
        print("⏳ Thinking...")
        response = client.ask(prompt)
        print()
        print(response)
    except Exception as e:
        print(f"❌ Failed: {e}")


def _cmd_test():
    """Run pytest suite."""
    import subprocess
    print("🧪 Running pytest...")
    result = subprocess.run(
        [".venv/bin/pytest", "tests/", "--tb=short", "-q"],
        cwd=os.path.dirname(os.path.dirname(__file__))
    )
    sys.exit(result.returncode)


def _cmd_help():
    print("""🔺 TB Agent — Triangle Black Autonomous AI

Commands:
  ./tb-agent status          → check all services (API, Ollama, DB, ChromaDB)
  ./tb-agent index           → index codebase into ChromaDB (run first)
  ./tb-agent index --force   → re-index everything
  ./tb-agent analyze         → AI analyzes codebase and reports gaps
  ./tb-agent plan "goal"     → generate sprint plan
  ./tb-agent ask "question"  → ask AI about the codebase
  ./tb-agent test            → run pytest suite
  ./tb-agent help            → show this help
""")


if __name__ == "__main__":
    main()
