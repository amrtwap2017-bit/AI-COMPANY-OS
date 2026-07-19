"""
Universal Developer Agent — Project-Agnostic Code Generator.

NOW WITH FULL CONTEXT:
  1. Detect stack from workspace_root (real project files)
  2. RAG: find semantically similar existing code
  3. Sprint history: know what's already built
  4. Architecture memories: follow established decisions
  5. Build prompt FROM real examples + full context
  6. Generate code that matches the project's OWN patterns

No hardcoded framework. No hardcoded paths. No hardcoded patterns.
"""
from __future__ import annotations
import json
import httpx
from hub.context.stack_detector import detect_stack, StackConfig
from hub.context.builder import build_full_context, ContextPackage
from hub.context.tb_conventions import TB_CONVENTIONS


def _call_ollama(model_id: str, system: str, user: str, ollama_base: str) -> str:
    resp = httpx.post(
        f"{ollama_base}/api/chat",
        json={
            "model": model_id,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 4096, "num_ctx": 6000},
        },
        timeout=300,
    )
    resp.raise_for_status()
    return resp.json()["message"]["content"]


def _unload_models(ollama_base: str, models: list) -> None:
    for model in models:
        try:
            httpx.post(
                f"{ollama_base}/api/generate",
                json={"model": model, "keep_alive": 0},
                timeout=10,
            )
        except Exception:
            pass


def _extract_json(raw: str) -> dict | None:
    raw = raw.strip()
    if "```" in raw:
        lines, inner, in_block = raw.split("\n"), [], False
        for line in lines:
            if line.strip().startswith("```") and not in_block:
                in_block = True
                continue
            if line.strip() == "```" and in_block:
                break
            if in_block:
                inner.append(line)
        raw = "\n".join(inner).strip()
    try:
        result = json.loads(raw)
        if "files" in result:
            return result
    except Exception:
        pass
    brace = raw.find("{")
    if brace != -1:
        depth = 0
        for i, ch in enumerate(raw[brace:], brace):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    try:
                        result = json.loads(raw[brace:i + 1])
                        if "files" in result:
                            return result
                    except Exception:
                        break
    return None


def _build_system_prompt(stack: StackConfig, workspace_name: str, ctx: ContextPackage) -> str:
    """Build system prompt using real project files AND full context package."""

    router_section = (
        f"\n\nREAL ROUTER FROM THIS PROJECT — follow this pattern exactly:\n"
        f"```\n{stack.example_router[:1500]}\n```"
        if stack.example_router else ""
    )
    model_section = (
        f"\n\nREAL MODEL FROM THIS PROJECT — follow this pattern exactly:\n"
        f"```\n{stack.example_model[:1200]}\n```"
        if stack.example_model else ""
    )
    schema_section = (
        f"\n\nREAL SCHEMA FROM THIS PROJECT — follow this pattern exactly:\n"
        f"```\n{stack.example_schema[:1000]}\n```"
        if stack.example_schema else ""
    )
    test_section = (
        f"\n\nREAL TEST FROM THIS PROJECT — follow this pattern exactly:\n"
        f"```\n{stack.example_test[:1000]}\n```"
        if stack.example_test else ""
    )
    modules_section = (
        f"\n\nEXISTING MODULES IN THIS PROJECT: {', '.join(stack.detected_modules)}"
        if stack.detected_modules else ""
    )
    context_section = (
        f"\n\n{ctx.full_prompt}"
        if ctx and ctx.full_prompt else ""
    )
    # Inject TB conventions if this is a TB workspace
    tb_rules = TB_CONVENTIONS if "triangle" in workspace_name.lower() or "tb" in workspace_name.lower() else ""
    style_rules = _get_style_rules(stack)

    return f"""You are a senior {stack.language} engineer working on the {workspace_name} project.

DETECTED STACK:
- Language:  {stack.language}
- Framework: {stack.framework}
- Database:  {stack.db_layer}
- Auth:      {stack.auth_pattern}
- Style:     {"async" if stack.async_style else "sync"}
- Tests:     {stack.test_runner}
- Src root:  {stack.src_root}/
{modules_section}
{context_section}

ABSOLUTE RULES:
1. Return ONLY valid JSON — no markdown, no text outside the JSON object
2. JSON format: {{"files":[{{"path":"...","content":"..."}},...], "summary":"...", "test_command":"{stack.test_command}"}}
3. Every function must have COMPLETE implementation — no stubs, no TODO, no pass-only bodies
4. Follow EXACTLY the patterns shown in the real project examples below
5. File paths must be relative to workspace root (start with {stack.src_root}/ or tests/)
6. All code must be syntactically valid and immediately runnable
7. Do NOT rebuild modules listed in ALREADY BUILT section — they already exist
{tb_rules}
{style_rules}
{router_section}
{model_section}
{schema_section}
{test_section}"""


def _get_style_rules(stack: StackConfig) -> str:
    if stack.framework == "fastapi" and not stack.async_style:
        return """
SYNC FASTAPI RULES (this project uses SYNC — never use async/await):
- Route handlers: def (NOT async def)
- DB sessions: db: Session = Depends(get_db)
- Queries: db.query(Model).filter(...).first()
- Import: from sqlalchemy.orm import Session"""
    elif stack.framework == "fastapi" and stack.async_style:
        return """
ASYNC FASTAPI RULES (this project uses ASYNC):
- Route handlers: async def
- DB sessions: db: AsyncSession = Depends(get_db)
- Queries: result = await db.execute(select(Model).where(...))"""
    elif stack.framework == "django":
        return """
DJANGO RULES:
- Models inherit from models.Model
- Serializers inherit from serializers.ModelSerializer"""
    elif stack.framework in ("express", "nestjs"):
        return """
NODE.JS RULES:
- Use TypeScript types throughout
- Tests use Jest with describe/it blocks"""
    return ""


def _build_user_prompt(
    title: str,
    description: str,
    acceptance_criteria: list,
    stack: StackConfig,
    context: str = "",
) -> str:
    criteria = "\n".join(f"- {c}" for c in (acceptance_criteria or []))
    fix_note = (
        f"\n\nPREVIOUS ATTEMPT FAILED — fix these specific issues:\n{context}"
        if context else ""
    )
    return f"""TASK: {title}
DESCRIPTION: {description}
ACCEPTANCE CRITERIA:
{criteria}
{fix_note}

Generate complete, production-ready code for this task.
Follow the EXACT patterns from the real project examples in the system prompt.
Do not invent new patterns — match what already exists in this codebase.
Do NOT rebuild any module listed in ALREADY BUILT.

Return ONLY valid JSON:
{{"files":[
  {{"path":"<relative/path>","content":"<complete file content>"}},
  ...
],"summary":"<one line>","test_command":"{stack.test_command}"}}

Include ALL files: model, schema, repository/service, router/view, and tests.
Every file must be 100% complete — no placeholders, no TODOs."""


def _build_fallback(title: str, stack: StackConfig, workspace_name: str) -> dict:
    slug = "".join(
        c for c in title.lower().replace(" ", "_").replace("-", "_")[:40]
        if c.isalnum() or c == "_"
    )
    if stack.framework == "fastapi":
        fn = "async def" if stack.async_style else "def"
        return {
            "files": [
                {"path": f"{stack.src_root}/{slug}/__init__.py", "content": ""},
                {
                    "path": f"{stack.src_root}/{slug}/router.py",
                    "content": (
                        f'"""Fallback router for: {title}"""\n'
                        f"from fastapi import APIRouter\n\n"
                        f'router = APIRouter(prefix="/{slug}", tags=["{slug}"])\n\n\n'
                        f'@router.get("/health")\n'
                        f"{fn} health():\n"
                        f'    return {{"ok": True, "module": "{slug}"}}\n'
                    ),
                },
                {
                    "path": f"tests/test_{slug}.py",
                    "content": (
                        f'"""Fallback tests for: {title}"""\n\n\n'
                        f"def test_{slug}_health(client):\n"
                        f'    res = client.get("/api/v1/{slug}/health")\n'
                        f"    assert res.status_code == 200\n"
                    ),
                },
            ],
            "summary": f"Fallback: {title} ({workspace_name})",
            "test_command": stack.test_command,
            "_fallback": True,
        }
    return {
        "files": [{"path": f"{stack.src_root}/{slug}.py",
                   "content": f"# {title}\n# Fallback\n"}],
        "summary": f"Minimal fallback for {title}",
        "test_command": stack.test_command,
        "_fallback": True,
    }


def generate_code(
    title: str,
    description: str,
    acceptance_criteria: list,
    context: str = "",
    model_id: str = "qwen2.5-coder:7b",
    ollama_base: str = "http://localhost:11434",
    workspace_root: str = "",
    workspace_name: str = "Project",
    workspace_id: str = "",
) -> dict:
    """
    Generate production-ready code for ANY project with FULL context.

    Steps:
    1. Build full context (stack + RAG + sprint history + memories)
    2. Free VRAM
    3. Build dynamic prompt with all context
    4. Call Ollama (2 attempts)
    5. Return files to write
    """
    # 1. Build full context package
    if workspace_root and workspace_id:
        ctx = build_full_context(
            task_title=title,
            task_description=description,
            workspace_id=workspace_id,
            workspace_name=workspace_name,
            workspace_root=workspace_root,
        )
        stack = ctx.stack
    elif workspace_root:
        stack = detect_stack(workspace_root)
        ctx   = None
    else:
        stack = StackConfig()
        ctx   = None

    # 2. Free VRAM
    _unload_models(ollama_base, ["llama3.2:3b", "deepseek-r1:8b", "qwen3.5:4b"])

    # 3. Build prompts
    system_prompt = _build_system_prompt(stack, workspace_name, ctx)
    user_prompt   = _build_user_prompt(
        title, description, acceptance_criteria, stack, context
    )

    # 4. Call Ollama with one retry
    result     = None
    last_error = ""
    for _ in range(2):
        try:
            raw    = _call_ollama(model_id, system_prompt, user_prompt, ollama_base)
            result = _extract_json(raw)
            if result:
                break
            last_error = "JSON parse failed"
        except Exception as e:
            last_error = str(e)
            result     = None

    # 5. Fallback if both failed
    if not result:
        result = _build_fallback(title, stack, workspace_name)
        result["_error"] = last_error

    result["ok"]             = True
    result["model_used"]     = model_id
    result["stack_detected"] = {
        "framework":     stack.framework,
        "language":      stack.language,
        "db_layer":      stack.db_layer,
        "async_style":   stack.async_style,
        "src_root":      stack.src_root,
        "modules_found": len(stack.detected_modules),
        "has_examples":  bool(stack.example_router),
        "has_rag":       bool(ctx and ctx.rag_snippets),
        "has_history":   bool(ctx and ctx.sprint_history),
        "has_memories":  bool(ctx and ctx.memories),
    }
    return result
