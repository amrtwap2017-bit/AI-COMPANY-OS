# AI, Knowledge and Digital Twin Inventory

## Active code artifacts

| Area | Current artifacts |
|---|---|
| Feature AI | `ai_assistant` (dispatch, document, analytics, supply, signals/cost engines), `ai_mentor`, `ai_scheduling`, `ai_signals`, `predictive_maintenance`. |
| Knowledge/graph | `knowledge_graph` router, Qdrant checks, local Chroma codebase indexer. |
| Developer agent | `agent/core/llm.py`, `agent/memory/indexer.py`, `agent/tools/executor.py`, CLI and local persistent Chroma store. |
| Documentation | `10-AI` contains strategy, prompt, governance, context and mapping documentation. |

## Provider, model, memory and prompt inventory

- Direct local Ollama URLs/models are embedded in feature routers and developer tooling.
- Chroma is used for local repository indexing; Qdrant is queried by the knowledge graph code.
- Prompt documentation describes a registry, but no product-level runtime prompt registry, evaluation suite, cost ledger, tenant policy engine or model gateway is active.
- AI calls and memories do not yet uniformly carry organization scope, evidence provenance, classification, retention or approval policy.

## Digital Twin inventory

Digital twin and knowledge graph endpoints expose relationship/health-oriented projections. There is no canonical outbox, graph projection service, ontology registry, entity-resolution policy, replay/reconciliation process or tenant-partitioned graph governance. The blueprint defines the target without replacing existing endpoints.

## Required registry records

Every AI agent, tool, prompt, model, knowledge collection, vector index, graph projection and memory class must register: owner, tenant scope, data classification, workflow, access policy, retention, cost center, evaluation set, human escalation, audit event and kill switch.

