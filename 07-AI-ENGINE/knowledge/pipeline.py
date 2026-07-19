"""
RAG Pipeline
─────────────────────────────────────────────────────
Combines knowledge retrieval with agent execution.
This is the core of Retrieval-Augmented Generation.

Flow:
  User Query
      │
      ▼
  Knowledge Search (semantic)
      │
      ▼
  Context Building
      │
      ▼
  Agent Execution (with context injected)
      │
      ▼
  Response
"""

from dataclasses import dataclass

from knowledge.search import knowledge_search
from services.ollama import ollama_service
from models.router import model_router


@dataclass
class RAGResponse:
    query: str
    answer: str
    model_used: str
    sources: list[str]
    context_chunks: int
    success: bool
    error: str | None = None


class RAGPipeline:

    def run(
        self,
        query: str,
        agent_role: str = "You are a helpful AI assistant.",
        model: str | None = None,
        top_k: int = 5,
    ) -> RAGResponse:
        """
        Full RAG: search knowledge → inject context → generate answer.
        """
        try:
            # ── 1. Retrieve relevant context ─────────
            results = knowledge_search.search(query, top_k=top_k)
            context = knowledge_search.search_as_context(query, top_k=top_k)

            # ── 2. Select model ───────────────────────
            selected_model = model or model_router.route(query)

            # ── 3. Build system prompt ────────────────
            system = agent_role
            if context:
                system += f"\n\n{context}"
            else:
                system += "\n\nNo specific knowledge context found. Answer from general knowledge."

            # ── 4. Generate ───────────────────────────
            answer = ollama_service.generate(
                model=selected_model,
                prompt=query,
                system=system,
            )

            return RAGResponse(
                query=query,
                answer=answer,
                model_used=selected_model,
                sources=list({r.source for r in results}),
                context_chunks=len(results),
                success=True,
            )

        except Exception as e:
            return RAGResponse(
                query=query,
                answer="",
                model_used="",
                sources=[],
                context_chunks=0,
                success=False,
                error=str(e),
            )


rag_pipeline = RAGPipeline()
