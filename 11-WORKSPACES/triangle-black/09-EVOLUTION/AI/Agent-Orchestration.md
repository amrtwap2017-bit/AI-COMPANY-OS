# 03 — Agent Orchestration

> Framework for orchestrating AI agents.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — New-Copilots.md | Agent definitions |
| Phase 4 — AI-Engineering.md | Engineering standards |

## Orchestration Architecture

```
User Request
     │
     ▼
┌─────────────────────────────────────────────────┐
│           ORCHESTRATOR AGENT                     │
│  ● Route to correct agent                        │
│  ● Decompose complex requests                    │
│  ● Merge multi-agent responses                   │
│  ● Handle errors, fallbacks                      │
└─────────────────────────────────────────────────┘
     │
     ├──► Support Agent ──► KB, Tickets
     ├──► Ops Agent ──► Workflows, Approvals
     ├──► Analytics Agent ──► Data Warehouse
     ├──► Executive Agent ──► All Sources
     └──► (Future agents) ──► ...
```

## Orchestration Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| Router | Single agent based on intent | Simple requests |
| Fan-out | Decompose to multiple agents, merge | Complex queries |
| Chain | Sequential agent execution | Multi-step workflows |
| Consensus | Multiple agents vote on answer | Critical decisions |
| Human-in-loop | Agent proposes, human approves | Sensitive actions |

## Agent Communication Protocol

- Input: Structured context with domain, history, user_id
- Output: Action (tool call, response, escalation)
- Context window: Managed, trimmed to max tokens
- Tool registry: Central list of available tools per agent
- Rate limiting: Per-agent, per-user throttling

## Orchestration Metrics

| Metric | Target |
|--------|--------|
| Intent recognition accuracy | > 95% |
| Correct agent routing | > 98% |
| Multi-agent merge accuracy | > 90% |
| Orchestration latency | < 500ms |
| Fallback to human rate | < 10% |
