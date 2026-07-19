"""
app/orchestrator/manager.py
────────────────────────────────────────────────────────────────
Central coordinator for single-agent execution.

Pipeline:
  1. Load agent config + system prompt
  2. Select model
  3. Build context (ContextBuilder)
  4. Retrieve knowledge (RAG)
  5. Assemble final prompt
  6. Execute via Ollama
  7. Save to memory (MemorySaveRequest)
  8. Reflect on execution
  9. Track analytics
"""

from __future__ import annotations

import time
import logging

from app.agents.registry import get_agent
from app.models.router import model_router
from app.services.ollama import ollama_service
from app.knowledge.search import knowledge_search
from app.core.prompt_loader import load_prompt_with_fallback
from app.agents.base import AgentResponse
from app.db.database import SessionLocal
from app.tools.decider import tool_decider
from app.tools.executor import tool_executor
from app.tools.registry import AGENT_PERMISSIONS

log = logging.getLogger(__name__)


class Orchestrator:

    def run(
        self,
        agent_name: str,
        user_input: str,
        use_memory: bool = True,
        use_knowledge: bool = True,
        conversation_id: int | None = None,
        conversation_history: list[dict] | None = None,
    ) -> AgentResponse:

        start_time = time.time()
        db = SessionLocal()

        try:
            return self._execute(
                db=db,
                agent_name=agent_name,
                user_input=user_input,
                use_memory=use_memory,
                use_knowledge=use_knowledge,
                conversation_id=conversation_id,
                conversation_history=conversation_history,
                start_time=start_time,
            )
        finally:
            db.close()

    def _execute(
        self,
        db,
        agent_name: str,
        user_input: str,
        use_memory: bool,
        use_knowledge: bool,
        conversation_id: int | None,
        conversation_history: list[dict] | None,
        start_time: float,
    ) -> AgentResponse:

        # ── 1. Load agent config ──────────────────────
        try:
            agent = get_agent(agent_name)
        except ValueError:
            agent = get_agent("researcher")
            agent_name = "researcher"

        # ── 2. Load system prompt from file ───────────
        base_prompt = load_prompt_with_fallback(
            agent_name,
            fallback_description=agent.get("description", ""),
        )

        # ── 3. Select model ───────────────────────────
        model = model_router.route_with_fallback(
            user_input, agent["model"]
        )

        # ── 4. Build context (memory + conversation) ──
        memory_context = ""
        if use_memory:
            try:
                from app.context.builder import ContextBuilder
                from app.context.assembler import PromptAssembler
                builder = ContextBuilder(db)
                context = builder.build(
                    agent_name=agent_name,
                    task=user_input,
                    conversation_id=conversation_id,
                    memory_query=user_input,
                    include_memory=True,
                    include_conversation=bool(conversation_id),
                )
                assembled = PromptAssembler().assemble(context)
                memory_items = context.by_source("memory")
                if memory_items:
                    lines = [i.content for i in memory_items]
                    memory_context = (
                        "\n\n## Relevant Memory\n"
                        + "\n".join(lines)
                    )
            except Exception as exc:
                log.debug("Context build failed: %s", exc)

        # ── 5. Retrieve knowledge ─────────────────────
        knowledge_context = ""
        if use_knowledge:
            try:
                knowledge_results = knowledge_search.search(
                    user_input, top_k=3
                )
                if knowledge_results:
                    lines = [
                        f"[{r.source}]: {r.text}"
                        for r in knowledge_results
                    ]
                    knowledge_context = (
                        "\n\n## Relevant Knowledge\n"
                        + "\n".join(lines)
                    )
            except Exception as exc:
                log.debug("Knowledge retrieval failed: %s", exc)

        # ── 6. Build conversation history context ─────
        history_context = ""
        if conversation_history:
            lines = []
            for msg in conversation_history[-6:]:
                role    = msg.get("role", "user").upper()
                content = msg.get("content", "")[:200]
                lines.append(f"{role}: {content}")
            history_context = (
                "\n\n## Conversation History\n"
                + "\n".join(lines)
            )

        # ── 7. Assemble final system prompt ────────────
        system = base_prompt
        if history_context:
            system += history_context
        if memory_context:
            system += memory_context
        if knowledge_context:
            system += knowledge_context

        # ── 8. Execute ────────────────────────────────
        try:
            content = ollama_service.generate(
                model=model,
                prompt=user_input,
                system=system,
            )
            duration = time.time() - start_time
            status   = "success"
            error    = None
        except Exception as exc:
            duration = time.time() - start_time
            content  = ""
            status   = "failed"
            error    = str(exc)

        # ── 9. Save to memory (correct interface) ──────
        if use_memory and status == "success":
            try:
                from app.memory.service import MemoryService, MemorySaveRequest
                mem_svc = MemoryService(db)
                mem_svc.save(MemorySaveRequest(
                    agent_name=agent_name,
                    content=user_input,
                    memory_type="short_term",
                    extra_data={"role": "user"},
                ))
                mem_svc.save(MemorySaveRequest(
                    agent_name=agent_name,
                    content=content[:500],
                    memory_type="short_term",
                    extra_data={"role": "assistant"},
                ))
            except Exception as exc:
                log.debug("Memory save failed: %s", exc)

        # ── 10. Reflect on execution ──────────────────
        try:
            from app.reflection.engine import ReflectionEngine
            from app.reflection.models import ExecutionRecord
            ReflectionEngine(db).reflect(ExecutionRecord(
                agent_name=agent_name,
                model_used=model,
                task=user_input,
                output=content,
                status=status,
                duration_seconds=duration,
                error=error,
            ))
        except Exception as exc:
            log.debug("Reflection failed: %s", exc)

        # ── 11. Track analytics ───────────────────────
        try:
            from app.analytics.tracker import track_agent_call
            track_agent_call(
                agent_name=agent_name,
                model_used=model,
                user_input=user_input,
                output=content,
                duration=duration,
                success=(status == "success"),
            )
        except Exception as exc:
            log.debug("Analytics tracking failed: %s", exc)

        if status == "failed":
            return AgentResponse(
                agent_name=agent_name,
                model_used=model,
                content="",
                success=False,
                error=error,
            )

        return AgentResponse(
            agent_name=agent_name,
            model_used=model,
            content=content,
            success=True,
            metadata={
                "duration_seconds": round(duration, 2),
                "used_memory": bool(memory_context),
                "used_knowledge": bool(knowledge_context),
                "prompt_loaded": bool(base_prompt),
            },
        )


orchestrator = Orchestrator()
