from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.prompt_loader import (
    load_prompt,
    reload_prompt,
    list_available_prompts,
    prompt_stats,
)
from agents.registry import list_agents, get_agent

router = APIRouter()


class PromptUpdateRequest(BaseModel):
    content: str


class PromptTestRequest(BaseModel):
    agent: str
    input: str


@router.get("/prompts")
def list_prompts():
    """List all agents and their prompt status."""
    all_agents = list_agents()
    available = list_available_prompts()

    return {
        "stats": prompt_stats(),
        "agents": [
            {
                "agent": name,
                "has_prompt": name in available,
                "prompt_file": f"{name}.md",
            }
            for name in all_agents
        ],
    }


@router.get("/prompts/{agent_name}")
def get_prompt(agent_name: str):
    """Get the full system prompt for an agent."""
    all_agents = list_agents()
    if agent_name not in all_agents:
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{agent_name}' not found",
        )

    prompt = load_prompt(agent_name)
    agent = get_agent(agent_name)

    return {
        "agent": agent_name,
        "role": agent["role"],
        "model": agent["model"],
        "has_prompt": bool(prompt),
        "prompt": prompt or f"No prompt file found. Using description: {agent['description']}",
        "character_count": len(prompt),
    }


@router.post("/prompts/{agent_name}/reload")
def reload_agent_prompt(agent_name: str):
    """Force reload a prompt from disk."""
    prompt = reload_prompt(agent_name)
    return {
        "agent": agent_name,
        "reloaded": True,
        "has_prompt": bool(prompt),
        "character_count": len(prompt),
    }


@router.post("/prompts/test")
def test_prompt(req: PromptTestRequest):
    """Test an agent with its full prompt loaded."""
    from orchestrator.manager import orchestrator

    result = orchestrator.run(
        agent_name=req.agent,
        user_input=req.input,
        use_memory=False,
        use_knowledge=False,
    )

    return {
        "agent": req.agent,
        "input": req.input,
        "response": result.content,
        "model": result.model_used,
        "success": result.success,
        "error": result.error,
    }
