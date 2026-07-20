"""
Chat Router — Ollama SSE Streaming
Replaces stub with real streaming implementation
"""
import json
import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator, Optional

router = APIRouter()

# ── RAG context injection ──────────────────────────────────
def _get_rag_context(query: str, top_k: int = 3) -> str:
    """Fetch relevant knowledge and return as context string."""
    try:
        from knowledge.hybrid_search import hybrid_search
        results = hybrid_search.search(query, top_k=min(top_k, 2), min_score=0.005)
        if not results:
            return ""
        lines = ["\n\n[KNOWLEDGE BASE CONTEXT]"]
        for i, r in enumerate(results, 1):
            lines.append(f"[{i}] Source: {r.source}\n{r.text[:200]}")
        return "\n".join(lines)
    except Exception:
        return ""


def _get_agent_memory(agent: str, limit: int = 3) -> str:
    """Fetch this agent's previous decisions from memories table."""
    if not agent:
        return ""
    try:
        from db.database import SessionLocal as _SL
        from sqlalchemy import text as _tx
        db = _SL()
        rows = db.execute(_tx(
            "SELECT content, created_at FROM memories "
            "WHERE memory_type = 'agent_decision' "
            "AND content LIKE :pattern "
            "ORDER BY created_at DESC LIMIT :limit"
        ), {
            "pattern": f"[{agent.upper()}]%",
            "limit": limit,
        }).fetchall()
        db.close()
        if not rows:
            return ""
        lines = [f"\n\n[YOUR PREVIOUS DECISIONS as {agent}]"]
        for row in rows:
            ts = str(row[1])[:10]
            content = str(row[0])
            # Strip the [AGENT] prefix for display
            clean = content.split("] ", 1)[-1] if "] " in content else content
            lines.append(f"- ({ts}) {clean[:150]}")
        return "\n".join(lines)
    except Exception:
        return ""


OLLAMA_BASE = "http://localhost:11434"
DEFAULT_MODEL = "qwen2.5-coder:7b"

AGENT_PROMPTS = {
    "ceo":       "CEO of Triangle Black Egypt hotel engineering SaaS. Be strategic, concise, business-focused.",
    "cto":       "CTO using FastAPI+Next.js+PostgreSQL+Qdrant. Be technical, concise, architecture-focused.",
    "architect": "Software Architect. Apply API-first, SOLID. Answer concisely with clear recommendations.",
    "backend":   "Backend Engineer. FastAPI+Python+PostgreSQL expert. Give concise code-focused answers.",
    "frontend":  "Frontend Engineer. Next.js 16+TypeScript+Tailwind expert. Give concise UI-focused answers.",
    "devops":    "DevOps Engineer. Docker+WSL2+startup scripts. Give concise infrastructure answers.",
    "tester":    "QA Engineer. Unit 70%, integration 20%, E2E 10%. Give concise test-focused answers.",
    "reviewer":  "Code Reviewer. Output: CRITICAL/WARNING/SUGGESTION/APPROVED. Be brief and direct.",
    "security":  "Security Engineer. OWASP Top 10 expert. Flag vulnerabilities with severity. Be concise.",
    "data":      "Data Engineer. PostgreSQL+Qdrant(content field, 768-dim)+SQLite expert. Be concise.",
    "pm":        "Product Manager for Triangle Black Egypt. Use ICE scoring. Be concise and business-focused.",
}

def _get_agent_prompt(agent: str, default: str) -> str:
    if not agent:
        return default
    key = agent.lower().replace(" agent","").replace("-","").replace(" ","").strip()
    for k, v in AGENT_PROMPTS.items():
        if key == k or key.startswith(k) or k.startswith(key):
            return v
    return default



class ChatRequest(BaseModel):
    message: str
    model: str = DEFAULT_MODEL
    system: str = "You are a helpful AI assistant for AI Company OS."
    stream: bool = True
    history: list = []
    agent: Optional[str] = None


async def _stream_tokens(message: str, model: str, system: str, history: list, agent: str = "") -> AsyncGenerator[str, None]:
    # Inject RAG knowledge context into system prompt
    rag_context  = _get_rag_context(message)
    agent_mem    = _get_agent_memory(agent if agent else "")
    base_system  = _get_agent_prompt(agent if agent else "", system)
    full_system  = base_system + agent_mem + rag_context
    messages = []
    if full_system:
        messages.append({"role": "system", "content": full_system})
    for h in history[-10:]:
        messages.append(h)
    messages.append({"role": "user", "content": message})

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {"temperature": 0.7, "num_predict": 2048}
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            async with client.stream("POST", f"{OLLAMA_BASE}/api/chat", json=payload) as response:
                if response.status_code != 200:
                    yield f"data: {json.dumps({'error': f'Ollama {response.status_code}'})}\n\n"
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
                            yield f"data: {json.dumps({'token': '', 'done': True, 'model': model})}\n\n"
                            return
                    except json.JSONDecodeError:
                        continue
    except httpx.ConnectError:
        yield f"data: {json.dumps({'error': 'Ollama not reachable on port 11434'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/chat")
async def chat(req: ChatRequest):
    if req.stream:
        async def _stream_with_save():
            full_response = []
            async for chunk in _stream_tokens(req.message, req.model, req.system, req.history, req.agent or ""):
                yield chunk
                try:
                    import json as _json
                    data = _json.loads(chunk.replace("data: ","").strip())
                    if data.get("token"):
                        full_response.append(data["token"])
                    if data.get("done"):
                        try:
                            from db.database import SessionLocal as _SL
                            from sqlalchemy import text as _text
                            import uuid as _uuid
                            _db = _SL()
                            # Save conversation
                            _db.execute(_text(
                                "INSERT INTO conversations (title, agent_name, status, message_count, user_id, created_at, updated_at) "
                                "VALUES (:title, :agent, :status, :mc, :uid, NOW(), NOW())"
                            ), {"title": req.message[:80], "agent": req.model,
                                "status": "completed", "mc": 2, "uid": 1})
                            # Save agent memory if agent role set
                            if req.agent and full_response:
                                _agent_key = req.agent.upper()
                                _decision  = "".join(full_response)[:200].replace("\n", " ")
                                _db.execute(_text(
                                    "INSERT INTO memories (id, workspace_id, project_id, memory_type, content, created_at) "
                                    "VALUES (:id, :ws, :pj, :mt, :content, NOW())"
                                ), {
                                    "id":      str(_uuid.uuid4()),
                                    "ws":      "2c8e07d2-b1f9-441d-a4bb-a13a2fba991a",
                                    "pj":      "707bd31b-6426-420e-a68d-3c552fe926e2",
                                    "mt":      "agent_decision",
                                    "content": f"[{_agent_key}] Q: {req.message[:60]} → {_decision}",
                                })
                            _db.commit()
                            _db.close()
                        except Exception:
                            pass
                except Exception:
                    pass
        return StreamingResponse(
            _stream_with_save(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            }
        )
    else:
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(
                    f"{OLLAMA_BASE}/api/chat",
                    json={
                        "model": req.model,
                        "messages": [
                            {"role": "system", "content": _get_agent_prompt(req.agent or "", req.system) + _get_agent_memory(req.agent or "") + _get_rag_context(req.message)},
                            {"role": "user", "content": req.message}
                        ],
                        "stream": False,
                        "options": {"temperature": 0.7, "num_predict": 1024}
                    }
                )
                data = resp.json()
                # ── Save conversation + agent memory to DB ──
                try:
                    from db.database import SessionLocal as _SL
                    from sqlalchemy import text as _text
                    import uuid as _uuid
                    _response_text = data.get("message", {}).get("content", "")
                    _db = _SL()
                    _db.execute(_text(
                        "INSERT INTO conversations (title, agent_name, status, message_count, user_id, created_at, updated_at) "
                        "VALUES (:title, :agent, :status, :mc, :uid, NOW(), NOW())"
                    ), {
                        "title":  req.message[:80],
                        "agent":  req.model,
                        "status": "completed",
                        "mc":     2,
                        "uid":    1,
                    })
                    if req.agent and _response_text:
                        _agent_key = req.agent.upper()
                        _decision  = _response_text[:200].replace("\n", " ")
                        _db.execute(_text(
                            "INSERT INTO memories (id, workspace_id, project_id, memory_type, content, created_at) "
                            "VALUES (:id, :ws, :pj, :mt, :content, NOW())"
                        ), {
                            "id":      str(_uuid.uuid4()),
                            "ws":      "2c8e07d2-b1f9-441d-a4bb-a13a2fba991a",
                            "pj":      "707bd31b-6426-420e-a68d-3c552fe926e2",
                            "mt":      "agent_decision",
                            "content": f"[{_agent_key}] Q: {req.message[:60]} → {_decision}",
                        })
                    _db.commit()
                    _db.close()
                except Exception as _dbe:
                    pass  # Non-fatal — chat still works if DB write fails
                return {
                    "response": data.get("message", {}).get("content", "No response"),
                    "model": req.model,
                    "done": True
                }
        except Exception as e:
            return {"response": f"Error: {str(e)}", "model": req.model, "done": True, "error": True}


@router.get("/chat/models")
async def list_chat_models():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE}/api/tags")
            models = [m["name"] for m in resp.json().get("models", [])]
            return {"models": models, "default": DEFAULT_MODEL, "total": len(models)}
    except Exception:
        return {"models": [DEFAULT_MODEL], "default": DEFAULT_MODEL, "error": "Ollama unavailable"}


@router.get("/chat/health")
async def chat_health():
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_BASE}/api/tags")
            models = resp.json().get("models", [])
            return {"status": "ok", "ollama": "connected", "models_loaded": len(models)}
    except Exception as e:
        return {"status": "degraded", "ollama": "disconnected", "error": str(e)}
