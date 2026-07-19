"""
Knowledge Ingest
─────────────────────────────────────────────────────
Full ingestion pipeline:
  1. Receive raw text + metadata
  2. Chunk the text
  3. Embed each chunk
  4. Store vectors in Qdrant
  5. Store metadata in PostgreSQL
"""

import time
from dataclasses import dataclass

from app.knowledge.chunker import TextChunker
from app.knowledge.embedder import Embedder
from app.vector.qdrant import vector_service
from app.db.database import SessionLocal
from app.models.db.document import Document
from app.models.db.knowledge_entry import KnowledgeEntry

KNOWLEDGE_COLLECTION = "knowledge"
EMBED_DIMENSIONS = 1024


@dataclass
class IngestResult:
    document_id: int
    chunk_count: int
    success: bool
    error: str | None = None


class KnowledgeIngest:

    def __init__(self):
        self.chunker = TextChunker(chunk_size=400, overlap=80)
        self.embedder = Embedder()

    def setup(self) -> None:
        """Ensure the Qdrant collection exists."""
        vector_service.ensure_collection(
            KNOWLEDGE_COLLECTION,
            size=EMBED_DIMENSIONS,
        )

    def ingest_text(
        self,
        title: str,
        content: str,
        source: str = "manual",
        doc_type: str = "text",
    ) -> IngestResult:
        """
        Full pipeline: text → chunks → embeddings → storage.
        """
        db = SessionLocal()

        try:
            # ── 1. Save document record ──────────────
            doc = Document(
                title=title,
                source=source,
                content=content,
                doc_type=doc_type,
                status="processing",
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)

            # ── 2. Chunk ─────────────────────────────
            chunks = self.chunker.chunk_by_paragraph(content)

            if not chunks:
                doc.status = "failed"
                db.commit()
                return IngestResult(
                    document_id=doc.id,
                    chunk_count=0,
                    success=False,
                    error="No chunks generated",
                )

            # ── 3. Embed + store each chunk ──────────
            base_id = int(time.time() * 1000)

            for chunk in chunks:
                # Embed
                vector = self.embedder.embed(chunk.content)

                # Store in Qdrant
                qdrant_id = base_id + chunk.index
                vector_service.upsert(
                    collection=KNOWLEDGE_COLLECTION,
                    id=qdrant_id,
                    vector=vector,
                    payload={
                        "text": chunk.content,
                        "source": source,
                        "title": title,
                        "document_id": doc.id,
                        "chunk_index": chunk.index,
                        "word_count": chunk.word_count,
                    },
                )

                # Store metadata in PostgreSQL
                entry = KnowledgeEntry(
                    document_id=doc.id,
                    content=chunk.content,
                    source=source,
                    chunk_index=chunk.index,
                    qdrant_id=qdrant_id,
                )
                db.add(entry)

            # ── 4. Mark document as indexed ──────────
            doc.status = "indexed"
            doc.chunk_count = len(chunks)
            db.commit()

            return IngestResult(
                document_id=doc.id,
                chunk_count=len(chunks),
                success=True,
            )

        except Exception as e:
            if doc:
                doc.status = "failed"
                db.commit()
            return IngestResult(
                document_id=0,
                chunk_count=0,
                success=False,
                error=str(e),
            )

        finally:
            db.close()

    def ingest_pdf(self, title: str, file_bytes: bytes, source: str = "upload") -> IngestResult:
        """
        Extract text from PDF then run standard ingest.
        """
        try:
            import io
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(file_bytes))
            pages = [page.extract_text() or "" for page in reader.pages]
            full_text = "\n\n".join(pages)

            return self.ingest_text(
                title=title,
                content=full_text,
                source=source,
                doc_type="pdf",
            )

        except Exception as e:
            return IngestResult(
                document_id=0,
                chunk_count=0,
                success=False,
                error=str(e),
            )


    def ingest_document(
        self,
        file_bytes: bytes,
        filename:   str,
        title:      str | None = None,
        source:     str = "upload",
    ) -> IngestResult:
        """
        Auto-detect document type by filename extension and ingest.
        Supports: .docx, .xlsx, .xls, .png, .jpg, .jpeg, .tiff, .bmp
        For .pdf use ingest_pdf() which already exists.
        """
        from app.knowledge.parsers.registry import parser_registry

        parse_result = parser_registry.parse(file_bytes, filename)

        if not parse_result.success:
            return IngestResult(
                document_id=0,
                chunk_count=0,
                success=False,
                error=parse_result.error,
            )

        if parse_result.is_empty:
            return IngestResult(
                document_id=0,
                chunk_count=0,
                success=False,
                error="Parsed document contains no text content",
            )

        return self.ingest_text(
            title=title or parse_result.title or filename,
            content=parse_result.content,
            source=source or filename,
            doc_type=parse_result.doc_type,
        )


knowledge_ingest = KnowledgeIngest()
