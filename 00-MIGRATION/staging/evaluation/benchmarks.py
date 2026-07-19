"""
app/evaluation/benchmarks.py
────────────────────────────────────────────────────────────────
Standard test prompts (golden set) for each agent.

Each benchmark has:
  id:           unique identifier for tracking over time
  agent:        which agent to test
  prompt:       the test input
  min_length:   minimum acceptable output length (chars)
  keywords:     words that MUST appear in a good output
  anti_keywords: words that indicate a bad output

These are intentionally simple, deterministic prompts
designed to detect quality regressions — not to test
capability limits.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Benchmark:
    benchmark_id:  str
    agent_name:    str
    prompt:        str
    description:   str
    min_length:    int         = 100
    keywords:      list[str]   = field(default_factory=list)
    anti_keywords: list[str]   = field(default_factory=list)


# ── Golden benchmark set ──────────────────────────────────────

BENCHMARKS: list[Benchmark] = [

    # ── Researcher ────────────────────────────────────────────
    Benchmark(
        benchmark_id="researcher_basic",
        agent_name="researcher",
        prompt="What is machine learning and how does it work?",
        description="Basic ML concept explanation",
        min_length=200,
        keywords=["learn", "data", "model", "train"],
        anti_keywords=["i cannot", "i don't know", "sorry"],
    ),
    Benchmark(
        benchmark_id="researcher_synthesis",
        agent_name="researcher",
        prompt=(
            "Compare supervised and unsupervised learning. "
            "Give two examples of each."
        ),
        description="Concept comparison and examples",
        min_length=300,
        keywords=["supervised", "unsupervised", "example"],
        anti_keywords=["i cannot", "unclear"],
    ),

    # ── Writer ────────────────────────────────────────────────
    Benchmark(
        benchmark_id="writer_summary",
        agent_name="writer",
        prompt=(
            "Write a 3-paragraph executive summary about "
            "the importance of data quality in AI systems."
        ),
        description="Executive summary writing",
        min_length=200,
        keywords=["data", "quality", "AI", "system"],
        anti_keywords=["i cannot", "sorry"],
    ),
    Benchmark(
        benchmark_id="writer_structure",
        agent_name="writer",
        prompt=(
            "Write a structured report with introduction, "
            "key findings, and conclusion about remote work productivity."
        ),
        description="Structured report with sections",
        min_length=300,
        keywords=["introduction", "finding", "conclusion"],
        anti_keywords=["i cannot"],
    ),

    # ── Planner ───────────────────────────────────────────────
    Benchmark(
        benchmark_id="planner_sprint",
        agent_name="planner",
        prompt=(
            "Create a 5-task sprint plan for building "
            "a user authentication system."
        ),
        description="Sprint planning with tasks",
        min_length=150,
        keywords=["task", "auth", "user", "test"],
        anti_keywords=["i cannot", "unclear"],
    ),

    # ── Analyst ───────────────────────────────────────────────
    Benchmark(
        benchmark_id="analyst_insight",
        agent_name="analyst",
        prompt=(
            "A company has 30% user churn rate monthly. "
            "What are the likely causes and how would you investigate?"
        ),
        description="Business analysis and investigation plan",
        min_length=200,
        keywords=["churn", "cause", "data", "metric"],
        anti_keywords=["i cannot"],
    ),

    # ── Architect ─────────────────────────────────────────────
    Benchmark(
        benchmark_id="architect_design",
        agent_name="architect",
        prompt=(
            "Design a high-level architecture for a real-time "
            "chat application supporting 10,000 concurrent users."
        ),
        description="System architecture design",
        min_length=250,
        keywords=["service", "database", "scale", "component"],
        anti_keywords=["i cannot"],
    ),

    # ── Evaluator ─────────────────────────────────────────────
    Benchmark(
        benchmark_id="evaluator_score",
        agent_name="evaluator",
        prompt=(
            "Evaluate this AI output on a 1-10 scale:\n"
            "Task: Explain neural networks\n"
            "Output: Neural networks are computing systems "
            "inspired by biological neural networks. They consist "
            "of layers of interconnected nodes that process information."
        ),
        description="Evaluate and score an output",
        min_length=100,
        keywords=["score", "feedback", "strength"],
        anti_keywords=["i cannot"],
    ),

    # ── Developer ─────────────────────────────────────────────
    Benchmark(
        benchmark_id="developer_fullstack",
        agent_name="developer",
        prompt=(
            "Build a simple REST API endpoint in Python/FastAPI that "
            "accepts a POST request with {name: str, age: int}, validates "
            "the input, and returns a greeting. Include error handling."
        ),
        description="Full-stack feature implementation",
        min_length=150,
        keywords=["def", "post", "return", "fastapi", "router"],
        anti_keywords=["i cannot", "sorry"],
    ),

    # ── DevOps ────────────────────────────────────────────────
    Benchmark(
        benchmark_id="devops_docker",
        agent_name="devops",
        prompt=(
            "Write a production-ready Dockerfile for a Python FastAPI "
            "application. Include multi-stage build, non-root user, "
            "health check, and proper layer caching."
        ),
        description="Docker configuration",
        min_length=150,
        keywords=["FROM", "COPY", "RUN", "CMD", "USER"],
        anti_keywords=["i cannot", "sorry"],
    ),

    # ── Tester ────────────────────────────────────────────────
    Benchmark(
        benchmark_id="tester_api",
        agent_name="tester",
        prompt=(
            "Write pytest tests for a user registration API endpoint "
            "that accepts email and password. Cover: success case, "
            "duplicate email, invalid email, weak password."
        ),
        description="API test coverage",
        min_length=200,
        keywords=["def test_", "assert", "pytest", "status"],
        anti_keywords=["i cannot", "sorry"],
    ),

    # ── CEO ───────────────────────────────────────────────────
    Benchmark(
        benchmark_id="ceo_strategy",
        agent_name="ceo",
        prompt=(
            "Define a go-to-market strategy for a new B2B SaaS product "
            "targeting small businesses. Include target market, pricing "
            "model, key metrics, and 90-day launch plan."
        ),
        description="Strategic planning",
        min_length=200,
        keywords=["market", "pricing", "metric", "strategy", "plan"],
        anti_keywords=["i cannot", "sorry"],
    ),

    # ── CTO ───────────────────────────────────────────────────
    Benchmark(
        benchmark_id="cto_technical",
        agent_name="cto",
        prompt=(
            "Evaluate the technical trade-offs between a monolithic "
            "architecture and microservices for a startup with 3 engineers "
            "building an MVP. Make a clear recommendation with reasoning."
        ),
        description="Technical decision making",
        min_length=200,
        keywords=["monolith", "microservice", "recommend", "trade-off"],
        anti_keywords=["i cannot", "sorry"],
    ),

    # ── Reviewer ──────────────────────────────────────────────
    Benchmark(
        benchmark_id="reviewer_security",
        agent_name="reviewer",
        prompt=(
            "Review this Python code for security issues:\n\n"
            "def login(username, password):\n"
            "    query = f\"SELECT * FROM users WHERE username=\'{username}\'\n"
            "    user = db.execute(query).fetchone()\n"
            "    if user and user.password == password:\n"
            "        return token\n\n"
            "List all security issues with severity and fix."
        ),
        description="Security code review",
        min_length=150,
        keywords=["sql", "injection", "hash", "issue", "critical"],
        anti_keywords=["looks good", "no issues"],
    ),
]


def get_benchmarks(agent_name: str | None = None) -> list[Benchmark]:
    """Return all benchmarks, optionally filtered by agent."""
    if agent_name:
        return [b for b in BENCHMARKS if b.agent_name == agent_name]
    return BENCHMARKS


def get_benchmark(benchmark_id: str) -> Benchmark | None:
    """Return a specific benchmark by ID."""
    return next(
        (b for b in BENCHMARKS if b.benchmark_id == benchmark_id),
        None,
    )


def list_agents_with_benchmarks() -> list[str]:
    """Return all agents that have benchmarks."""
    return sorted({b.agent_name for b in BENCHMARKS})
