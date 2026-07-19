"""
Context Builder — Assembles FULL context package before code generation.

Combines ALL context sources into one rich prompt prefix:
  1. Stack detection    (framework, DB, auth, style from real project files)
  2. Real examples      (router, model, schema, test from actual codebase)
  3. RAG snippets       (semantically relevant existing code)
  4. Sprint history     (what was built, what failed)
  5. Memories           (architecture decisions stored in Hub DB)

This replaces the old approach of only passing stack detection.
The developer agent now gets FULL project context before generating code.
"""
from __future__ import annotations
from dataclasses import dataclass, field

from hub.context.stack_detector import detect_stack, StackConfig
from hub.context.sprint_loader  import load_sprint_context, load_failed_context
from hub.context.rag_engine     import get_relevant_context
from hub.memory.service         import recall


@dataclass
class ContextPackage:
    """Full context package passed to the developer agent."""
    workspace_id:    str
    workspace_name:  str
    workspace_root:  str
    stack:           StackConfig = field(default_factory=StackConfig)
    rag_snippets:    str = ""
    sprint_history:  str = ""
    failed_context:  str = ""
    memories:        str = ""
    full_prompt:     str = ""


def build_full_context(
    task_title:       str,
    task_description: str,
    workspace_id:     str,
    workspace_name:   str,
    workspace_root:   str,
) -> ContextPackage:
    """
    Build a complete ContextPackage for the developer agent.

    Args:
        task_title:       The task title (used for RAG query)
        task_description: Task description (enriches RAG query)
        workspace_id:     Hub workspace ID
        workspace_name:   Human-readable workspace name
        workspace_root:   Absolute path to project

    Returns:
        ContextPackage with all context assembled and formatted
    """
    pkg = ContextPackage(
        workspace_id=workspace_id,
        workspace_name=workspace_name,
        workspace_root=workspace_root,
    )

    # 1. Detect stack from real project files
    try:
        pkg.stack = detect_stack(workspace_root)
    except Exception:
        pkg.stack = StackConfig()

    # 2. RAG — semantically relevant code (non-blocking)
    try:
        pkg.rag_snippets = get_relevant_context(
            workspace_id=workspace_id,
            task_title=task_title,
            task_description=task_description,
            top_k=6,
        )
    except Exception:
        pkg.rag_snippets = ""

    # 3. Sprint history — what was already built/failed
    try:
        pkg.sprint_history = load_sprint_context(workspace_id, limit=15)
    except Exception:
        pkg.sprint_history = ""

    # 4. Recent failures — avoid repeating mistakes
    try:
        pkg.failed_context = load_failed_context(workspace_id)
    except Exception:
        pkg.failed_context = ""

    # 5. Architecture memories from Hub DB
    try:
        memory_rows = recall(workspace_id=workspace_id, memory_type="architecture")
        if memory_rows:
            mem_lines = ["ARCHITECTURE DECISIONS AND CONVENTIONS:", ""]
            for m in memory_rows[:5]:
                subject = m.get("subject", "")
                content = m.get("content", "")[:300]
                if content:
                    mem_lines.append(f"• {subject}: {content}")
            pkg.memories = "\n".join(mem_lines)
    except Exception:
        pkg.memories = ""

    # 6. Assemble full prompt prefix
    pkg.full_prompt = _assemble_prompt(pkg)

    return pkg


def _assemble_prompt(pkg: ContextPackage) -> str:
    """Assemble all context sections into a single prompt prefix string."""
    sections = []

    if pkg.sprint_history:
        sections.append(pkg.sprint_history)

    if pkg.memories:
        sections.append(pkg.memories)
        sections.append("")

    if pkg.rag_snippets:
        sections.append(pkg.rag_snippets)

    if pkg.failed_context:
        sections.append(pkg.failed_context)

    return "\n".join(sections).strip()
