"""
app/services/chat.py
────────────────────────────────────────────────────────────────
Chat lifecycle manager.

Full pipeline per request:
  1.  Load or create conversation
  2.  Load message history
  3.  Load agent config + prompt
  4.  Select model
  5.  Build context (ContextBuilder — memory + conversation)
  6.  Retrieve knowledge (RAG)
  7.  Assemble final prompt
  8.  Generate response (Ollama)
  9.  Persist user + assistant messages
  10. Save response to memory (MemorySaveRequest)
  11. Reflect on execution (ReflectionEngine)
  12. Track analytics event
"""

from __future__ import annotations

import time
import logging
from dataclasses import dataclass

from sqlalchemy.orm import Session

from agents.registry import get_agent
from models.router import model_router
from services.ollama import ollama_service
from knowledge.search import knowledge_search
from db.database import SessionLocal
from models.db.conversation import Conversation
from models.db.agent_run import AgentRun
from repositories.conversation import ConversationRepository
from repositories.agent_run import AgentRunRepository
from memory.service import MemoryService, MemorySaveRequest
from context.builder import ContextBuilder
from context.assembler import PromptAssembler
from core.prompt_loader import load_prompt_with_fallback
from core.cache import response_cache
from decision.engine import DecisionEngine
from tools.decider import tool_decider
from tools.executor import tool_executor
from tools.registry import AGENT_PERMISSIONS
from decision.models import DecisionInput, DecisionVerdict

log = logging.getLogger(__name__)


@dataclass
class ChatResult:
    conversation_id: int
    message_id: int
    agent: str
    model_used: str
    response: str
    sources: list[str]
    context_chunks: int
    success: bool
    duration_seconds: float = 0.0
    error: str | None = None
    tools_used: list[str] = None

    def __post_init__(self):
        if self.tools_used is None:
            self.tools_used = []


class ChatService:

    def chat(
        self,
        message: str,
        agent_name: str = "researcher",
        conversation_id: int | None = None,
        use_memory: bool = True,
        use_knowledge: bool = True,
    ) -> ChatResult:

        db = SessionLocal()
        start_time = time.time()

        try:
            return self._execute_chat(
                db=db,
                message=message,
                agent_name=agent_name,
                conversation_id=conversation_id,
                use_memory=use_memory,
                use_knowledge=use_knowledge,
                start_time=start_time,
            )
        finally:
            db.close()

    def _execute_chat(
        self,
        db: Session,
        message: str,
        agent_name: str,
        conversation_id: int | None,
        use_memory: bool,
        use_knowledge: bool,
        start_time: float,
    ) -> ChatResult:

        convo_repo = ConversationRepository(db)
        run_repo   = AgentRunRepository(db)
        mem_svc    = MemoryService(db)
        ctx_builder = ContextBuilder(db)
        assembler   = PromptAssembler()

        # ── 1. Load or create conversation ───────────
        if conversation_id:
            convo = convo_repo.get(conversation_id)
            if not convo:
                conversation_id = None

        if not conversation_id:
            convo = convo_repo.create(
                agent_name=agent_name,
                title=message[:80],
                status="active",
            )
            conversation_id = convo.id

        # ── 2. Load agent config ──────────────────────
        try:
            agent = get_agent(agent_name)
        except ValueError:
            agent = get_agent("researcher")
            agent_name = "researcher"

        # ── 3. Select model ───────────────────────────
        model = model_router.route_with_fallback(
            message, agent["model"]
        )

        # ── 4. Build context (memory + conversation) ──
        try:
            context = ctx_builder.build(
                agent_name=agent_name,
                task=message,
                conversation_id=conversation_id if use_memory else None,
                memory_query=message,
                include_memory=use_memory,
                include_conversation=True,
            )
        except Exception as exc:
            log.warning("Context build failed: %s", exc)
            context = None

        # ── 5. Load agent system prompt from file ──────
        base_prompt = load_prompt_with_fallback(
            agent_name,
            fallback_description=agent.get("description", ""),
        )

        # ── 6. Retrieve knowledge (RAG) ────────────────
        knowledge_context = ""
        sources: list[str] = []
        context_chunks = 0

        if use_knowledge:
            try:
                knowledge_results = knowledge_search.search(
                    message, top_k=3
                )
                if knowledge_results:
                    lines = [
                        f"[Source: {r.source}]\n{r.text}"
                        for r in knowledge_results
                    ]
                    knowledge_context = (
                        "\n\n## Relevant Knowledge\n"
                        + "\n".join(lines)
                    )
                    sources = list({r.source for r in knowledge_results})
                    context_chunks = len(knowledge_results)
            except Exception as exc:
                log.debug("Knowledge retrieval failed: %s", exc)

        # ── 7. Assemble final system prompt ────────────
        if context is not None:
            system = assembler.assemble(context)
            # Prepend agent's file prompt if different from system prompt
            if base_prompt and base_prompt not in system:
                system = base_prompt + "\n\n" + system
        else:
            system = base_prompt

        if knowledge_context:
            system += knowledge_context

        # ── 7b. Execute tools (web search, scraping, etc.) ───────
        tool_results = []
        tools_used: list[str] = []
        try:
            agent_tool_perms = AGENT_PERMISSIONS.get(agent_name, [])
            if agent_tool_perms:
                decisions = tool_decider.decide(
                    message=message,
                    agent_name=agent_name,
                    agent_tools=agent_tool_perms,
                )
                if decisions:
                    tool_results = tool_executor.execute_all(
                        decisions=decisions,
                        agent_name=agent_name,
                    )
                    tool_context = tool_executor.build_context_block(tool_results)
                    if tool_context:
                        system = system + "\n\n" + tool_context
                    tools_used = [
                        r.tool_name for r in tool_results if r.success
                    ]
                    log.info(
                        "Tools executed for %s: %s",
                        agent_name, tools_used,
                    )
        except Exception as exc:
            log.debug("Tool execution failed (non-fatal): %s", exc)

        # ── 8. Log agent run start ────────────────────
        run = run_repo.start(
            agent_name=agent_name,
            model_used=model,
            user_input=message,
            conversation_id=conversation_id,
        )

        # ── 9. Generate response ──────────────────────
        try:
            response_text = ollama_service.generate(
                model=model,
                prompt=message,
                system=system,
            )
            duration = time.time() - start_time
            run_repo.complete(
                run_id=run.id,
                output=response_text,
                duration_seconds=duration,
            )
        except Exception as exc:
            duration = time.time() - start_time
            run_repo.fail(
                run_id=run.id,
                error=str(exc),
                duration_seconds=duration,
            )
            raise

        # ── 10. Persist messages ──────────────────────
        convo_repo.add_message(
            conversation_id=conversation_id,
            role="user",
            content=message,
            agent_name=agent_name,
        )
        assistant_msg = convo_repo.add_message(
            conversation_id=conversation_id,
            role="assistant",
            content=response_text,
            agent_name=agent_name,
            model_used=model,
        )

        # ── 11. Save to memory (new MemorySaveRequest) ─
        if use_memory:
            self._save_to_memory(
                mem_svc=mem_svc,
                agent_name=agent_name,
                user_message=message,
                assistant_response=response_text,
                conversation_id=conversation_id,
            )

        # ── 12. Reflect on this execution ─────────────
        self._reflect(
            db=db,
            agent_name=agent_name,
            model_used=model,
            task=message,
            output=response_text,
            duration=duration,
        )

        # ── 13. Track analytics ───────────────────────
        self._track(
            agent_name=agent_name,
            model_used=model,
            message=message,
            response=response_text,
            duration=duration,
        )

        return ChatResult(
            conversation_id=conversation_id,
            message_id=assistant_msg.id,
            agent=agent_name,
            model_used=model,
            response=response_text,
            sources=sources,
            context_chunks=context_chunks,
            success=True,
            duration_seconds=round(duration, 2),
            tools_used=tools_used,
        )

    def _save_to_memory(
        self,
        mem_svc: MemoryService,
        agent_name: str,
        user_message: str,
        assistant_response: str,
        conversation_id: int,
    ) -> None:
        """Save conversation turn to persistent memory."""
        try:
            mem_svc.save(MemorySaveRequest(
                agent_name=agent_name,
                content=user_message,
                memory_type="short_term",
                extra_data={
                    "role": "user",
                    "conversation_id": conversation_id,
                },
            ))
            mem_svc.save(MemorySaveRequest(
                agent_name=agent_name,
                content=assistant_response[:500],
                memory_type="short_term",
                extra_data={
                    "role": "assistant",
                    "conversation_id": conversation_id,
                },
            ))
        except Exception as exc:
            log.debug("Memory save failed: %s", exc)

    def _reflect(
        self,
        db: Session,
        agent_name: str,
        model_used: str,
        task: str,
        output: str,
        duration: float,
    ) -> None:
        """Reflect on this execution — never raises."""
        try:
            from reflection.engine import ReflectionEngine
            from reflection.models import ExecutionRecord
            engine = ReflectionEngine(db)
            engine.reflect(ExecutionRecord(
                agent_name=agent_name,
                model_used=model_used,
                task=task,
                output=output,
                status="success",
                duration_seconds=duration,
            ))
        except Exception as exc:
            log.debug("Reflection failed: %s", exc)

    def _track(
        self,
        agent_name: str,
        model_used: str,
        message: str,
        response: str,
        duration: float,
    ) -> None:
        """Track analytics event — never raises."""
        try:
            from analytics.tracker import track_chat
            track_chat(
                agent_name=agent_name,
                model_used=model_used,
                message=message,
                response=response,
                duration=duration,
            )
        except Exception as exc:
            log.debug("Analytics tracking failed: %s", exc)

    def get_history(
        self,
        conversation_id: int,
        limit: int = 50,
    ) -> list[dict]:
        db = SessionLocal()
        try:
            repo = ConversationRepository(db)
            messages = repo.get_messages(conversation_id, limit=limit)
            return [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "agent_name": m.agent_name,
                    "model_used": m.model_used,
                    "created_at": m.created_at.isoformat(),
                }
                for m in messages
            ]
        finally:
            db.close()

    def list_conversations(
        self,
        limit: int = 20,
    ) -> list[dict]:
        db = SessionLocal()
        try:
            repo = ConversationRepository(db)
            convos = repo.list_all(limit=limit)
            return [
                {
                    "id": c.id,
                    "title": c.title,
                    "agent_name": c.agent_name,
                    "status": c.status,
                    "message_count": c.message_count,
                    "created_at": c.created_at.isoformat(),
                }
                for c in convos
            ]
        finally:
            db.close()


chat_service = ChatService()
