"""Memory Synchronizer — captures decisions, failures, lessons."""
from src import hub_client


def capture_decision(workspace_id: str, decision: str, reasoning: str,
                     alternatives: list, run_group: str = "") -> dict:
    content = (
        f"DECISION: {decision}\n"
        f"REASONING: {reasoning}\n"
        f"ALTERNATIVES REJECTED: {', '.join(alternatives) if alternatives else 'none'}"
    )
    return hub_client.remember(
        workspace_id=workspace_id,
        memory_type="decision",
        subject=decision[:100],
        content=content,
        run_group=run_group,
    )


def capture_failure(workspace_id: str, what_failed: str, why: str,
                    how_fixed: str, run_group: str = "") -> dict:
    content = (
        f"WHAT FAILED: {what_failed}\n"
        f"WHY: {why}\n"
        f"HOW FIXED: {how_fixed}"
    )
    return hub_client.remember(
        workspace_id=workspace_id,
        memory_type="failure",
        subject=what_failed[:100],
        content=content,
        run_group=run_group,
    )


def capture_lesson(workspace_id: str, lesson: str, sprint: str = "") -> dict:
    return hub_client.remember(
        workspace_id=workspace_id,
        memory_type="learning",
        subject=f"lesson:{sprint or 'general'}",
        content=lesson,
    )


def recall_relevant(workspace_id: str, query: str, memory_types: list = None) -> list:
    """Recall memories relevant to query across multiple types."""
    types = memory_types or ["architecture", "decision", "failure", "learning"]
    all_memories = []
    for mtype in types:
        mems = hub_client.recall(workspace_id, mtype)
        all_memories.extend(mems)

    query_words = set(query.lower().split())
    scored = []
    for m in all_memories:
        text = f"{m.get('subject', '')} {m.get('content', '')}".lower()
        score = sum(1 for w in query_words if len(w) > 3 and w in text)
        if score > 0:
            scored.append((score, m))
    scored.sort(reverse=True)
    return [m for _, m in scored[:10]]


def build_institutional_knowledge(workspace_id: str) -> str:
    """Build a structured markdown doc from all memories."""
    sections = {
        "architecture": "## Architecture Decisions\n",
        "decision": "## Technical Decisions\n",
        "failure": "## Known Failures & Fixes\n",
        "learning": "## Lessons Learned\n",
        "project_state": "## Project State History\n",
    }

    doc = "# Triangle Black — Institutional Knowledge\n\n"
    for mtype, header in sections.items():
        mems = hub_client.recall(workspace_id, mtype)
        if mems:
            doc += header
            for m in mems[:5]:
                doc += f"### {m.get('subject', 'Unknown')}\n"
                doc += f"{m.get('content', '')}\n\n"
    return doc
