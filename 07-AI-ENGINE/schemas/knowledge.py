from pydantic import BaseModel, Field


class IngestTextRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=10)
    source: str = Field(default="manual", max_length=500)
    doc_type: str = Field(default="text", max_length=50)


class IngestResponse(BaseModel):
    document_id: int
    chunk_count: int
    success: bool
    error: str | None = None


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    min_score: float = Field(default=0.3, ge=0.0, le=1.0)


class SearchResultItem(BaseModel):
    score: float
    text: str
    source: str
    title: str
    document_id: int
    chunk_index: int


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    total: int


class RAGRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)
    model: str | None = None


class RAGResponse(BaseModel):
    query: str
    answer: str
    model_used: str
    sources: list[str]
    context_chunks: int
    success: bool
    error: str | None = None
