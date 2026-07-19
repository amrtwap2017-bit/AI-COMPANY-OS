"""
Agent Registry — AI Company OS
─────────────────────────────────────────────────────
Hardware: Quadro RTX 3000 (6GB VRAM) + 11GB RAM

Tiered model strategy:
─────────────────────────────────────────────────────
TIER 1 — deepseek-r1:8b (best reasoning, use selectively)
  → evaluator   : scores final output once per project
  → reviewer    : deep code review, runs once
  → analyst     : deep data analysis when called directly

TIER 2 — qwen3.5:4b (good reasoning, workflow-safe)
  → researcher  : research tasks in workflows (~87s)
  → architect   : system design
  → planner     : task planning
  → cto/ceo     : strategic decisions

TIER 3 — qwen2.5-coder:7b (code specialist)
  → backend, frontend, devops, tester : all code tasks

TIER 4 — llama3.2:3b (fast, fluent)
  → writer      : all writing tasks (~15s)
  → fallback    : when other models unavailable

TIER 5 — bge-m3 (embedding only)
  → memory, knowledge, RAG, search
"""

AGENTS: dict[str, dict] = {

    # ─────────────────────────────────────────
    # Executive Layer — Strategic thinking
    # ─────────────────────────────────────────
    "ceo": {
        "role": "Chief Executive Officer",
        "department": "executive",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.4,
        "prompt": "ceo.md",
        "tools": ["memory", "knowledge", "planning"],
        "description": "Defines mission, priorities and approves strategic decisions",
    },
    "cto": {
        "role": "Chief Technology Officer",
        "department": "executive",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.2,
        "prompt": "cto.md",
        "tools": ["memory", "knowledge", "code", "planning"],
        "description": "Owns technical strategy, architecture decisions and engineering standards",
    },

    # ─────────────────────────────────────────
    # Engineering — Specialized by task
    # ─────────────────────────────────────────
    "architect": {
        "role": "System Architect",
        "department": "engineering",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.2,
        "prompt": "architect.md",
        "tools": ["memory", "knowledge", "filesystem", "code"],
        "description": "Designs system architecture, APIs, data models and technical blueprints",
    },
    "backend": {
        "role": "Backend Engineer",
        "department": "engineering",
        "model": "qwen2.5-coder:7b",
        "fallback": "llama3.2:3b",
        "temperature": 0.1,
        "prompt": "backend.md",
        "tools": ["code", "filesystem", "shell", "git", "docker", "postgres"],
        "description": "Builds APIs, services, databases and backend logic in Python/FastAPI",
    },
    "frontend": {
        "role": "Frontend Engineer",
        "department": "engineering",
        "model": "qwen2.5-coder:7b",
        "fallback": "llama3.2:3b",
        "temperature": 0.2,
        "prompt": "frontend.md",
        "tools": ["code", "filesystem", "git"],
        "description": "Builds UI components, React/Next.js applications and frontend systems",
    },
    "devops": {
        "role": "DevOps Engineer",
        "department": "engineering",
        "model": "qwen2.5-coder:7b",
        "fallback": "llama3.2:3b",
        "temperature": 0.0,
        "prompt": "devops.md",
        "tools": ["shell", "docker", "filesystem", "git"],
        "description": "Manages infrastructure, Docker, CI/CD pipelines and deployments",
    },
    "tester": {
        "role": "QA Engineer",
        "department": "engineering",
        "model": "qwen2.5-coder:7b",
        "fallback": "llama3.2:3b",
        "temperature": 0.0,
        "prompt": "tester.md",
        "tools": ["code", "filesystem", "shell"],
        "description": "Writes comprehensive tests, validates quality and finds edge cases",
    },
    "reviewer": {
        "role": "Code Reviewer",
        "department": "engineering",
        "model": "deepseek-r1:8b",
        "fallback": "qwen2.5-coder:7b",
        "temperature": 0.0,
        "prompt": "reviewer.md",
        "tools": ["code", "memory", "knowledge"],
        "description": "Deep code review for correctness, security and quality — uses best reasoning model",
    },

    # ─────────────────────────────────────────
    # AI Department — Meta agents
    # ─────────────────────────────────────────
    "prompt_engineer": {
        "role": "Prompt Engineer",
        "department": "ai",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.3,
        "prompt": "prompt_engineer.md",
        "tools": ["memory", "knowledge"],
        "description": "Designs, tests and optimizes prompts for every agent in the system",
    },
    "evaluator": {
        "role": "AI Output Evaluator",
        "department": "ai",
        "model": "deepseek-r1:8b",
        "fallback": "qwen3.5:4b",
        "temperature": 0.0,
        "prompt": "evaluator.md",
        "tools": ["memory", "knowledge"],
        "description": "Critically scores agent outputs — uses best reasoning model, runs once per project",
    },

    # ─────────────────────────────────────────
    # Research — qwen3.5:4b for workflow safety
    # deepseek available when called directly
    # ─────────────────────────────────────────
    "researcher": {
        "role": "Senior Researcher",
        "department": "research",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.3,
        "prompt": "researcher.md",
        "tools": ["memory", "knowledge", "web", "documents"],
        "description": "Deep research and synthesis — uses qwen3.5:4b for workflow speed, upgrade to deepseek-r1:8b for critical analysis",
    },
    "analyst": {
        "role": "Data Analyst",
        "department": "research",
        "model": "deepseek-r1:8b",
        "fallback": "qwen3.5:4b",
        "temperature": 0.2,
        "prompt": "analyst.md",
        "tools": ["memory", "knowledge", "postgres", "code"],
        "description": "Deep data analysis and insight generation using best reasoning model",
    },

    # ─────────────────────────────────────────
    # Product — Planning and strategy
    # ─────────────────────────────────────────
    "planner": {
        "role": "Product Planner",
        "department": "product",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.4,
        "prompt": "planner.md",
        "tools": ["memory", "knowledge", "planning"],
        "description": "Creates roadmaps, sprint plans and task breakdowns",
    },

    # ─────────────────────────────────────────
    # Content — Fast writing
    # ─────────────────────────────────────────
    "writer": {
        "role": "Content Writer",
        "department": "marketing",
        "model": "llama3.2:3b",
        "fallback": "llama3.2:3b",
        "temperature": 0.7,
        "prompt": "writer.md",
        "tools": ["memory", "knowledge"],
        "description": "Writes clear professional articles, reports and documentation",
    },

    # ─────────────────────────────────────────

    "developer": {
        "role": "Full Stack Developer",
        "department": "engineering",
        "model": "qwen2.5-coder:7b",
        "fallback": "llama3.2:3b",
        "temperature": 0.1,
        "prompt": "developer.md",
        "tools": ["code", "filesystem", "shell", "git"],
        "description": "Builds full stack features across backend and frontend with clean code",
    },
    # Knowledge — Information management
    # ─────────────────────────────────────────
    "knowledge_manager": {
        "role": "Knowledge Manager",
        "department": "knowledge",
        "model": "qwen3.5:4b",
        "fallback": "llama3.2:3b",
        "temperature": 0.1,
        "prompt": "knowledge_manager.md",
        "tools": ["memory", "knowledge", "qdrant", "postgres"],
        "description": "Indexes, retrieves and organises all platform knowledge",
    },
}


def get_agent(name: str) -> dict:
    agent = AGENTS.get(name)
    if not agent:
        raise ValueError(f"Agent '{name}' not found in registry")
    return agent


def list_agents() -> list[str]:
    return list(AGENTS.keys())


def list_by_department(department: str) -> list[str]:
    return [
        name
        for name, config in AGENTS.items()
        if config["department"] == department
    ]
