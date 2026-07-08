# Prompt Architecture (V2+)

## Overview

Prompt management system for the Triangle Black AI platform. Prompts are version-controlled templates stored in the repository, with metadata for testing, monitoring, and iteration.

## Design Principles

| Principle | Description |
|-----------|-------------|
| Templates over strings | All prompts are structured YAML templates, not hardcoded strings |
| Versioned | Every prompt change is tracked in git with a version number |
| Testable | Each prompt has associated test cases and expected outputs |
| Observable | Every prompt execution is logged (input tokens, output tokens, latency) |
| Modular | System prompt, context, and user prompt are separate, composable sections |
| Tenant-aware | Prompts can reference tenant-specific context and data |

## Template Format

```yaml
# prompts/suggestion/quotation-line-items.yaml
metadata:
  id: suggestion_quotation_line_items
  name: Quotation Line Item Suggestion
  version: 1.2.0
  description: Suggests line items for quotations based on historical data
  task: suggestion
  complexity: complex
  model: gpt-4o
  created: 2026-06-30
  updated: 2026-06-30
  author: AI Team

system_prompt: |
  You are an expert hospitality engineering procurement assistant.
  Your role is to suggest quotation line items based on:
  1. The current quotation context
  2. Historical quotation data from this client
  3. Industry-standard pricing and labor rates

  RESPONSE FORMAT:
  Return a JSON array of suggested line items:
  {
    "suggestions": [
      {
        "description": "string",
        "quantity": number,
        "unit": "hours|each|flat",
        "unit_price": number,
        "confidence": "high|medium|low",
        "reasoning": "string",
        "source": "historical|industry|template"
      }
    ]
  }

  GUIDELINES:
  - Only suggest items relevant to the current project type
  - Mark confidence as LOW if uncertain
  - Base pricing on historical data where available
  - Flag unusually expensive items for manual review

context_template: |
  CURRENT QUOTATION:
  - Client: {{client_name}}
  - Project Type: {{project_type}}
  - Scope: {{scope_description}}
  - Location: {{location}}
  - Estimated Duration: {{duration}}

  HISTORICAL DATA (last 24 months):
  {{#each historical_quotations}}
  - {{project_type}}: ${{total}} ({{date}})
    Items: {{items_summary}}
  {{/each}}

  INDUSTRY DATA:
  {{#each industry_rates}}
  - {{item}}: ${{rate}}/{{unit}} ({{source}})
  {{/each}}

  AVAILABLE TEMPLATES:
  {{#each templates}}
  - {{name}}: {{items_summary}}
  {{/each}}

user_prompt: |
  Generate quotation line item suggestions for this {{project_type}} project.
  Focus on: {{focus_areas}}

  Constraints:
  - Max budget: ${{max_budget}}
  - Required completion: {{deadline}}
  - Special requirements: {{special_requirements}}
```

## Template Directory

```
prompts/
├── suggestion/
│   ├── quotation-line-items.yaml
│   ├── maintenance-priority.yaml
│   ├── procurement-reorder.yaml
│   └── schedule-optimization.yaml
├── classification/
│   ├── service-request-category.yaml
│   ├── document-type.yaml
│   └── ticket-priority.yaml
├── query/
│   ├── knowledge-base-search.yaml
│   ├── data-analysis.yaml
│   └── workflow-assistance.yaml
├── report/
│   ├── monthly-operations.yaml
│   ├── quarterly-business-review.yaml
│   └── anomaly-summary.yaml
├── extraction/
│   ├── invoice-data.yaml
│   ├── purchase-order.yaml
│   └── contact-info.yaml
└── system/
    ├── base-system.yaml
    ├── tenant-context.yaml
    └── safety-guardrails.yaml
```

## Prompt Service

```typescript
// src/ai/prompts/prompt.service.ts
@Injectable()
export class PromptService {
  private templates: Map<string, PromptTemplate> = new Map();
  private readonly templateDir = path.join(__dirname, '../../../prompts');

  async loadTemplates(): Promise<void> {
    const files = await glob('prompts/**/*.yaml', { cwd: this.templateDir });

    for (const file of files) {
      const content = await fs.readFile(path.join(this.templateDir, file), 'utf-8');
      const template = yaml.parse(content) as PromptTemplate;
      this.templates.set(template.metadata.id, template);
    }
  }

  async render(
    templateId: string,
    variables: Record<string, unknown>,
  ): Promise<ParsedPrompt> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Prompt template not found: ${templateId}`);
    }

    // Render each section with Handlebars
    const systemPrompt = Handlebars.compile(template.system_prompt)({});
    const contextPrompt = Handlebars.compile(template.context_template)(variables);
    const userPrompt = Handlebars.compile(template.user_prompt)(variables);

    // Build full prompt
    return {
      model: template.metadata.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${contextPrompt}\n\n${userPrompt}` },
      ],
      metadata: {
        templateId,
        version: template.metadata.version,
        task: template.metadata.task,
        complexity: template.metadata.complexity,
      },
    };
  }

  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}
```

## Prompt Testing

### Test Cases

```yaml
# prompts/tests/quotation-line-items.test.yaml
template: suggestion_quotation_line_items
tests:
  - name: AC maintenance quotation
    variables:
      client_name: Grand Nile Hotel
      project_type: AC Maintenance
      scope_description: Annual AC maintenance for 50 rooms
      location: Cairo
      duration: 5 days
      historical_quotations:
        - project_type: AC Maintenance
          total: 4500
          date: "2026-01-15"
          items_summary: Labor 40hrs, Parts $1200
      industry_rates:
        - item: HVAC Technician
          rate: 65
          unit: hour
          source: Industry Avg
      templates:
        - name: Standard AC Maintenance
          items_summary: Labor, Filters, Refrigerant
      focus_areas: labor costs, filter replacement
      max_budget: 6000
      deadline: "2026-07-15"
      special_requirements: Night work only
    expected:
      suggestions_count: ">= 3"
      has_pricing: true
      confidence_field: true
      format: json

  - name: No historical data
    variables:
      client_name: New Client
      project_type: Electrical Upgrade
      # ... minimal variables, no historical data
    expected:
      confidence_high: false
      disclaimer: true
```

### Test Runner

```typescript
// src/ai/prompts/prompt-tester.ts
export class PromptTester {
  async runTests(templateId: string): Promise<TestResults> {
    const testFile = `prompts/tests/${templateId}.test.yaml`;
    const testCases = yaml.parse(await fs.readFile(testFile, 'utf-8'));

    const results: TestResult[] = [];

    for (const test of testCases.tests) {
      try {
        const prompt = await this.promptService.render(templateId, test.variables);
        const response = await this.llmService.complete(prompt);

        results.push({
          name: test.name,
          passed: this.validateResponse(response, test.expected),
          response: response,
          errors: this.getValidationErrors(response, test.expected),
        });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error.message,
        });
      }
    }

    return {
      templateId,
      version: this.promptService.getTemplate(templateId).metadata.version,
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results,
    };
  }

  private validateResponse(response: string, expected: TestExpectations): boolean {
    // Validate JSON format
    if (expected.format === 'json') {
      try {
        JSON.parse(response);
      } catch {
        return false;
      }
    }

    // Validate suggestions count
    if (expected.suggestions_count) {
      const [op, count] = expected.suggestions_count.split(' ');
      const parsed = JSON.parse(response);
      const actualCount = parsed.suggestions?.length || 0;

      switch (op) {
        case '>=': return actualCount >= parseInt(count);
        case '<=': return actualCount <= parseInt(count);
        case '==': return actualCount === parseInt(count);
      }
    }

    return true;
  }
}
```

## Versioning & Change Management

```yaml
# prompts/CHANGELOG.yaml
versions:
  - version: 1.2.0
    date: 2026-06-30
    changes:
      - Added explicit confidence field to response format
      - Improved context template for historical data
    test_pass_rate: 95%
    author: AI Team

  - version: 1.1.0
    date: 2026-06-15
    changes:
      - Added industry rates to context
      - Fixed JSON format validation
    test_pass_rate: 92%
    author: AI Team

  - version: 1.0.0
    date: 2026-06-01
    changes:
      - Initial prompt template
    test_pass_rate: 85%
    author: AI Team
```

## Monitoring & Observability

Every prompt execution is logged:

```typescript
interface PromptExecutionLog {
  templateId: string;
  version: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  variables: Record<string, unknown>;  // Sanitized, no PII
  response: string;
  confidence?: number;
  accepted?: boolean;
  error?: string;
  timestamp: Date;
}
```

## Best Practices

| Practice | Detail |
|----------|--------|
| One prompt per task | Each template handles exactly one type of task |
| Explicit output format | Always specify expected response structure (JSON schema) |
| Context in user prompt | System prompt = behavior, context = data, user prompt = task |
| Few-shot examples | Include 2-3 examples in system prompt for complex tasks |
| Temperature tuning | Classification: 0.0-0.1, Suggestion: 0.2-0.3, Creative: 0.5-0.7 |
| Token limits | Set max_tokens to prevent runaway responses |
| Error handling | Template always includes "if unsure, say so" instruction |
| No PII in prompts | Personal data is replaced with placeholders |
| Version pinning | Application code references specific template version |
| A/B testing | Multiple template versions can run in parallel for comparison |
