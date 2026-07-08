# 03 — Prompt Governance

> Governance framework for AI prompts.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — AI-Engineering.md | AI engineering standards |
| Phase 10 — AI-Governance.md | AI governance framework |

## Prompt Lifecycle

```
Draft ──► Review ──► Test ──► Version ──► Deploy ──► Monitor
  │        │         │         │           │           │
Write   Peer      Against   Semantic  To prod   Track
prompt  review    eval      version             performance
                 dataset                         + drift
```

## Prompt Library Structure

```
prompts/
├── copilots/
│   ├── support-copilot/
│   │   ├── v1.0.yaml
│   │   ├── v1.1.yaml
│   │   └── v2.0.yaml
│   ├── ops-copilot/
│   └── analytics-copilot/
├── system/
│   ├── orchestrator/
│   └── guardrails/
└── shared/
    ├── persona-hospitality.yaml
    ├── tone-professional.yaml
    └── safety.yaml
```

## Prompt Template

```yaml
# Metadata
version: 1.0.0
created: 2026-07-02
author: AI Engineering
intent: "Support ticket resolution"
agent: support-copilot

# System prompt
system: |
  You are a hospitality support assistant for Triangle Black.
  Be helpful, concise, and professional.
  Always verify information before responding.
  If unsure, ask for clarification.

# Input schema
inputs:
  - ticket_description
  - customer_tier
  - knowledge_base_context

# Output schema
outputs:
  - response_body
  - resolution_type: automated | escalated
  - confidence_score: 0-1

# Safety guardrails
guardrails:
  - Do not share internal data
  - Do not make promises you cannot verify
  - Escalate to human if confidence < 0.7
```

## Prompt Review Process

| Stage | Reviewer | Criteria |
|-------|----------|----------|
| Draft | AI Engineer | Intent clear, complete |
| Security | Security Lead | No prompt injection vectors |
| Safety | Ethics Review | No harmful outputs possible |
| Domain | Domain Expert | Hospitality context accurate |
| Final | CTO | Approval for deployment |

## Prompt Metrics

| Metric | Target |
|--------|--------|
| Prompt quality score | > 8/10 |
| Output consistency | > 90% (same input → same output) |
| Hallucination rate | < 2% |
| Prompt injection success rate | < 0.1% |
| Version drift detection | Automated |
