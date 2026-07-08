# Phase 06 — AI Copilots

> Rule-based AI agents for decision support across domains.

## Agent Inventory

| Agent | Domain | Input | Output | Rules |
|-------|--------|-------|--------|-------|
| Lead Scorer | Commercial | Lead attributes | Score (0-100), segment | 12 rules |
| Margin Validator | Commercial | Quotation lines | Pass/Warn/Block | 8 rules |
| NCR Classifier | Project | NCR description | Severity + Category | 15 rules |
| SLA Monitor | Maintenance | Request + SLA | Priority, breach risk | 6 rules |

## Agent Architecture

All agents use a deterministic rule engine with JSON-based rule definitions stored in the database. Each agent follows a uniform contract:

```typescript
interface AgentInput {
  type: string;
  data: Record<string, unknown>;
  config?: Record<string, unknown>;
}

interface AgentOutput {
  score?: number;
  label: string;
  confidence: number;
  reasons: string[];
  metadata: Record<string, unknown>;
}
```

## Location

`10-AI-COPILOTS/` — 20 files following the standard template.

## V2 Roadmap

- ML-based lead scoring (gradient boosting)
- Quotation price optimization
- Maintenance failure prediction
- Document auto-classification

See also: [AI Agent Architecture](../PHASE-03-DIGITAL-TWIN-DESIGN/AI-Agent-Architecture.md)
