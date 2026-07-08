# AI Strategy

## Overview

Triangle Black's AI strategy follows a phased approach: observe first, then suggest, then execute, then autonomous. Each phase builds on the previous, with clear success criteria before advancing.

## The Four Levels

```
Level 1: OBSERVE                       Level 2: SUGGEST
┌─────────────────────────┐           ┌─────────────────────────┐
│ AI monitors all data     │           │ AI monitors +           │
│ and surfaces patterns,   │──►        │ recommends actions.     │
│ anomalies, trends.       │           │ Human reviews and       │
│ No actions taken.        │           │ approves/rejects.       │
└─────────────────────────┘           └─────────────────────────┘
                                                 │
                                                 ▼
Level 4: AUTONOMOUS                   Level 3: EXECUTE
┌─────────────────────────┐           ┌─────────────────────────┐
│ AI operates within       │           │ AI executes approved    │
│ defined boundaries       │◄──        │ actions within defined  │
│ without human approval.  │           │ scope. Human sets       │
│ Human override always.   │           │ boundaries and reviews. │
└─────────────────────────┘           └─────────────────────────┘
```

## Phase 0: Foundation (V1 — No AI)

**Duration:** Months 1-6

**Goals:**
- Build the core platform with clean, structured data
- Establish audit logging and data pipelines
- Define metrics for AI success (accuracy, time saved, user satisfaction)
- Research and prototype embedding pipelines
- No AI features in production

**Deliverables:**
- Complete data schema with all entities properly normalized
- Audit logs capturing all user actions
- Basic analytics/reporting for manual insights
- Technology selection and prototyping of AI stack (see below)

## Phase 1: Observe (V1.5)

**Duration:** Months 6-9

**Prerequisites:** 6 months of clean production data, embedding pipeline, basic RAG infrastructure.

**Capabilities:**

| Feature | Description | Value |
|---------|-------------|-------|
| Anomaly detection | Identify unusual patterns in reservations, procurement, maintenance | Early warning for operational issues |
| Trend analysis | Surface emerging trends in service requests, inventory usage | Data-driven decisions |
| Knowledge retrieval | Answer questions from internal knowledge base | Reduced search time |
| Dashboard insights | AI-generated summaries of key metrics | Faster decision-making |

**How it works:**
```
Data ──► Embedding Pipeline ──► Vector DB
                                  │
User Query ──► RAG ──► LLM ──► Response (read-only)
```

**Success criteria:**
- > 80% accuracy on knowledge retrieval (measured by human raters)
- Anomaly detection precision > 70% (measured by false positive rate)
- User engagement: > 30% of users interact with AI features weekly

## Phase 2: Suggest (V2)

**Duration:** Months 9-15

**Prerequisites:** Phase 1 success criteria met, user trust established, feedback loops working.

**Capabilities:**

| Feature | Description | Autonomy Level |
|---------|-------------|----------------|
| Quotation suggestions | AI proposes quotation line items based on historical data | Suggest (human approves) |
| Maintenance prioritization | AI suggests work order priority based on urgency/impact | Suggest |
| Procurement recommendations | AI recommends suppliers and quantities for reorder | Suggest |
| Report generation | AI drafts routine reports from templates | Suggest |
| Schedule optimization | AI suggests optimal scheduling for maintenance tasks | Suggest |

**How it works:**
```
User Action ──► AI Analysis ──► Suggestion ──► Human Review ──► Accept/Reject
                                                                    │
                                                              ┌─────┴─────┐
                                                              │ Feedback   │
                                                              │ (improves  │
                                                              │  model)    │
                                                              └───────────┘
```

**Success criteria:**
- Suggestion acceptance rate > 40%
- Time saved: measurable reduction in task completion time
- User satisfaction: > 4/5 rating on AI suggestions

## Phase 3: Execute (V3)

**Duration:** Months 15-24

**Prerequisites:** Phase 2 success criteria met, comprehensive monitoring, safety guards tested.

**Capabilities:**

| Feature | Description | Autonomy Level |
|---------|-------------|----------------|
| Auto-routing work orders | AI assigns work orders to appropriate teams | Execute (within rules) |
| Automated procurement POs | AI generates purchase orders for low-value items | Execute |
| Smart notifications | AI sends proactive alerts to clients/staff | Execute |
| Report auto-generation | AI generates and sends scheduled reports | Execute |

**Safety controls:**
- Spending limits on automated procurement
- Human-in-the-loop for all financial decisions > $X threshold
- Automatic escalation if AI confidence < threshold
- Daily audit of all automated actions
- Kill switch to disable any automated capability

## Phase 4: Autonomous (V3+)

**Duration:** Months 24+

**Prerequisites:** Years of data, proven reliability, regulatory compliance.

**Capabilities:**
- Fully autonomous maintenance scheduling
- Predictive procurement with automatic ordering
- Client-facing AI agents
- Autonomous anomaly resolution

## Technology Stack

### V1 (Preparation)

| Component | Tool | Purpose |
|-----------|------|---------|
| Vector storage | pgvector (PostgreSQL extension) | Not deployed, schema designed |
| Embedding API | OpenAI API | Evaluated, not integrated |
| LLM provider | OpenAI GPT-4o-mini | Evaluated for prototyping |
| Agent framework | None | Evaluated (not selected yet) |

### V2 (Observe + Suggest)

| Component | Tool | Justification |
|-----------|------|--------------|
| Vector storage | pgvector | No new infrastructure; runs on existing PostgreSQL |
| Embedding model | OpenAI text-embedding-3-small | Best quality/cost ratio ($0.13/1M tokens) |
| LLM (complex) | OpenAI GPT-4o | Best reasoning for suggestions |
| LLM (simple) | OpenAI GPT-4o-mini | Cost-effective for classification, extraction |
| Agent framework | Custom TypeScript | Full control, simpler than LangChain, debuggable |
| RAG pipeline | Custom (pgvector + OpenAI) | Simple, no orchestration framework needed |
| Monitoring | LangSmith or custom | Trace LLM calls, measure accuracy |

## Ethical Guidelines

| Principle | Implementation |
|-----------|---------------|
| Transparency | All AI-generated content labeled as "AI-suggested" |
| Human oversight | No financial decisions executed autonomously in V1-V2 |
| Privacy | AI never trained on tenant data; RAG only retrieves authorized data |
| Bias monitoring | Regular audit of suggestions for systematic bias |
| Accuracy | All suggestions show confidence score; low-confidence requires manual review |
| Opt-out | Tenants can disable AI features |
| Auditability | All AI actions logged with prompt, response, and user decision |

## Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Incorrect suggestions | Medium | Medium | Confidence scoring, human-in-the-loop |
| Data leakage via RAG | Low | Critical | Strict tenant isolation in vector DB |
| Model bias | Low | Medium | Regular bias audits, diverse training data |
| Over-reliance on AI | Medium | Medium | Always show confidence, require human approval |
| LLM hallucination | Medium | High | RAG grounding, factual verification layer |
| High API costs | Medium | Medium | Cost tracking, caching, tiered model selection |
