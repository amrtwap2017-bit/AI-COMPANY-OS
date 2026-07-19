from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RouteRequest(BaseModel):
    task_type: str
    complexity: str = "medium"

@router.post("/route")
async def route_model(req: RouteRequest):
    if req.complexity == "high":
        return {"model": "qwen2.5-coder:14b", "provider": "ollama", "is_local": True}
    return {"model": "qwen2.5-coder:7b", "provider": "ollama", "is_local": True}

@router.get("/available")
async def list_models():
    return {"models": [
        {"id": "qwen2.5-coder:7b",  "provider": "ollama", "task": "coding"},
        {"id": "qwen2.5-coder:14b", "provider": "ollama", "task": "architecture"},
        {"id": "nomic-embed-text",   "provider": "ollama", "task": "embedding"},
    ]}
