# 05 — AI Automation

> AI-driven automation of business processes.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — New-Copilots.md | AI copilots |
| Phase 10 — Workflow-Automation.md | Workflow engine |

## AI Automation Use Cases

| Use Case | Process | AI Component | Automation Level |
|----------|---------|-------------|-----------------|
| Ticket auto-response | Support | Support copilot | Auto-reply common issues |
| Invoice data extraction | Finance | Document AI | Auto-extract + enter |
| PO matching | Procurement | Rule + ML | Auto-match 3-way |
| Categorize maintenance | Maintenance | Classification | Auto-categorize + route |
| Summarize guest feedback | Operations | Text AI | Auto-summarize |
| Predict PO approval | Procurement | ML model | Pre-approve low-risk |

## Decision Automation

| Decision | AI Role | Human Oversight | Automation Level |
|----------|---------|-----------------|-----------------|
| Support ticket priority | Classify urgency | Review P1 only | 90% auto |
| PO approval (low value) | Auto-approve if < threshold | Quarterly audit | 100% auto |
| PO approval (high value) | Recommend yes/no | Manager approves | 50% auto |
| Maintenance urgency | Predict severity | Supervisor reviews | 75% auto |
| Room pricing | Recommend rate | Revenue manager reviews | 80% auto |

## AI Automation Architecture

```
Trigger
  │
  ▼
AI Decision Engine
  ├── Rule-based (low risk, known patterns)
  ├── ML model (medium risk, patterns)
  └── LLM (complex, uncertain)
       │
       ▼
   Confidence > Threshold?
  ├── YES → Execute automatically
  └── NO → Recommend to human
```

## Automation Coverage Targets

| Wave | Processes Automated | Automation % |
|------|-------------------|--------------|
| H1 | 10 processes | 60% auto |
| H2 | 25 processes | 75% auto |
| H3 | 50 processes | 85% auto |
| H4 | 100+ processes | 95% auto |
