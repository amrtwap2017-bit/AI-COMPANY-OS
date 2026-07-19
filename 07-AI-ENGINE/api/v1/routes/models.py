from fastapi import APIRouter

from services.ollama import ollama_service
from models.router import model_router

router = APIRouter()


@router.get("/models")
def list_models():
    return {
        "installed": ollama_service.list_models(),
        "registered": model_router.all_models(),
    }


@router.get("/models/route")
def route_model(task: str):
    selected = model_router.route(task)
    return {
        "task": task,
        "selected_model": selected,
        "capabilities": model_router.capabilities(selected),
    }
