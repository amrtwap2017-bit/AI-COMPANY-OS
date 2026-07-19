import uuid

def make_plan(requirement: str) -> dict:
    rg = str(uuid.uuid4())[:8]
    branch = f"hub/builder-{rg}"

    return {
        "requirement": requirement,
        "benchmark_gate": {
            "enabled": True,
            "benchmark_id": "architect_design",
            "agent_name": None,
            "use_llm_scoring": False,
        },
        "steps": [
            {"tool": "git.status", "args": {}},
            {"tool": "git.checkout_new_branch", "args": {"name": branch}},
            {"tool": "filesystem.read_text", "args": {"path": "README.md"}},
            {"tool": "git.status", "args": {}},
        ],
    }
