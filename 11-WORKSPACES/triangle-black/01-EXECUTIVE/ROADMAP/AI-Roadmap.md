# AI Roadmap — Capability Evolution

**Theme:** From automation to autonomy
**Objective:** Progressively evolve AI capabilities from basic automation to autonomous operational decision-making across four maturity levels.

## AI Maturity Model

```
Level 1: Assisted   ───→   Level 2: Augmented   ───→   Level 3: Automated   ───→   Level 4: Autonomous
   (V1-V1.5)                  (V2)                       (V2-V3)                     (V3+)
```

## Level 1 — Assisted (V1-V1.5)
**Theme:** AI helps humans work faster
**Timeframe:** Months 1-8

| Capability | Description |
|------------|-------------|
| Smart Work Order Categorization | AI suggests categories and priorities based on request text |
| AI Report Narratives | Weekly operational summary narrative generated from data |
| Basic Anomaly Detection | Flag outliers in spend, work order volume, SLA breaches |
| Smart Search | Natural language search across records |

**Human in the loop:** Required for all decisions
**Data dependency:** Module-level data sufficient

## Level 2 — Augmented (V2)
**Theme:** AI provides recommendations
**Timeframe:** Months 6-14

| Capability | Description |
|------------|-------------|
| Predictive Maintenance | Failure probability scoring based on asset history |
| Spend Anomaly Detection | Flag unusual pricing, duplicate payments, category drift |
| Supplier Health Scoring | ML-driven composite score from delivery, quality, compliance |
| Maintenance Compliance Prediction | Forecast end-of-month compliance rate |
| Natural Language Queries | "Show overdue HVAC work orders" |
| Automated Report Generation | Monthly executive reports with AI narrative |

**Human in the loop:** Review recommendations before action
**Data dependency:** 3-6 months of operational data per property

## Level 3 — Automated (V2-V3)
**Theme:** AI takes routine actions
**Timeframe:** Months 12-20

| Capability | Description |
|------------|-------------|
| Automated Procurement Reorder | Auto-generate POs for recurring consumables within budget |
| Predictive Maintenance Scheduling | AI adjusts PM schedules based on asset condition data |
| Autonomous Escalation | AI decides when to escalate issues and to whom |
| AI Supplier Matching | Auto-match RFQs to best-fit suppliers |
| Cross-Property Benchmarking | AI identifies best practices from top-performing properties |
| Anomaly Resolution | AI resolves common anomalies without human intervention |

**Human in the loop:** Exceptions only
**Data dependency:** 12+ months of data, multiple properties

## Level 4 — Autonomous (V3+)
**Theme:** AI makes operational decisions
**Timeframe:** Months 20+

| Capability | Description |
|------------|-------------|
| Autonomous Procurement Agent | AI manages full procurement lifecycle for non-critical categories |
| Predictive Operations Center | AI forecasts operational issues and pre-positions resources |
| Self-Optimizing Maintenance Schedules | AI continuously optimizes PM schedule based on cost, risk, and resources |
| AI Operational Partner | Natural language interface manages daily operations conversationally |
| Market Intelligence Engine | AI provides real-time market intelligence and recommendations |

**Human in the loop:** Strategic oversight only
**Data dependency:** 2+ years of data, 50+ properties in network

## AI Technology Stack Evolution
| Layer | Level 1-2 | Level 3 | Level 4 |
|-------|-----------|---------|---------|
| Models | GPT-4 / Claude API, Embeddings | Fine-tuned domain models | Specialized agent models |
| Data | Structured platform data | Historical + operational | Multi-tenant + external |
| Architecture | Prompt engineering, RAG | Fine-tuned LLMs, ML pipelines | Multi-agent system |
| Infrastructure | Cloud API calls | Dedicated inference | On-premise option |
| Training | Zero-shot, few-shot | Fine-tuned on domain data | Continuous learning |

## Principles
1. **AI serves the operational partnership** — not the other way around
2. **Every AI capability has a measurable KPI** — no AI for AI's sake
3. **Human oversight decreases as trust increases** — never fully removed
4. **Data quality is a prerequisite** — AI is only as good as the data it trains on
5. **Client data privacy is inviolable** — no cross-client training without explicit consent
