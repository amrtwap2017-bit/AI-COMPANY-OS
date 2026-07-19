"""
app/api/v1/routes/chat.py
────────────────────────────────────────────────────────────────
Chat routes.

POST /chat         Standard (blocking) chat with full pipeline
POST /chat/stream  Streaming chat with full pipeline
GET  /conversations
GET  /conversations/{id}/messages
"""

from __future__ import annotations

import json
import time
import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import chat_service
from app.agents.registry import get_agent
from app.models.router import model_router
from app.core.config import settings
from app.db.database import get_db
from app.repositories.conversation import ConversationRepository
from app.repositories.agent_run import AgentRunRepository
from app.memory.service import MemoryService, MemorySaveRequest
from app.core.prompt_loader import load_prompt_with_fallback
from app.knowledge.search import knowledge_search

log = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────────────────────
# POST /chat — standard blocking
# ─────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    Send a message to an agent.
    Full pipeline: context → generate → memory → reflect → track.
    """
    result = chat_service.chat(
        message=req.message,
        agent_name=req.agent,
        conversation_id=req.conversation_id,
        use_memory=req.use_memory,
        use_knowledge=req.use_knowledge,
    )

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return ChatResponse(
        conversation_id=result.conversation_id,
        message_id=result.message_id,
        agent=result.agent,
        model_used=result.model_used,
        response=result.response,
        sources=result.sources,
        context_chunks=result.context_chunks,
        tools_used=result.tools_used or [],
    )


# ─────────────────────────────────────────────────────────────
# POST /chat/stream — streaming with full pipeline
# ─────────────────────────────────────────────────────────────

@router.post("/chat/stream")
async def chat_stream(
    req: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    Stream a response token by token (SSE).
    Full pipeline: context → stream → persist → memory → reflect → track.
    """
    start_time = time.time()
    agent_name = req.agent

    # ── 1. Load agent config ──────────────────────────────────
    try:
        agent = get_agent(agent_name)
    except ValueError:
        agent = get_agent("researcher")
        agent_name = "researcher"

    # ── 2. Select model ───────────────────────────────────────
    model = model_router.route_with_fallback(req.message, agent["model"])

    # ── 3. Load or create conversation ────────────────────────
    convo_repo = ConversationRepository(db)
    run_repo   = AgentRunRepository(db)
    mem_svc    = MemoryService(db)

    if req.conversation_id:
        convo = convo_repo.get(req.conversation_id)
        conversation_id = convo.id if convo else None
    else:
        conversation_id = None

    if not conversation_id:
        convo = convo_repo.create(
            agent_name=agent_name,
            title=req.message[:80],
            status="active",
        )
        conversation_id = convo.id

    # ── 4. Build system prompt ────────────────────────────────
    base_prompt = load_prompt_with_fallback(
        agent_name,
        fallback_description=agent.get("description", ""),
    )

    knowledge_context = ""
    sources: list[str] = []

    if req.use_knowledge:
        try:
            results = knowledge_search.search(req.message, top_k=3)
            if results:
                lines = [f"[{r.source}]\n{r.text}" for r in results]
                knowledge_context = (
                    "\n\n## Relevant Knowledge\n"
                    + "\n".join(lines)
                )
                sources = list({r.source for r in results})
        except Exception as exc:
            log.debug("Knowledge retrieval failed: %s", exc)

    # ── 5. Add recent conversation history ────────────────────
    history_context = ""
    try:
        history = convo_repo.get_messages(conversation_id, limit=6)
        if history:
            lines = [f"{m.role.upper()}: {m.content[:150]}" for m in history]
            history_context = "\n\n## Conversation History\n" + "\n".join(lines)
    except Exception:
        pass

    system = base_prompt + history_context + knowledge_context

    # ── 6. Log agent run start ────────────────────────────────
    run = run_repo.start(
        agent_name=agent_name,
        model_used=model,
        user_input=req.message,
        conversation_id=conversation_id,
    )

    # ── 7. Save user message ──────────────────────────────────
    convo_repo.add_message(
        conversation_id=conversation_id,
        role="user",
        content=req.message,
        agent_name=agent_name,
    )

    async def event_stream():
        full_response = ""
        success = True
        error_msg = None

        try:
            from ollama import Client
            client = Client(
                host=settings.OLLAMA_HOST,
                timeout=600,
            )

            stream = client.chat(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": req.message},
                ],
                stream=True,
            )

            for chunk in stream:
                token = chunk["message"]["content"]
                full_response += token
                data = json.dumps({
                    "token": token,
                    "done": False,
                    "conversation_id": conversation_id,
                })
                yield f"data: {data}\n\n"

        except Exception as exc:
            success = False
            error_msg = str(exc)
            log.error("Stream error: %s", exc)
            error_data = json.dumps({"error": str(exc), "done": True})
            yield f"data: {error_data}\n\n"
            return

        duration = time.time() - start_time

        # ── 8. Post-stream pipeline ───────────────────────────
        try:
            # Complete agent run log
            if success:
                run_repo.complete(
                    run_id=run.id,
                    output=full_response,
                    duration_seconds=duration,
                )
            else:
                run_repo.fail(
                    run_id=run.id,
                    error=error_msg or "stream failed",
                    duration_seconds=duration,
                )

            # Save assistant message
            assistant_msg = convo_repo.add_message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response,
                agent_name=agent_name,
                model_used=model,
            )

            # Save to memory
            if req.use_memory and success and full_response:
                try:
                    mem_svc.save(MemorySaveRequest(
                        agent_name=agent_name,
                        content=req.message,
                        memory_type="short_term",
                        extra_data={
                            "role": "user",
                            "conversation_id": conversation_id,
                        },
                    ))
                    mem_svc.save(MemorySaveRequest(
                        agent_name=agent_name,
                        content=full_response[:500],
                        memory_type="short_term",
                        extra_data={
                            "role": "assistant",
                            "conversation_id": conversation_id,
                        },
                    ))
                except Exception as exc:
                    log.debug("Stream memory save failed: %s", exc)

            # Reflect
            try:
                from app.reflection.engine import ReflectionEngine
                from app.reflection.models import ExecutionRecord
                ReflectionEngine(db).reflect(ExecutionRecord(
                    agent_name=agent_name,
                    model_used=model,
                    task=req.message,
                    output=full_response,
                    status="success" if success else "failed",
                    duration_seconds=duration,
                    error=error_msg,
                    conversation_id=conversation_id,
                ))
            except Exception as exc:
                log.debug("Stream reflection failed: %s", exc)

            # Track analytics
            try:
                from app.analytics.tracker import track_chat
                track_chat(
                    agent_name=agent_name,
                    model_used=model,
                    message=req.message,
                    response=full_response,
                    duration=duration,
                )
            except Exception as exc:
                log.debug("Stream analytics failed: %s", exc)

        except Exception as exc:
            log.error("Post-stream pipeline failed: %s", exc)

        # Final SSE message
        final = json.dumps({
            "token": "",
            "done": True,
            "model": model,
            "agent": agent_name,
            "conversation_id": conversation_id,
            "duration_seconds": round(duration, 2),
            "sources": sources,
        })
        yield f"data: {final}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ─────────────────────────────────────────────────────────────
# GET /conversations
# ─────────────────────────────────────────────────────────────

@router.get("/conversations")
def list_conversations(limit: int = 20):
    return {
        "conversations": chat_service.list_conversations(limit=limit)
    }


# ─────────────────────────────────────────────────────────────
# GET /conversations/{id}/messages
# ─────────────────────────────────────────────────────────────

@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: int, limit: int = 50):
    messages = chat_service.get_history(
        conversation_id=conversation_id,
        limit=limit,
    )
    if not messages:
        raise HTTPException(
            status_code=404,
            detail=f"Conversation {conversation_id} not found or empty",
        )
    return {
        "conversation_id": conversation_id,
        "total": len(messages),
        "messages": messages,
    }
