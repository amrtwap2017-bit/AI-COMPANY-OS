from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from schemas.knowledge import (
    IngestTextRequest,
    IngestResponse,
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    RAGRequest,
    RAGResponse,
)
from knowledge.ingest import knowledge_ingest
from knowledge.search import knowledge_search
from knowledge.pipeline import rag_pipeline
from knowledge.hybrid_search import hybrid_search
from db.database import SessionLocal
from models.db.document import Document

router = APIRouter()


@router.post("/knowledge/ingest", response_model=IngestResponse)
def ingest_text(req: IngestTextRequest):
    """Ingest plain text into the knowledge base."""
    knowledge_ingest.setup()
    result = knowledge_ingest.ingest_text(
        title=req.title,
        content=req.content,
        source=req.source,
        doc_type=req.doc_type,
    )
    return IngestResponse(
        document_id=result.document_id,
        chunk_count=result.chunk_count,
        success=result.success,
        error=result.error,
    )


@router.post("/knowledge/ingest/pdf", response_model=IngestResponse)
async def ingest_pdf(
    title: str,
    file: UploadFile = File(...),
):
    """Ingest a PDF file into the knowledge base."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    knowledge_ingest.setup()
    file_bytes = await file.read()
    result = knowledge_ingest.ingest_pdf(
        title=title,
        file_bytes=file_bytes,
        source=file.filename,
    )
    return IngestResponse(
        document_id=result.document_id,
        chunk_count=result.chunk_count,
        success=result.success,
        error=result.error,
    )


@router.post("/knowledge/search", response_model=SearchResponse)
def search(req: SearchRequest):
    """Semantic search over the knowledge base."""
    results = knowledge_search.search(
        query=req.query,
        top_k=req.top_k,
        min_score=req.min_score,
    )
    return SearchResponse(
        query=req.query,
        results=[
            SearchResultItem(
                score=r.score,
                text=r.text,
                source=r.source,
                title=r.title,
                document_id=r.document_id,
                chunk_index=r.chunk_index,
            )
            for r in results
        ],
        total=len(results),
    )


@router.post("/knowledge/search/hybrid")
def hybrid_knowledge_search(req: SearchRequest):
    """
    Hybrid search: vector similarity + keyword matching combined.
    Better results for queries that mix exact terms and semantic meaning.
    """
    results = hybrid_search.search(
        query=req.query,
        top_k=req.top_k,
        vector_weight=0.7,
    )
    return {
        "query":   req.query,
        "total":   len(results),
        "results": [
            {
                "score":         r.score,
                "vector_score":  r.vector_score,
                "keyword_score": r.keyword_score,
                "text":          r.text,
                "source":        r.source,
            }
            for r in results
        ],
    }


@router.post("/knowledge/rag", response_model=RAGResponse)
def rag(req: RAGRequest):
    """Full RAG: retrieve context + generate answer."""
    result = rag_pipeline.run(
        query=req.query,
        top_k=req.top_k,
        model=req.model,
    )
    return RAGResponse(
        query=result.query,
        answer=result.answer,
        model_used=result.model_used,
        sources=result.sources,
        context_chunks=result.context_chunks,
        success=result.success,
        error=result.error,
    )


@router.get("/knowledge/documents")
def list_documents(skip: int = 0, limit: int = 20):
    """List all ingested documents."""
    db = SessionLocal()
    try:
        docs = (
            db.query(Document)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return {
            "total": db.query(Document).count(),
            "documents": [
                {
                    "id": d.id,
                    "title": d.title,
                    "source": d.source,
                    "doc_type": d.doc_type,
                    "status": d.status,
                    "chunk_count": d.chunk_count,
                    "created_at": d.created_at,
                }
                for d in docs
            ],
        }
    finally:
        db.close()


@router.delete("/knowledge/documents/{doc_id}")
def delete_document(doc_id: int):
    """Delete a document record from PostgreSQL."""
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        db.delete(doc)
        db.commit()
        return {"message": f"Document {doc_id} deleted"}
    finally:
        db.close()
