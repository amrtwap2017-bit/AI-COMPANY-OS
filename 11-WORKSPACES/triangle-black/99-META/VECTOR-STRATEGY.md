# Vector Strategy — Triangle Black Knowledge Repository

## Vectorization Approach

| Layer | Path | Strategy | Chunk Size | Overlap | Metadata | Collection Name |
|-------|------|----------|------------|---------|----------|-----------------|
| Executive | `01-EXECUTIVE/` | Full | 512 | 64 | layer=executive, type=strategic | triangle-executive |
| Governance | `02-GOVERNANCE/` | Hybrid | 512 | 64 | layer=governance, type=decision | triangle-governance |
| Business | `03-BUSINESS/` | Full | 1024 | 128 | layer=business, type=domain | triangle-business |
| Design | `04-DESIGN/` | Hybrid | 768 | 96 | layer=design, type=technical | triangle-design |
| Engineering | `05-ENGINEERING/` | Hybrid | 512 | 64 | layer=engineering, type=standard | triangle-engineering |
| Domains | `06-DOMAINS/` | Full | 1024 | 128 | layer=domain, type=business | triangle-domains |
| Integration | `07-INTEGRATION/` | Hybrid | 512 | 64 | layer=integration, type=contract | triangle-integration |
| Operations | `08-OPERATIONS/` | Hybrid | 768 | 96 | layer=operations, type=process | triangle-operations |
| Evolution | `09-EVOLUTION/` | Full | 1024 | 128 | layer=evolution, type=strategic | triangle-evolution |
| AI | `10-AI/` | Full | 1024 | 128 | layer=ai, type=delivery | triangle-ai |
| Knowledge | `11-KNOWLEDGE/` | Full | 512 | 64 | layer=knowledge, type=system | triangle-knowledge |
| Shared | `12-SHARED/` | Hybrid | 512 | 64 | layer=shared, type=template | triangle-shared |
| Archive | `13-ARCHIVE/` | None | — | — | — | — |
| Meta | `99-META/` | Hybrid | 512 | 64 | layer=meta, type=index | triangle-meta |
| Architect | `00-ARCHITECT/` | Hybrid | 512 | 64 | layer=architect, type=principle | triangle-architect |

## Collection Strategy

| Collection | Priority | Embedding Model | Index Type | Filters |
|-----------|----------|-----------------|------------|---------|
| triangle-executive | High | text-embedding-3-small | ivfflat | layer, type |
| triangle-business | High | text-embedding-3-small | ivfflat | layer, type |
| triangle-domains | Critical | text-embedding-3-large | ivfflat | layer, domain |
| triangle-engineering | High | text-embedding-3-small | ivfflat | layer, type |
| triangle-ai | Critical | text-embedding-3-large | ivfflat | layer, type |
| triangle-evolution | Medium | text-embedding-3-small | ivfflat | layer |
| triangle-architect | High | text-embedding-3-small | ivfflat | layer |
| triangle-operations | Medium | text-embedding-3-small | ivfflat | layer |
| triangle-design | High | text-embedding-3-small | ivfflat | layer |
| triangle-integration | Medium | text-embedding-3-small | ivfflat | layer |

## Retrieval Strategy

1. **Semantic search**: Primary retrieval using cosine similarity on embeddings
2. **Keyword search**: BM25 fallback for exact matches
3. **Hybrid**: Weighted combination (0.7 semantic + 0.3 keyword)
4. **Metadata filtering**: Pre-filter by layer, type, domain before vector search
5. **Reranking**: Cross-encoder reranking for top-20 results

## Chunk Strategy Guidelines

- **Strategic docs** (Executive, Evolution): 512 tokens — precise, conceptual
- **Domain docs** (Business, Domains): 1024 tokens — preserve context boundaries
- **Technical docs** (Engineering, Design): 768 tokens — balanced
- **AI docs** (AI, Knowledge): 1024 tokens — preserve prompt/agent context
