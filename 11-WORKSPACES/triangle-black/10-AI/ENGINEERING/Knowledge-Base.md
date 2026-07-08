# Knowledge Base Design (V2+)

## Overview

The knowledge base powers all AI features by providing relevant context. It uses Retrieval-Augmented Generation (RAG): documents and structured data are embedded into a vector database, retrieved on query, and provided as context to the LLM.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Knowledge Sources                      │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Internal  │  │ Industry  │  │ Platform  │  │ User     │ │
│  │ Docs      │  │ Standards │  │ Docs      │  │ Guides   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼──────────────┼──────────────┼──────────────┼──────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────┐
│                   Ingestion Pipeline                       │
│                                                           │
│  Chunk ──► Embed ──► Store in pgvector                   │
│  Split    OpenAI       PostgreSQL                          │
│  (256-     text-       (ivfflat index)                    │
│   512      embed-                                         │
│   tokens)  3-small                                        │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                      Retrieval                            │
│                                                           │
│  Query ──► Embed ──► Vector Search ──► Re-rank ──► LLM   │
│  User     OpenAI    (cosine sim)    (cross-     Context   │
│                    + metadata filter  encoder)            │
└──────────────────────────────────────────────────────────┘
```

## Knowledge Sources

### Internal Documentation

| Source | Content | Format | Update Frequency |
|--------|---------|--------|-----------------|
| SOPs | Standard operating procedures | Markdown (processed) | On change |
| Engineering guides | MEP, HVAC, electrical guides | PDF / Markdown | Quarterly |
| Training materials | Onboarding, process training | Markdown / Video transcripts | Quarterly |
| Policy documents | Company policies, compliance | PDF | On change |

### Industry Knowledge

| Source | Content | Format | Update Frequency |
|--------|---------|--------|-----------------|
| Regulatory docs | Egypt building codes, safety regs | PDF | Annually |
| Manufacturer specs | Equipment specifications | PDF / Web scrape | On update |
| Industry standards | ISO, ASTM, ASHRAE | PDF | Annually |
| Supplier catalogs | Parts, pricing, availability | CSV / PDF | Monthly |

### Platform Documentation

| Source | Content | Format |
|--------|---------|--------|
| API docs | Endpoint descriptions, parameters | OpenAPI spec |
| User guides | How-to articles, FAQs | Markdown |
| Release notes | Changelog, new features | Markdown |
| Database schema | Entity descriptions, relationships | Generated docs |

### Historical Data (from Platform)

| Source | Content | Retention |
|--------|---------|-----------|
| Quotations | Approved quotations with line items | 24 months |
| Work orders | Completed work orders with notes | 24 months |
| Projects | Completed projects with outcomes | 36 months |
| Client feedback | Ratings, comments, complaints | 36 months |

## Chunking Strategy

```typescript
// src/ai/knowledge/chunking.service.ts
export class ChunkingService {
  private readonly DEFAULT_CHUNK_SIZE = 512;
  private readonly OVERLAP = 64;

  chunkDocument(document: Document): Chunk[] {
    switch (document.type) {
      case 'markdown':
        return this.chunkMarkdown(document);
      case 'pdf':
        return this.chunkByParagraph(document);
      case 'csv':
        return this.chunkByRow(document);
      case 'code':
        return this.chunkByFunction(document);
      default:
        return this.chunkByToken(document);
    }
  }

  private chunkMarkdown(doc: Document): Chunk[] {
    // Split by headings (##, ###)
    // Preserve heading context in each chunk
    // Include parent headings for hierarchical context
    const sections = doc.content.split(/(?=^#{1,3}\s)/m);
    return sections.map((section, index) => ({
      content: section.trim(),
      metadata: {
        source: doc.source,
        heading: this.extractHeading(section),
        index,
        totalSections: sections.length,
      },
    }));
  }

  private chunkByToken(doc: Document): Chunk[] {
    // Split by approximate token count
    const words = doc.content.split(/\s+/);
    const chunks: Chunk[] = [];

    for (let i = 0; i < words.length; i += this.DEFAULT_CHUNK_SIZE - this.OVERLAP) {
      const chunkWords = words.slice(i, i + this.DEFAULT_CHUNK_SIZE);
      chunks.push({
        content: chunkWords.join(' '),
        metadata: {
          source: doc.source,
          index: chunks.length,
        },
      });
    }

    return chunks;
  }
}
```

## Embedding Strategy

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Model | `text-embedding-3-small` | Best quality/cost ($0.13/1M tokens) |
| Dimensions | 1536 | Default for text-embedding-3-small |
| Batch size | 100 | Optimal throughput for API |
| Rate limit | 3,000 RPM | OpenAI Tier 1 limit |

```typescript
// src/ai/knowledge/embedding.service.ts
@Injectable()
export class EmbeddingService {
  constructor(private openai: OpenAIService) {}

  async embed(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const batches = this.chunkArray(texts, 100);
    const results: number[][] = [];

    for (const batch of batches) {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
      });

      results.push(...response.data.map(d => d.embedding));

      // Rate limiting
      await this.delay(200);
    }

    return results;
  }
}
```

## Vector Storage (pgvector)

### Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base embeddings
CREATE TABLE ai.knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,          -- NULL for global knowledge
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    
    -- Metadata
    source VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL,  -- 'sop', 'guide', 'industry', 'historical'
    chunk_index INTEGER,
    total_chunks INTEGER,
    heading VARCHAR(500),
    tags TEXT[],
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE
);

-- IVFFlat index for approximate nearest neighbor search
CREATE INDEX idx_knowledge_embeddings_vector
    ON ai.knowledge_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Metadata filter index
CREATE INDEX idx_knowledge_tenant_source
    ON ai.knowledge_embeddings (tenant_id, source_type);
```

### Retrieval Query

```typescript
// src/ai/knowledge/retrieval.service.ts
@Injectable()
export class RetrievalService {
  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {}

  async search(
    query: string,
    options: RetrievalOptions,
  ): Promise<KnowledgeChunk[]> {
    // 1. Embed the query
    const queryEmbedding = await this.embeddingService.embed(query);

    // 2. Vector search with metadata filter
    const results = await this.prisma.$queryRaw`
      SELECT
        id,
        chunk_text,
        source,
        source_type,
        heading,
        1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
      FROM ai.knowledge_embeddings
      WHERE
        is_active = TRUE
        AND (tenant_id = ${options.tenantId} OR tenant_id IS NULL)
        AND (${options.sourceTypes}::text[] IS NULL OR source_type = ANY(${options.sourceTypes}))
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT ${options.topK || 5}
    `;

    // 3. Re-rank if needed (cross-encoder in V2)
    if (options.rerank) {
      return this.rerankResults(query, results);
    }

    return results;
  }

  private async rerankResults(
    query: string,
    results: KnowledgeChunk[],
  ): Promise<KnowledgeChunk[]> {
    // Cross-encoder reranking for better accuracy
    // Omitted in V1 — simple vector similarity is sufficient
    return results;
  }
}
```

## RAG Pipeline

```
User Query
    │
    ▼
┌─────────────────────────────┐
│ 1. Query Analysis           │
│    ├── Classify intent      │
│    ├── Extract entities     │
│    └── Identify filters     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 2. Retrieval                 │
│    ├── Embed query           │
│    ├── Vector search (top 5) │
│    ├── Metadata filter       │
│    └── Keyword search (BM25) │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 3. Context Assembly          │
│    ├── Combine results       │
│    ├── Deduplicate           │
│    ├── Order by relevance    │
│    └── Format for LLM        │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 4. LLM Generation            │
│    ├── System prompt         │
│    ├── Retrieved context     │
│    ├── User query            │
│    └── Generate response     │
└─────────────┬───────────────┘
              │
              ▼
        Final Response
```

## Knowledge Base Maintenance

| Task | Frequency | Owner |
|------|-----------|-------|
| Re-embed changed documents | On change | Automated |
| Full re-index | Monthly | DevOps |
| Remove stale embeddings | Monthly | DevOps |
| Review retrieval quality | Weekly | AI Lead |
| Add new knowledge sources | As needed | Domain experts |
| Update chunking strategy | Quarterly | AI Lead |

## Metrics & Monitoring

| Metric | Target | Measurement |
|--------|--------|-------------|
| Retrieval precision@5 | > 80% | Human rating of retrieved chunks |
| Retrieval recall@5 | > 70% | Percentage of relevant chunks retrieved |
| Embedding pipeline latency | < 5s per document | CloudWatch / LangSmith |
| Query latency (p95) | < 2s | Application monitoring |
| Embedding API cost | < $50/month | OpenAI API dashboard |
| Vector DB size | < 10 GB | PostgreSQL monitoring |
| Index build time | < 30 min | Cron job monitoring |

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Cross-tenant data leakage | Tenant_id filter on every query; NULL tenant = global knowledge only |
| Sensitive document exposure | Documents classified by sensitivity level; retrieval restricted by user role |
| Embedding inversion | Low risk — embeddings cannot be reversed to original text |
| Data poisoning | Document version tracking; re-embed only from trusted sources |
| API key exposure | OpenAI keys in environment variables, never logged |
