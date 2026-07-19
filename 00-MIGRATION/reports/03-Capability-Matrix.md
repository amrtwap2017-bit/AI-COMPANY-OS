# 03 — Capability Matrix

| Capability | Legacy | Archive | Enterprise | Recommendation |
|-----------|--------|---------|------------|----------------|
| Agent Runtime | ✅ 12 agents | ✅ orchestrator | ❌ | MIGRATE from Legacy |
| DAG Engine | ✅ full | ❌ | ❌ | MIGRATE from Legacy |
| Decision Engine | ✅ full | ❌ | ❌ | MIGRATE from Legacy |
| Evaluation/Benchmarks | ✅ full | ✅ gate+service | ❌ | MIGRATE Legacy + Archive |
| Self-Improvement | ✅ engine | ✅ engine | ❌ | MIGRATE from Legacy |
| Reflection Engine | ✅ full | ❌ | ❌ | MIGRATE from Legacy |
| Learning Engine | ✅ full | ❌ | ❌ | MIGRATE from Legacy |
| Collaboration Engine | ✅ full | ❌ | ❌ | MIGRATE from Legacy |
| Knowledge Graph | ✅ builder+extractor+query | ✅ graph_models+signals | ❌ | MERGE Legacy + Archive |
| Document Parsers | ✅ docx+image+xlsx | ❌ | ❌ | MIGRATE from Legacy |
| Workflow Engine | ✅ full | ❌ | ✅ workflow pages | MERGE |
| Analytics Engine | ✅ background+cost | ❌ | ✅ analytics pages | MERGE |
| Context Engine | ✅ assembler+ranker | ✅ RAG+sprint_loader | ✅ AI contexts | MERGE ALL |
| Memory | ✅ Qdrant vector | ✅ service+models | ✅ ChromaDB | MERGE — pick Qdrant |
| Tools (30+) | ✅ all tools | ✅ MCP tools | ❌ | MIGRATE Legacy + Archive |
| Prompt Library | ✅ 16 prompts | ❌ | ✅ prompt files | MERGE |
| GitHub Integration | ✅ | ❌ | ❌ | MIGRATE from Legacy |
| Slack Integration | ✅ | ❌ | ❌ | MIGRATE from Legacy |
| MCP Gateway | ❌ | ✅ registry+policy+limiter | ❌ | MIGRATE from Archive |
| Builder Engine | ❌ | ✅ executor+planner | ❌ | MIGRATE from Archive |
| Planning Engine | ❌ | ✅ engine | ❌ | MIGRATE from Archive |
| Workspace Explorer | ❌ | ✅ explorer+planner | ❌ | MIGRATE from Archive |
| Developer Portal | ❌ | ✅ orchestrator UI | ❌ | MIGRATE from Archive |
| Hotel Engineering Backend | ❌ | ❌ | ✅ 40+ modules | KEEP — Enterprise only |
| Enterprise Portal UI | ❌ | ❌ | ✅ 200+ pages | KEEP — Enterprise only |
| Multi-tenancy | ❌ | ❌ | ✅ hotel isolation | KEEP — Enterprise only |
| Client Portal | ❌ | ❌ | ✅ | KEEP |
| Admin Portal | ❌ | ❌ | ✅ | KEEP |
| Vendor Portal | ❌ | ❌ | ✅ | KEEP |
| DDD Documentation | ❌ | ❌ | ✅ 800+ docs | KEEP |
| AI Context Packs | ❌ | ❌ | ✅ | KEEP |
| Rate Limiting | ✅ slowapi | ❌ | ❌ | MIGRATE from Legacy |
| Security Headers | ✅ | ❌ | ❌ | MIGRATE from Legacy |
| Task Queue | ✅ | ❌ | ❌ | MIGRATE from Legacy |
| Scheduler | ✅ APScheduler | ❌ | ❌ | MIGRATE from Legacy |
| Request ID Tracking | ✅ | ❌ | ❌ | MIGRATE from Legacy |
| 15-page AI Dashboard | ✅ | ❌ | ❌ | MIGRATE from Legacy |
| Benchmark Runner | ✅ | ✅ | ❌ | MIGRATE from Legacy |
| Prometheus | ❌ | ✅ otel+metrics | ✅ prometheus.yml | MERGE Archive + Enterprise |
| Docker Compose | ✅ prod | ✅ infra compose | ✅ production | MERGE ALL |
