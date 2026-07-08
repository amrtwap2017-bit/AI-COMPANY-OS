# ADR-010: AI Integration

**Status:** Accepted (V2+)

**Context:** Triangle Black plans to integrate AI capabilities including a conversational booking assistant, intelligent recommendations (upsells, dynamic pricing), automated guest communication, and operational insights from data analytics. The AI architecture must be modular (different providers for different tasks), extensible (easy to add new agents), and isolated from core business logic to avoid coupling.

**Decision:**

We will implement an **extensible agent architecture** with a dedicated AI Agent module in V2+.

Architecture:
```
┌──────────────────────────────────────────────────────────────┐
│                    AI Agent Module (NestJS)                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Agent Orchestrator                    │   │
│  │  Routes requests to appropriate agent, manages        │   │
│  │  conversation context, enforces rate limits           │   │
│  └────┬──────────┬──────────┬──────────┬────────────────┘   │
│       │          │          │          │                      │
│  ┌────┴─────┐ ┌──┴─────┐ ┌──┴─────┐ ┌──┴──────────────┐   │
│  │ Booking  │ │ Service │ │ Upsell │ │ Analytics       │   │
│  │ Agent    │ │ Agent   │ │ Agent  │ │ Agent           │   │
│  │ (Chat)   │ │ (Q&A)   │ │ (Recs) │ │ (Insights)      │   │
│  └────┬─────┘ └───┬────┘ └───┬────┘ └───────┬─────────┘   │
│       │           │          │               │              │
│  ┌────┴───────────┴──────────┴───────────────┴──────────┐  │
│  │               AI Provider Abstraction                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │ OpenAI   │  │ Claude   │  │  Local Model     │    │  │
│  │  │ (GPT-4)  │  │ (Sonnet) │  │  (Llama/Mistral) │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Tools available to agents:                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Search   │ │ Check    │ │ Create   │ │ Get      │       │
│  │ Rooms    │ │ Pricing  │ │ Booking  │ │ Guest    │       │
│  │          │ │          │ │          │ │ Info     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────────────────────────────────────────────────────────┘
```

Integration approach:
```
Conversation endpoint:
  POST /api/v2/ai/chat
  Body: { message: "I need a room for July 4-6", context: { tenantId, propertyId } }
  Response: { reply: "...", actions: [...], suggestions: [...] }

Agent tool registration:
  Each tool is a class implementing ToolInterface:
  {
    name: string;
    description: string;
    parameters: JSONSchema;
    execute(params): Promise<any>;
  }
```

**Consequences:**

*Positive:*
- Extensible architecture — add new agents without modifying existing code
- Provider abstraction — swap AI providers based on cost, performance, or capability
- Tools-based approach keeps agents focused and secure (no direct DB access)
- Agent isolation means failures are contained (one agent doesn't take down others)
- Built-in audit trail for all AI actions

*Negative:*
- AI features depend on external API reliability and latency
- Provider costs scale with usage (need rate limiting and cost monitoring)
- Conversational interfaces add complexity to the frontend
- Agent responses must be carefully validated to prevent hallucination
- Self-hosted models require significant compute (GPU)
- Privacy concerns with sending tenant data to external AI providers

**Data Privacy:**
- Tenant data sent to AI providers only with explicit consent
- Data anonymization layer for analytics agents
- Self-hosted model option for privacy-sensitive tenants
- All AI interactions logged for audit and compliance
- Configurable data retention policies for AI conversation history

**Alternatives:**
- **Tightly coupled AI (embed calls directly in modules)** — rejected: scatters AI logic across the codebase; hard to manage
- **Third-party chatbot (Intercom, Zendesk AI)** — rejected: limited customization, data privacy concerns, hard to integrate with core domain
- **No AI** — rejected: AI is a key differentiator for the product; delaying beyond V2 would cede competitive advantage
- **Rule-based automation only** — rejected: rules are rigid; AI provides natural language and adaptive capabilities
- **External AI service (AI as separate microservice)** — considered for V3 when AI usage justifies a dedicated service

**Related ADRs:** ADR-004 (Backend), ADR-006 (API Design), ADR-007 (Auth)
