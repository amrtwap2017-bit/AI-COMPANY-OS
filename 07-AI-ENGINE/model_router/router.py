"""Model router — select best Ollama model for task type."""
from sqlalchemy.orm import Session
from hub.db.engine import engine
from hub.model_router.models import ModelRoute

_DEFAULTS = {
    "coding":        "qwen2.5-coder:7b",
    "local_coding":  "qwen2.5-coder:7b",
    "architecture":  "deepseek-r1:8b",
    "planning":      "deepseek-r1:8b",
    "reasoning":     "deepseek-r1:8b",
    "review":        "llama3.2:3b",
    "fast_review":   "qwen3.5:4b",
    "embedding":     "nomic-embed-text",
    "general":       "qwen3.5:4b",
}

def route(task_type: str, workspace_id: str = "", local_only: bool = True) -> dict:
    """Return best model for task_type. Checks DB first, falls back to defaults."""
    try:
        with Session(engine) as s:
            q = s.query(ModelRoute).filter(ModelRoute.task_type == task_type)
            if local_only:
                q = q.filter(ModelRoute.provider == "ollama")
            row = q.order_by(ModelRoute.priority.desc()).first()
            if row:
                return {"model_id": row.model_id, "provider": row.provider,
                        "task_type": task_type, "from_db": True}
    except Exception:
        pass

    model_id = _DEFAULTS.get(task_type, "qwen2.5-coder:7b")
    return {"model_id": model_id, "provider": "ollama",
            "task_type": task_type, "from_db": False}
