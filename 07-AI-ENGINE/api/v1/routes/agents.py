from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.registry import list_agents, get_agent, list_by_department
from orchestrator.manager import orchestrator

router = APIRouter()


class RunRequest(BaseModel):
    agent: str
    input: str
    use_memory: bool = True
    use_knowledge: bool = True


@router.get("/agents")
def agents():
    return {"agents": list_agents()}


@router.get("/agents/{name}")
def agent_detail(name: str):
    try:
        return get_agent(name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/departments/{department}/agents")
def agents_by_department(department: str):
    return {"department": department, "agents": list_by_department(department)}


@router.post("/run")
def run_agent(req: RunRequest):
    result = orchestrator.run(
        agent_name=req.agent,
        user_input=req.input,
        use_memory=req.use_memory,
        use_knowledge=req.use_knowledge,
    )
    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)
    return {
        "agent": result.agent_name,
        "model": result.model_used,
        "response": result.content,
    }
