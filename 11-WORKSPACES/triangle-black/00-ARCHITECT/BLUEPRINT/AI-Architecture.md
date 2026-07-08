# Phase 02 — AI Architecture

> AI architecture for Triangle Black, focused on rule-based agents in V1.

## AI Strategy

| Horizon | Approach | Timeline | Investment |
|---------|----------|----------|------------|
| V1 | Rule-based agents | Current | Zero ML cost |
| V2 | ML models (predictive) | Year 2 | 10-20% of engineering |
| V3 | Advanced AI (NLP, vision) | Year 3+ | 30%+ of engineering |

## V1 AI Capabilities

| Agent | Domain | Input | Output | Rules |
|-------|--------|-------|--------|-------|
| Lead Scorer | Commercial | Lead attributes (source, company size, budget, timeline) | Score (0-100), segment (Hot/Warm/Cold) | Explicit rules from historical conversion patterns |
| Margin Validator | Commercial | Quotation line items, costs | Margin analysis, warnings | Min 15% margin, configurable thresholds |
| NCR Classifier | Project Delivery | NCR description, category | Severity (Critical/Major/Minor), recommended actions | Keyword matching + severity matrix |
| SLA Monitor | Maintenance | Service request, SLA terms | Priority, breach risk | SLA rule engine |

## Agent Architecture

```
Input (API) → Agent Router → Rule Engine → Output (API)
                 │
                 ▼
           Audit Store
```

- **Agent Router**: Selects rule engine based on agent type
- **Rule Engine**: Evaluates decision trees / lookup tables / scorecards
- **Audit Store**: Logs all agent decisions for traceability

## V2 AI Roadmap

| Capability | Timeline | Approach |
|------------|----------|----------|
| Lead scoring (ML) | V2 | Gradient boosting on historical data |
| Quotation pricing optimization | V2 | Price elasticity model |
| Maintenance prediction | V2 | Time-series failure prediction |
| Document classification | V2 | NLP-based document auto-tagging |

## AI Engineering Standards

- All agents are idempotent (same inputs = same outputs)
- All agent decisions are audited with input/output/confidence
- Configuration-driven rule sets (no hardcoded rules)
- Feature flags enable/disable agents per tenant

## Related Documents

- [AI Agent Architecture](../PHASE-03-DIGITAL-TWIN-DESIGN/AI-Agent-Architecture.md)
- `10-AI-COPILOTS/` in Phase 6 — Detailed specifications
- `17-AI-CODING/` in Phase 4 — AI coding standards
