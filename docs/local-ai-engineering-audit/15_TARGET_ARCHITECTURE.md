# 15 — TARGET ARCHITECTURE

## Layers

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| L0 | Constitution | Non-negotiable rules |
| L1 | Project Intelligence | Repository + architecture map |
| L2 | Knowledge Engine | Document index + retrieval |
| L3 | Planning Engine | Roadmap → Epic → Sprint → Task |
| L4 | Context Engine | Task-specific context builder |
| L5 | Execution Engine | OpenCode + Qwen implementation |
| L6 | Verification Engine | Lint, type, test, build, security |
| L7 | Review Engine | Architecture + security + code |
| L8 | Memory Engine | Decisions, failures, lessons |
| L9 | Git Controller | Branch, diff, commit, checkpoint |

## Context Loading Strategy

LEVEL 0 — Agent Constitution (always loaded, ~500 tokens)
LEVEL 1 — Project Summary (always loaded, ~300 tokens)
LEVEL 2 — Current Architecture (task-relevant sections)
LEVEL 3 — Current Sprint (when in sprint mode)
LEVEL 4 — Current Task (always loaded when executing)
LEVEL 5 — Relevant Files (retrieved by relevance)
LEVEL 6 — Tests (loaded during verify phase)
LEVEL 7 — Historical Memory (loaded on demand)

## Human Authority

The human architect retains final authority over:
- Architecture decisions
- Product decisions
- Security exceptions
- Scope changes
- Destructive operations
- Production deployment
