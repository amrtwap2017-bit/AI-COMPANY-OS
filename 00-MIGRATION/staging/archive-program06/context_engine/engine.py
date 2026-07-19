"""
Context Engine — intelligently selects and assembles context for each request.
Called by every component before invoking any model.
"""
import httpx
from src.settings import OLLAMA_BASE_URL, MODELS
from src import hub_client
import json


def detect_intent(request: str) -> str:
    """Fast intent detection using llama3.2:3b."""
    try:
        r = httpx.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json={
                "model": MODELS["fast"],
                "messages": [
                    {"role": "system", "content": (
                        "Classify the request into one of: planning|coding|reviewing|debugging|architecture. "
                        "Return ONLY the single word, nothing else."
                    )},
                    {"role": "user", "content": request},
                ],
                "stream": False,
                "options": {"temperature": 0.0, "num_predict": 10},
            },
            timeout=30,
        )
        r.raise_for_status()
        intent = r.json()["message"]["content"].strip().lower()
        valid = {"planning", "coding", "reviewing", "debugging", "architecture"}
        return intent if intent in valid else "coding"
    except Exception:
        return "coding"


def extract_entities(request: str, task_title: str = "") -> dict:
    """Extract domain, feature, and file hints from request."""
    text = f"{request} {task_title}".lower()
    domain = "commercial"
    feature = "general"

    feature_map = {
        "lead": "lead_management",
        "qualification": "qualification_engine",
        "agent": "agent_management",
        "pipeline": "pipeline_dashboard",
        "activity": "activity_tracking",
        "search": "search_filters",
        "webhook": "webhook_notifications",
        "quote": "quotation",
        "auth": "auth",
        "report": "reporting",
    }
    for keyword, feat in feature_map.items():
        if keyword in text:
            feature = feat
            break

    return {"domain": domain, "feature": feature}


def get_relevant_memories(workspace_id: str, query: str) -> list:
    """Get memories relevant to the current request."""
    all_memories = []
    for mtype in ["architecture", "decision", "failure", "code_pattern"]:
        mems = hub_client.recall(workspace_id, mtype)
        all_memories.extend(mems[:3])

    # Simple keyword filter
    query_words = set(query.lower().split())
    scored = []
    for m in all_memories:
        text = f"{m.get('subject', '')} {m.get('content', '')}".lower()
        score = sum(1 for w in query_words if w in text)
        if score > 0:
            scored.append((score, m))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [m for _, m in scored[:5]]


def build_focused_context(
    request: str,
    workspace_id: str,
    task_title: str = "",
    task_description: str = "",
    acceptance_criteria: list | None = None,
) -> dict:
    """
    Build focused context for a specific request.
    Returns structured context ready for model consumption.
    """
    intent = detect_intent(request)
    entities = extract_entities(request, task_title)
    relevant_memories = get_relevant_memories(workspace_id, request)

    # Build memory context text
    memory_text = ""
    if relevant_memories:
        memory_text = "\n".join([
            f"[{m['type']}] {m['subject']}: {m['content'][:200]}"
            for m in relevant_memories
        ])

    # Build criteria text
    criteria_text = ""
    if acceptance_criteria:
        criteria_text = "\n".join(f"- {c}" for c in acceptance_criteria)

    # Assemble structured context
    context = {
        "intent": intent,
        "domain": entities["domain"],
        "feature": entities["feature"],
        "task": {
            "title": task_title,
            "description": task_description,
            "acceptance_criteria": criteria_text,
        },
        "relevant_memories": memory_text,
        "workspace_id": workspace_id,
        "assembled_prompt_prefix": (
            f"Domain: Triangle Black Hotel Engineering Platform\n"
            f"Feature Area: {entities['feature']}\n"
            f"Task: {task_title}\n"
            f"Description: {task_description}\n"
            f"Acceptance Criteria:\n{criteria_text}\n"
            f"\nRelevant Past Decisions:\n{memory_text}\n"
            if memory_text else
            f"Domain: Triangle Black Hotel Engineering Platform\n"
            f"Feature Area: {entities['feature']}\n"
            f"Task: {task_title}\n"
            f"Description: {task_description}\n"
            f"Acceptance Criteria:\n{criteria_text}\n"
        ),
    }
    return context
