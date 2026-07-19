"""
Model Router — AI Company OS
─────────────────────────────────────────────────────
Routes tasks to the best available model.
Quality first. Speed is secondary.

Priority order per task type:
  Reasoning  → deepseek-r1:8b  (best thinking model available)
  Coding     → qwen2.5-coder:7b (purpose-built for code)
  Planning   → qwen3.5:4b      (structured output)
  Writing    → llama3.2:3b     (fluent, fast)
  Embedding  → bge-m3          (dedicated embedding model)
"""

MODEL_CAPABILITIES: dict[str, dict] = {
    "deepseek-r1:8b": {
        "strengths": [
            "reasoning", "analysis", "research", "review",
            "evaluation", "math", "logic", "critique",
            "deep thinking", "problem solving"
        ],
        "context": 32768,
        "speed": "slow",
        "quality": "highest",
        "vram_gb": 5.2,
    },
    "qwen2.5-coder:7b": {
        "strengths": [
            "coding", "debugging", "refactoring", "sql",
            "shell", "docker", "api", "script",
            "python", "javascript", "testing"
        ],
        "context": 32768,
        "speed": "medium",
        "quality": "high",
        "vram_gb": 4.7,
    },
    "qwen3.5:4b": {
        "strengths": [
            "architecture", "planning", "design", "strategy",
            "structure", "roadmap", "specification", "system"
        ],
        "context": 32768,
        "speed": "medium",
        "quality": "high",
        "vram_gb": 3.4,
    },
    "llama3.2:3b": {
        "strengths": [
            "writing", "content", "blog", "documentation",
            "summary", "chat", "fast", "simple", "fallback"
        ],
        "context": 128000,
        "speed": "fast",
        "quality": "good",
        "vram_gb": 2.0,
    },
    "bge-m3": {
        "strengths": [
            "embedding", "vector", "semantic", "similarity"
        ],
        "context": 8192,
        "speed": "very_fast",
        "quality": "best_for_embedding",
        "vram_gb": 1.2,
    },
}

TASK_SIGNAL_MAP: dict[str, str] = {
    # Deep reasoning → deepseek-r1:8b
    "research":    "deepseek-r1:8b",
    "analyse":     "deepseek-r1:8b",
    "analyze":     "deepseek-r1:8b",
    "review":      "deepseek-r1:8b",
    "evaluate":    "deepseek-r1:8b",
    "evaluate":    "deepseek-r1:8b",
    "assess":      "deepseek-r1:8b",
    "compare":     "deepseek-r1:8b",
    "explain":     "deepseek-r1:8b",
    "think":       "deepseek-r1:8b",
    "reason":      "deepseek-r1:8b",
    "critique":    "deepseek-r1:8b",
    "investigate": "deepseek-r1:8b",
    "diagnose":    "deepseek-r1:8b",

    # Coding → qwen2.5-coder:7b
    "code":        "qwen2.5-coder:7b",
    "python":      "qwen2.5-coder:7b",
    "function":    "qwen2.5-coder:7b",
    "bug":         "qwen2.5-coder:7b",
    "refactor":    "qwen2.5-coder:7b",
    "sql":         "qwen2.5-coder:7b",
    "api":         "qwen2.5-coder:7b",
    "docker":      "qwen2.5-coder:7b",
    "shell":       "qwen2.5-coder:7b",
    "script":      "qwen2.5-coder:7b",
    "test":        "qwen2.5-coder:7b",
    "debug":       "qwen2.5-coder:7b",
    "implement":   "qwen2.5-coder:7b",
    "build":       "qwen2.5-coder:7b",

    # Architecture/Planning → qwen3.5:4b
    "architect":   "qwen3.5:4b",
    "design":      "qwen3.5:4b",
    "plan":        "qwen3.5:4b",
    "strategy":    "qwen3.5:4b",
    "structure":   "qwen3.5:4b",
    "roadmap":     "qwen3.5:4b",
    "spec":        "qwen3.5:4b",
    "blueprint":   "qwen3.5:4b",

    # Writing → llama3.2:3b
    "write":       "llama3.2:3b",
    "draft":       "llama3.2:3b",
    "content":     "llama3.2:3b",
    "blog":        "llama3.2:3b",
    "document":    "llama3.2:3b",
    "report":      "llama3.2:3b",
    "summarize":   "llama3.2:3b",
    "article":     "llama3.2:3b",

    # Embedding → bge-m3
    "embed":       "bge-m3",
    "embedding":   "bge-m3",
    "vector":      "bge-m3",
    "semantic":    "bge-m3",
}

DEFAULT_MODEL = "llama3.2:3b"


class ModelRouter:

    def route(self, task: str) -> str:
        task_lower = task.lower()
        for signal, model in TASK_SIGNAL_MAP.items():
            if signal in task_lower:
                return model
        return DEFAULT_MODEL

    def route_with_fallback(self, task: str, preferred_model: str) -> str:
        """Use agent's preferred model if it's registered."""
        if preferred_model in MODEL_CAPABILITIES:
            return preferred_model
        return self.route(task)

    def capabilities(self, model: str) -> dict:
        return MODEL_CAPABILITIES.get(model, {})

    def all_models(self) -> list[str]:
        return list(MODEL_CAPABILITIES.keys())


model_router = ModelRouter()
