# AI Agent Productivity Metrics

## Purpose

As AI agents (coding assistants, review bots, documentation generators) become integral to the delivery pipeline, measuring their effectiveness is essential. AI productivity metrics assess the quality, efficiency, and reliability of AI-generated contributions — ensuring that AI augmentation improves, rather than impedes, delivery performance.

## Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Human-in-the-loop** | AI agents augment, not replace, human judgment. All AI outputs are reviewed. |
| **Quality over speed** | Faster AI generation is valuable only if quality is maintained or improved. |
| **Transparency** | AI-generated artifacts are clearly labeled. Metrics are visible to all. |
| **Continuous improvement** | AI agent performance is tracked and improved over time through prompt refinement and model updates. |

## Metrics

### First-Pass Yield (FPY)

- **Definition**: Percentage of AI-generated artifacts (code, tests, documentation, configurations) that pass human review without requiring rework.
- **Measurement**: `(artifacts accepted on first review / total AI-generated artifacts) * 100`
- **Tools**: Code review platform (flag AI-generated PRs), manual review tracking.
- **Target**: ≥ 70% FPY. Below 50% indicates the AI agent needs retraining or prompt adjustment.
- **Why it matters**: High FPY means the AI agent produces useful output consistently. Low FPY means human reviewers spend more time correcting AI output than they save.

### Task Completion Rate

- **Definition**: Percentage of AI-assigned tasks that result in a deployable artifact (code merged, documentation published, etc.).
- **Measurement**: `(AI-generated artifacts merged / AI-generated artifacts submitted) * 100`
- **Tools**: Version control system, CI/CD pipeline.
- **Target**: ≥ 85% completion rate.
- **Why it matters**: Low completion rate indicates tasks are being abandoned or AI output is consistently rejected. Investigate whether tasks are appropriately scoped for AI or if AI quality needs improvement.

### Rework Rate by Agent

- **Definition**: Frequency and magnitude of changes requested by human reviewers on AI-generated artifacts.
- **Measurement**:
  - **Rework frequency**: Percentage of AI artifacts requiring at least one revision cycle.
  - **Rework magnitude**: Average number of review cycles per AI artifact.
- **Tools**: Code review platform review history.
- **Target**: < 30% requiring more than one revision cycle.
- **Breakdown**: Track rework rate by AI agent type (code generator, test generator, documentation writer) to identify which agents need improvement.

### Escalation Rate

- **Definition**: Percentage of AI-generated artifacts that require human escalation because the AI could not complete the task or produced unusable output.
- **Measurement**: `(AI tasks escalated to human / total AI tasks attempted) * 100`
- **Tools**: Task management system, AI agent logs.
- **Target**: < 10% escalation rate.
- **Why it matters**: High escalation rates indicate tasks are poorly scoped for AI, or the AI agent lacks necessary context. Common escalation reasons include ambiguous requirements, missing context, or tasks requiring human judgment.

### Generation Quality Score

- **Definition**: A composite quality rating assigned by human reviewers to each AI-generated artifact.
- **Measurement**: Average score on a 1-5 scale across dimensions:
  1. **Correctness** — Does the code work? Are tests passing?
  2. **Style compliance** — Does it follow coding standards?
  3. **Security awareness** — Are there security concerns?
  4. **Performance awareness** — Are there obvious performance issues?
  5. **Completeness** — Does it address all acceptance criteria?
- **Tools**: Custom review form or comment analysis (NLP-based sentiment/quality scoring).
- **Target**: Average score ≥ 4.0 (on 1-5 scale).
- **Reporting**: Track trend over time. A declining quality score may indicate model drift or prompt degradation.

### Context Utilization Efficiency

- **Definition**: How effectively the AI agent uses the context provided (ticket description, related code, design documents, conversation history).
- **Measurement**: Based on analysis of AI agent requests to determine how much of the provided context was reflected in the generated output.
  - **Explicit context usage**: Does the output reference ticket numbers, variable names, and architecture decisions from the provided context?
  - **Implicit context usage**: Does the output respect existing code patterns and conventions in the repository?
- **Tools**: Custom analysis scripts, log analysis.
- **Target**: ≥ 80% context utilization. Low utilization suggests prompts need restructuring or the AI agent has context window limitations.
- **Improvement**: Structure prompts with most relevant context first, minimize noise, use consistent formatting.

## Measurement and Reporting

### Data Collection

AI agent metrics are collected from:

1. **Version control system** — commit authorship (AI vs. human), PR labels (AI-generated).
2. **Code review platform** — review comments, approval/rejection, revision cycles.
3. **AI agent logs** — task acceptance, generation duration, completion status.
4. **Task management system** — AI task assignment and tracking.

### AI Productivity Dashboard

The AI productivity dashboard should display:

- First-pass yield (trend, 30-day rolling)
- Task completion rate (by agent type)
- Rework rate and average cycles per artifact
- Escalation rate (by reason category)
- Generation quality score (by dimension, radar chart)
- Context utilization efficiency (trend)
- AI vs. human cycle time comparison (line chart)
- AI contribution percentage (percentage of total code/delivery)

### Weekly AI Review

A weekly review of AI agent performance:

1. Review FPY and quality score trends.
2. Identify top reasons for rework and escalation.
3. Determine if prompt adjustments are needed.
4. Review AI agent update/changelog (if using external AI services).
5. Decide on AI task scope adjustments.

## Improvement Strategies

| Issue | Strategy |
|-------|----------|
| Low first-pass yield | Refine prompts, provide better context, reduce task complexity, add few-shot examples |
| High rework rate | Identify common review comments, update agent training or prompts to address recurring issues |
| High escalation rate | Improve task decomposition (smaller, clearer tasks), enhance context provision |
| Low quality score | Review generated output for patterns, update coding standards in prompts, consider model upgrade |
| Low context utilization | Restructure prompt templates (context first, instruction second), limit unnecessary context |
| Declining trend over time | Investigate model drift, prompt degradation, or changes in codebase complexity |
