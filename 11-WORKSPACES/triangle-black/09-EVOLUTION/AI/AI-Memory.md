# 03 — AI Memory

> Memory system for persistent AI context.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Knowledge-Graph.md | Structured knowledge |
| Phase 10 — RAG.md | Retrieval pipeline |

## Memory Architecture

```
┌──────────────────────────────────────────┐
│               MEMORY STORE                │
│                                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Working  │  │ Episode │  │ Semantic│  │
│  │ Memory   │  │ Memory  │  │ Memory  │  │
│  ├─────────┤  ├─────────┤  ├─────────┤  │
│  │ Current  │  │ Past    │  │ Domain   │  │
│  │ inter-   │  │ inter-  │  │ facts,   │  │
│  │ action   │  │ actions │  │ rules    │  │
│  └─────────┘  └─────────┘  └─────────┘  │
└──────────────────────────────────────────┘
```

## Memory Types

| Type | Scope | Duration | Backend | 
|------|-------|----------|---------|
| Working memory | Single session | Session | In-memory |
| Episode memory | User interactions | Days-weeks | Vector DB |
| Semantic memory | Domain knowledge | Permanent | Graph DB |
| User profile | User preferences | Permanent | PostgreSQL |
| Skill memory | Agent capabilities | Permanent | Vector DB |

## Memory Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| Store | Save to memory | "User prefers Arabic" |
| Retrieve | Get relevant memory | "What did user say about X?" |
| Update | Modify existing | "User no longer uses feature Y" |
| Forget | Remove or expire | "Clean session data" |
| Consolidate | Short-term → long-term | "Summarize weekly interactions" |

## Context Assembly

```
User Query
     │
     ▼
Assemble Context:
├── User profile (permanent)
├── Working memory (session)
├── Episode memory (recent history)
├── Semantic memory (domain facts)
├── Knowledge graph (entity relations)
└── RAG results (documentation)
     │
     ▼
   Prompt ──► LLM ──► Response
```

## Memory Metrics

| Metric | Target |
|--------|--------|
| Memory retrieval accuracy | > 90% |
| Memory storage latency | < 50ms |
| Memory retrieval latency | < 100ms |
| Context window utilization | < 80% |
| Memory consolidation cadence | Daily |
