# 03 — RAG (Retrieval-Augmented Generation)

> RAG pipeline for knowledge-enhanced AI responses.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 3 — AI-Agent-Architecture.md | AI architecture |
| Phase 4 — AI-Engineering.md | AI engineering |

## RAG Architecture

```
User Query
     │
     ▼
┌──────────┐
│ Embedding │──► Vector DB
│  Model    │     (Pinecone/Qdrant)
└──────────┘
     │
     ▼
┌──────────┐
│ Retriever │──► Top-K relevant chunks
│(hybrid)  │
└──────────┘
     │
     ▼
┌──────────┐
│ Reranker │──► Re-ranked by relevance
└──────────┘
     │
     ▼
┌──────────┐
│ Context  │──► System prompt + context + query
│ Builder  │
└──────────┘
     │
     ▼
┌──────────┐
│   LLM    │──► Grounded response
└──────────┘
```

## Knowledge Sources

| Source | Format | Indexing | Update Frequency |
|--------|--------|----------|------------------|
| Documentation | Markdown | Full content | On change |
| Support KB | Markdown | Full content | Weekly |
| SOPs | Markdown | Full content | On change |
| API docs | OpenAPI | Endpoint descriptions | On change |
| Code comments | Inline docs | Selected | On release |
| Customer FAQs | Structured | Q&A pairs | Monthly |

## Retrieval Strategy

| Strategy | When | Description |
|----------|------|-------------|
| Semantic search | Default | Vector similarity search |
| Keyword search | Code, IDs | BM25 full-text search |
| Hybrid search | Best results | Combination of both |
| Parent retrieval | Long docs | Retrieve child chunks, return parent |

## Chunking Strategy

| Content Type | Chunk Size | Overlap |
|-------------|-----------|---------|
| Documentation | 500 tokens | 50 tokens |
| Code examples | Function-level | — |
| FAQ | Per-Q&A | — |
| SOPs | Per-step | — |

## RAG Pipeline Metrics

| Metric | Target |
|--------|--------|
| Retrieval precision | > 90% |
| Retrieval recall | > 85% |
| Grounding accuracy | > 95% |
| End-to-end latency | < 2s |
| Chunk quality score | > 8/10 |
