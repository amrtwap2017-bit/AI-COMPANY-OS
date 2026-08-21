"""
Schemas for Knowledge Graph Domain
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class KnowledgeNode(BaseModel):
    id: str
    label: str
    type: str
    properties: Dict[str, Any] = {}

class KnowledgeEdge(BaseModel):
    source: str
    target: str
    relationship: str

class KnowledgeGraphOverview(BaseModel):
    hotel_id: str
    total_nodes: int = 0
    total_edges: int = 0
    nodes: List[KnowledgeNode] = []
    edges: List[KnowledgeEdge] = []
