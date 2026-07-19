"""
Ollama SSE Streaming Chat Service
Wires /api/v1/ai/chat → Ollama streaming
"""
import json
import httpx
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator

OLLAMA_BASE = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5-coder:7b"

async def stream_chat(
    message: str,
    model: str = DEFAULT_MODEL,
    system: str = "You are a helpful AI assistant for AI Company OS.",
    history: list = []
) -> AsyncGenerator[str, None]:
    """Stream chat tokens from Ollama as SSE events."""
    
    # Build messages
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    for h in history[-10:]:  # Last 10 turns
        messages.append(h)
    messages.append({"role": "user", "content": message})
    
    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": 0.7,
            "num_predict": 2048,
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_BASE}/api/chat",
                json=payload
            ) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'error': f'Ollama error: {response.status_code}'})}\n\n"
                    return
                
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        token = chunk.get("message", {}).get("content", "")
                        done = chunk.get("done", False)
                        
                        if token:
                            yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
                        
                        if done:
                            usage = {
                                "prompt_tokens": chunk.get("prompt_eval_count", 0),
                                "completion_tokens": chunk.get("eval_count", 0),
                                "model": model,
                            }
                            yield f"data: {json.dumps({'token': '', 'done': True, 'usage': usage})}\n\n"
                            return
                    except json.JSONDecodeError:
                        continue
    except httpx.ConnectError:
        yield f"data: {json.dumps({'error': 'Cannot connect to Ollama. Is it running on port 11434?'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


async def simple_chat(
    message: str,
    model: str = DEFAULT_MODEL,
    system: str = "You are a helpful AI assistant."
) -> str:
    """Non-streaming single response from Ollama."""
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": message}
        ],
        "stream": False,
        "options": {"temperature": 0.7, "num_predict": 1024}
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{OLLAMA_BASE}/api/chat", json=payload)
            data = resp.json()
            return data.get("message", {}).get("content", "No response")
    except Exception as e:
        return f"Error: {str(e)}"


def create_chat_router():
    """Returns FastAPI router with /chat endpoints."""
    from fastapi import APIRouter
    from pydantic import BaseModel
    
    chat_router = APIRouter(prefix="/api/v1/ai")
    
    class ChatRequest(BaseModel):
        message: str
        model: str = DEFAULT_MODEL
        system: str = "You are a helpful AI assistant for AI Company OS."
        stream: bool = True
        history: list = []
    
    @chat_router.post("/chat")
    async def chat_endpoint(req: ChatRequest):
        if req.stream:
            return StreamingResponse(
                stream_chat(req.message, req.model, req.system, req.history),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                    "Connection": "keep-alive",
                }
            )
        else:
            response = await simple_chat(req.message, req.model, req.system)
            return {
                "response": response,
                "model": req.model,
                "done": True
            }
    
    @chat_router.get("/chat/models")
    async def available_models():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{OLLAMA_BASE}/api/tags")
                data = resp.json()
                models = [m["name"] for m in data.get("models", [])]
                return {"models": models, "default": DEFAULT_MODEL}
        except:
            return {"models": [DEFAULT_MODEL], "default": DEFAULT_MODEL, "error": "Ollama unavailable"}
    
    return chat_router
