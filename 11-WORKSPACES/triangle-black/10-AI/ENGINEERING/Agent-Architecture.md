# Agent Architecture (V2+)

## Overview

Agent architecture for V2+, designed now but built later. Agents are modular, composable, and run within the existing NestJS backend. Each agent has a specific capability, accesses defined tools, and operates with human supervision.

## Design Principles

| Principle | Description |
|-----------|-------------|
| Single responsibility | Each agent does one thing well |
| Explicit tool access | Agents can only use approved tools |
| Human-in-the-loop | All suggestions require human approval in V2 |
| Observable | Every agent action is logged and traceable |
| Fails gracefully | Agents degrade gracefully on errors or uncertainty |
| Tenant-isolated | Agents only access data within their tenant |
| Cost-aware | Model selection based on task complexity |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                      │
│  (routes requests, manages context, logs actions)         │
└────────────────────┬─────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐    ┌─────▼─────┐   ┌────▼────┐
│ Query    │    │ Suggestion │   │ Report   │
│ Agent    │    │ Agent      │   │ Agent    │
│ (L1)     │    │ (L2)       │   │ (L2)     │
└────┬────┘    └─────┬──────┘   └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
          ┌──────────▼──────────┐
          │    Tool Registry      │
          │                       │
          │  ┌───────────────────┐│
          │  │ • Database query   ││
          │  │ • Knowledge search ││
          │  │ • Send email       ││
          │  │ • Generate report  ││
          │  │ • Create ticket    ││
          │  └───────────────────┘│
          └───────────────────────┘
```

## Agent Types

### 1. Query Agent (Level 1 — Observe)

**Purpose:** Answer natural language questions from the knowledge base and platform data.

**Capabilities:**
- Retrieve information from knowledge base (RAG)
- Query structured data (e.g., "How many open work orders?")
- Summarize reports and dashboards
- Explain platform features and workflows

**Tools:**
- `search_knowledge_base(query)` — Semantic search across documentation
- `query_database(sql)` — Read-only SQL queries (parameterized, restricted)
- `list_recent_activity(entity_type)` — Recent activity summary

**Trigger:** User asks a question in the UI or chat.

**Example:**
```
User: "What's the maintenance schedule for Grand Nile Hotel this week?"
Agent: [Searches knowledge base for maintenance schedule,
        queries database for work orders at Grand Nile Hotel]
        "This week's maintenance schedule for Grand Nile Hotel:
         - Monday: HVAC inspection (Room 201-210)
         - Wednesday: Pool pump service
         - Thursday: Fire alarm test"
```

### 2. Suggestion Agent (Level 2 — Suggest)

**Purpose:** Analyze data and suggest actions.

**Capabilities:**
- Suggest quotation line items based on historical data
- Recommend maintenance priorities
- Propose procurement quantities
- Flag anomalies in operational data

**Tools:**
- `analyze_patterns(entity_type, metric)` — Statistical analysis
- `get_similar_cases(current_case, limit)` — Find similar historical cases
- `estimate_outcome(action, context)` — Predict outcome of suggested action
- `suggest_action(context, constraints)` — Generate action suggestion

**Trigger:** User is in a creation/editing workflow.

**Example:**
```
User: [Creating a quotation for AC maintenance]
Agent: [Analyzes 50 similar quotations from this tenant]
       "Based on 50 similar quotations, I suggest:
        - Labor: 8 hours × $65/hr = $520 (90% confidence)
        - Parts: Compressor filter kit = $180 (85% confidence)
        - Travel: $50 flat fee
        Total: $750
        Accept / Edit / Dismiss"
```

### 3. Report Agent (Level 2 — Suggest)

**Purpose:** Generate structured reports from templates and data.

**Capabilities:**
- Draft monthly operational reports
- Generate quarterly business reviews
- Create ad-hoc analysis reports
- Format data into charts and tables

**Tools:**
- `query_database(sql)` — Read-only data access
- `render_template(template_id, data)` — Fill report template
- `generate_chart(data, type)` — Generate chart data/config
- `format_report(report, format)` — Format as PDF/HTML/CSV

**Trigger:** Scheduled or user-initiated report generation.

### 4. Notification Agent (Level 2 — Suggest)

**Purpose:** Proactively notify users about important events.

**Capabilities:**
- Alert on approaching deadlines
- Notify on budget overruns
- Flag overdue maintenance
- Summarize daily activity

**Tools:**
- `check_conditions(rules)` — Evaluate alert conditions
- `send_notification(user_id, message, urgency)` — Send push/email
- `get_user_preferences(user_id)` — Respect notification preferences

### 5. Classification Agent (Level 1 — Observe)

**Purpose:** Classify and tag platform data automatically.

**Capabilities:**
- Categorize service requests
- Tag documents by type and relevance
- Prioritize incoming tickets
- Extract structured data from documents

**Tools:**
- `classify_text(text, categories)` — LLM-based classification
- `extract_entities(text, schema)` — Extract structured fields
- `tag_document(document_id, tags)` — Apply tags

## Agent Implementation (V2)

### Base Agent Class

```typescript
// src/ai/agents/base.agent.ts
export abstract class BaseAgent {
  protected logger: Logger;
  protected tools: Tool[];
  protected model: ModelProvider;

  constructor(
    protected context: AgentContext,
  ) {
    this.logger = new Logger(this.constructor.name);
    this.tools = this.registerTools();
    this.model = this.selectModel();
  }

  abstract registerTools(): Tool[];
  abstract selectModel(): ModelProvider;

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();

    this.logger.log('Agent execution started', { agent: this.name, input });

    // 1. Validate input
    this.validateInput(input);

    // 2. Build context (retrieve relevant data)
    const context = await this.buildContext(input);

    // 3. Generate response
    const response = await this.generateResponse(input, context);

    // 4. Evaluate confidence
    const confidence = await this.evaluateConfidence(response);

    // 5. Log execution
    this.logger.log('Agent execution completed', {
      agent: this.name,
      duration: Date.now() - startTime,
      confidence,
    });

    return {
      response,
      confidence,
      requiresReview: confidence < this.confidenceThreshold,
    };
  }

  protected async buildContext(input: AgentInput): Promise<AgentContext> {
    // Retrieve relevant data from tools
    // Build RAG context
    // Format for model
    return {};
  }

  protected abstract generateResponse(
    input: AgentInput,
    context: AgentContext,
  ): Promise<AgentResponse>;

  protected abstract evaluateConfidence(response: AgentResponse): Promise<number>;

  protected validateInput(input: AgentInput): void {
    if (!input.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }
}
```

### Tool Registry

```typescript
// src/ai/tools/tool.registry.ts
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
  requiresApproval: boolean;
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }
}
```

### Model Selection Strategy

```typescript
// src/ai/models/model-selector.ts
export class ModelSelector {
  select(task: TaskType, complexity: Complexity): ModelConfig {
    // Tiered model selection based on task and complexity
    const configs: Record<string, ModelConfig> = {
      'classification:simple': {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 256,
        temperature: 0.1,
        costPer1KTokens: 0.00015,
      },
      'classification:complex': {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 512,
        temperature: 0.1,
        costPer1KTokens: 0.01,
      },
      'suggestion:simple': {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 512,
        temperature: 0.3,
        costPer1KTokens: 0.00015,
      },
      'suggestion:complex': {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 2048,
        temperature: 0.2,
        costPer1KTokens: 0.01,
      },
      'query:simple': {
        provider: 'openai',
        model: 'gpt-4o-mini',
        maxTokens: 1024,
        temperature: 0.1,
        costPer1KTokens: 0.00015,
      },
      'report:complex': {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 4096,
        temperature: 0.3,
        costPer1KTokens: 0.01,
      },
    };

    const key = `${task}:${complexity}`;
    return configs[key] || configs[`${task}:simple`];
  }
}
```

## Context & Memory

### Short-Term Memory (within session)

```typescript
interface SessionMemory {
  conversationHistory: Message[];
  currentContext: {
    entityId?: string;
    action?: string;
    userPreferences?: Record<string, unknown>;
  };
  recentToolResults: ToolResult[];
}
```

### Long-Term Memory (persistent)

Stored in PostgreSQL:

```sql
-- Agent memory table
CREATE TABLE ai.agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR(100) NOT NULL,
    tenant_id UUID NOT NULL,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(agent_type, tenant_id, key)
);

-- Usage examples stored for learning
CREATE TABLE ai.suggestion_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    input JSONB NOT NULL,
    suggestion JSONB NOT NULL,
    accepted BOOLEAN NOT NULL,
    user_id UUID NOT NULL,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Safety & Guardrails

| Guardrail | Implementation |
|-----------|---------------|
| Tenant isolation | All queries include tenant_id filter; vector DB partitioned by tenant |
| Read-only queries | Query agent uses restricted DB user with SELECT-only permissions |
| Cost limits | Monthly API cost cap per tenant; automatic throttling |
| Rate limits | Max 10 agent invocations per user per minute |
| Content filtering | Output scanned for PII before display |
| Confidence threshold | Suggestions below threshold require mandatory human review |
| Escalation | If agent fails 3 times consecutively, escalate to human |
| Audit | Every agent action logged with input, output, confidence |
| Kill switch | Per-tenant toggle to disable AI features instantly |
