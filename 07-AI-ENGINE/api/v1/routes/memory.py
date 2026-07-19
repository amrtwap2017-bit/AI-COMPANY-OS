"""
app/api/v1/routes/memory.py
────────────────────────────────────────────────────────────────
Memory management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from memory.service import MemoryService, MemorySaveRequest

router = APIRouter()


def get_memory_service(db: Session = Depends(get_db)) -> MemoryService:
    return MemoryService(db)


class SaveMemoryRequest(BaseModel):
    agent_name:  str
    content:     str
    memory_type: str = "short_term"
    importance:  float | None = None


class SearchMemoryRequest(BaseModel):
    query:      str
    agent_name: str | None = None
    limit:      int = 10


@router.post("/memory/save")
def save_memory(
    request: SaveMemoryRequest,
    svc: MemoryService = Depends(get_memory_service),
) -> dict:
    """Save a memory entry for an agent."""
    entry = svc.save(MemorySaveRequest(
        agent_name=request.agent_name,
        content=request.content,
        memory_type=request.memory_type,
        importance=request.importance,
    ))
    return {
        "id": entry.id,
        "agent_name": entry.agent_name,
        "memory_type": entry.memory_type,
        "importance": entry.importance,
        "created_at": entry.created_at.isoformat(),
    }


@router.get("/memory/{agent_name}")
def get_agent_memory(
    agent_name: str,
    memory_type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    svc: MemoryService = Depends(get_memory_service),
) -> dict:
    """Get all memories for a specific agent."""
    entries = svc.get_by_agent(agent_name, memory_type, limit)
    return {
        "agent": agent_name,
        "count": len(entries),
        "memories": [
            {
                "id": e.id,
                "content": e.content,
                "memory_type": e.memory_type,
                "importance": e.importance,
                "created_at": e.created_at.isoformat(),
            }
            for e in entries
        ],
    }


@router.get("/memory/search/{query}")
def search_memory(
    query: str,
    agent_name: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
    svc: MemoryService = Depends(get_memory_service),
) -> dict:
    """Search memories by content."""
    entries = svc.search(query, agent_name, limit)
    return {
        "query": query,
        "count": len(entries),
        "results": [
            {
                "id": e.id,
                "agent": e.agent_name,
                "content": e.content,
                "memory_type": e.memory_type,
                "importance": e.importance,
            }
            for e in entries
        ],
    }


@router.delete("/memory/{memory_id}")
def delete_memory(
    memory_id: int,
    svc: MemoryService = Depends(get_memory_service),
) -> dict:
    """Delete a memory entry by ID."""
    deleted = svc.delete(memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"deleted": True, "id": memory_id}


@router.get("/memory/vector/stats")
def vector_memory_stats() -> dict:
    """Statistics about the vector memory store (Qdrant)."""
    from memory.vector_store import memory_vector_store
    return memory_vector_store.collection_stats()


@router.post("/memory/vector/search")
def semantic_search(
    query:      str,
    agent_name: str | None = None,
    limit:      int        = Query(default=10, ge=1, le=50),
    min_score:  float      = Query(default=0.25, ge=0.0, le=1.0),
    svc: MemoryService     = Depends(get_memory_service),
) -> dict:
    """
    Semantic vector search across agent memories.
    Uses Qdrant similarity — finds conceptually related memories
    even when keywords do not match exactly.
    """
    entries = svc.search_semantic(
        query=query,
        agent_name=agent_name,
        limit=limit,
        min_score=min_score,
    )
    return {
        "query":      query,
        "agent":      agent_name,
        "count":      len(entries),
        "search_type": "semantic_vector",
        "results": [
            {
                "id":          e.id,
                "agent":       e.agent_name,
                "content":     e.content,
                "memory_type": e.memory_type,
                "importance":  e.importance,
                "has_vector":  e.qdrant_id is not None,
            }
            for e in entries
        ],
    }


@router.get("/memory/{agent_name}/context")
def get_context_memories(
    agent_name: str,
    limit: int = Query(default=10, ge=1, le=20),
    svc: MemoryService = Depends(get_memory_service),
) -> dict:
    """Get the most relevant memories for building agent context."""
    entries = svc.get_context_memories(agent_name, limit)
    return {
        "agent": agent_name,
        "count": len(entries),
        "memories": [
            {
                "id": e.id,
                "content": e.content,
                "memory_type": e.memory_type,
                "importance": e.importance,
            }
            for e in entries
        ],
    }
