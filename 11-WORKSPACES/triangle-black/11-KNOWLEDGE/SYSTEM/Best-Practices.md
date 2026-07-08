# Best Practices

## Overview

This document captures best practices accumulated from experience delivering projects with the EADF. Practices are organized by domain and are updated each sprint based on lessons learned and retrospective outcomes.

---

## Sprint Execution

### Planning

- **Define a single, measurable sprint goal**: One clear objective focuses the team and agents. Avoid multiple competing goals in a single sprint.
- **Apply Definition of Ready before planning**: Items that do not meet Ready criteria should be refined before the planning session, not during it.
- **Right-size tasks**: Break backlog items into tasks that take ≤1 day. Tasks larger than 1 day should be decomposed further.
- **Include buffer for unknowns**: Reserve 15–20% of sprint capacity for unplanned work, clarifications, and minor fixes.
- **Estimate collaboratively**: Use planning poker or team estimation. Include agents in estimation by asking for effort assessments based on similar past work.

### Daily Execution

- **Start every day with context refresh**: Agents should reload current context at the start of each day. Context can drift or become stale overnight.
- **Log blockers immediately**: Do not wait for the daily sync to log blockers. Real-time logging enables faster resolution.
- **Complete one thing before starting another**: Focus on finishing tasks over starting new ones. Work-in-progress limits prevent context switching.
- **Keep the task board current**: A stale task board is worse than no board. Real-time status enables accurate burndown and progress tracking.
- **Flag incomplete work early**: If a task will not be completed by sprint end, flag it by mid-sprint. This allows reprioritization rather than last-minute scrambling.

### Review & Retrospective

- **Demo working software, not slides**: The sprint review demonstrates real, tested, working increments. Avoid presentation-only demos.
- **Invite stakeholders early**: Send review invitations at sprint start, not the day before. Stakeholder attendance is critical for feedback.
- **Run retro immediately after review**: Gap between review and retro causes loss of context and emotional investment.
- **Limit retro actions to 1–2 per sprint**: Too many action items dilute focus. Select the most impactful improvements.
- **Track action items to completion**: Action items without owners and due dates are wishes, not improvements.

---

## Agent Interaction

### Prompting

- **Be specific and structured**: Structured prompts with clear sections (Context, Objective, Instructions, Output Format) produce more consistent results than freeform instructions.
- **Include acceptance criteria in prompts**: Every prompt should reference the acceptance criteria for the task. Do not assume agents have independent access to the backlog.
- **Use examples (few-shot prompting)**: Provide 1–3 examples of desired output. Examples reduce ambiguity more effectively than additional instructions.
- **Specify output format explicitly**: Define the structure, format, and schema of the expected output. This enables automated validation and reduces rework.
- **Avoid negative instructions**: Phrase instructions positively. "Do include error handling" is more effective than "Do not forget error handling."

### Context Management

- **Inject context at the right granularity**: Module-level context is better than system-level context. File-level context is better than module-level context for implementation tasks.
- **Flag context expiration**: Context has a shelf life. Reference documents, API specs, and architecture decisions can become stale. Include last-validated dates.
- **Separate stable and volatile context**: Core architecture and design patterns change slowly (stable). Requirements and task details change frequently (volatile). Manage them differently.
- **Prefer retrieval over injection**: Instead of injecting all possible context, teach agents to retrieve context on demand. This reduces token usage and improves focus.

### Feedback & Correction

- **Provide actionable feedback**: "Add validation for empty inputs" is actionable. "This is not what I wanted" is not.
- **Show, not just tell**: When correcting agent output, provide the correct example rather than describing the correction.
- **Correct at the prompt level, not the output level**: If an agent repeatedly produces incorrect output, fix the prompt rather than manually editing each output.
- **Give positive feedback too**: Reinforce correct behavior. Agents that receive balanced feedback produce better results over time.

---

## Context Management

### Assembly

- **Create a context index once, update often**: Maintain a machine-readable index of all context documents. Update it when documents change.
- **Version context documents**: Context documents should have version numbers and changelogs. Agents can then identify stale context.
- **Include context metadata**: Each context document should include: title, version, author, last updated, summary, and relevance scope.

### Storage

- **Store context close to the code**: In-repository context (under `docs/` or `context/`) is preferred over external wikis or shared drives. It is versioned alongside the code.
- **Use consistent naming conventions**: Context files should follow a consistent naming pattern: `<domain>-<topic>-<type>.md`.
- **Archive obsolete context**: Do not delete context when it becomes obsolete — archive it. Archived context can inform future decisions and prevent repeated mistakes.

### Quality

- **Review context before sprint start**: The ADL should review all context documents for accuracy and relevance before each sprint.
- **Remove redundant context**: Duplicate or contradictory context confuses agents. Maintain a single source of truth for each topic.
- **Test context effectiveness**: Periodically run test prompts with and without context to measure the impact on output quality.

---

## Quality

### Automation

- **Automate all quality gates**: Manual quality checks are inconsistent and slow. Every quality gate should have an automated component.
- **Fail fast in CI**: Short feedback cycles improve quality. Configure CI to fail on the first detected issue, not at the end of the pipeline.
- **Use deterministic checks where possible**: Linting, type checking, and static analysis are deterministic. Use them before non-deterministic checks like AI reviews.

### Standards

- **Document standards in executable format**: Standards documented in natural language are subject to interpretation. Encode standards in linters, formatters, and schema validators.
- **Include agents in standard development**: Agents use standards more consistently when they participate in defining them. Review standard adherence in retrospectives.
- **Review standards quarterly**: Standards that do not evolve become anti-patterns. Review and update standards every quarter.

### Testing

- **Write tests before code (or immediately after)**: Test-last approaches with agents produce inadequate test coverage. Generate tests immediately after code generation.
- **Include negative tests explicitly**: Agents default to testing happy paths. Explicitly request error handling, edge case, and boundary tests.
- **Mutate to validate tests**: Run mutation testing to ensure tests catch real defects. If mutations survive, tests are inadequate.

---

## Governance

### Compliance

- **Embed compliance into the pipeline**: Compliance checks should be automated gates, not manual audits. If it can be checked, it should be checked in CI.
- **Log all agent decisions**: Every non-trivial decision by an agent should be logged with reasoning. This enables audit trails and post-mortem analysis.
- **Define escalation criteria explicitly**: Agents should know, based on explicit criteria, when to escalate to a human. Ambiguous escalation criteria lead to either over-escalation or under-escalation.

### Security

- **Inject security context into every task**: Security is not a separate concern. Every prompt should include security requirements relevant to the task.
- **Use a dedicated security agent**: A specialized security agent reviewing all output is more effective than expecting all agents to be security-aware.
- **Run SAST/DAST in every pipeline**: Static and dynamic analysis should be part of every build, not periodic exercises.
- **Never trust agent output without validation**: Agent output can introduce vulnerabilities unintentionally. Automated security scanning is mandatory.

---

## Communication

### Internal

- **Use structured communication formats**: Freeform communication between agents and humans leads to ambiguity. Use templates for status updates, blockers, and handoffs.
- **Document decisions with rationale**: Every decision (by human or agent) should include the reasoning behind it. This prevents revisiting the same decision multiple times.
- **Maintain a single source of truth for announcements**: All team announcements should go through one channel with threading enabled.

### External

- **Translate agent output for stakeholders**: Raw agent output is rarely stakeholder-ready. Summarize, contextualize, and present in business terms.
- **Set expectations on agent capabilities**: Stakeholders should understand what agents can and cannot do. Overpromising agent capabilities erodes trust.
- **Report progress with evidence**: Show completed work, not just status updates. Stakeholder confidence is highest when they see working increments.

---

## Metrics & Measurement

- **Measure outcomes, not outputs**: Lines of code written and tasks completed are vanity metrics. Focus on value delivered and quality achieved.
- **Track agent-specific metrics**: Measure per-agent completion rate, rework rate, and quality score. This identifies which agents or prompts need improvement.
- **Use trend lines, not snapshots**: A single sprint's metrics are noise. Track trends over 4–6 sprints for meaningful insight.
- **Share metrics transparently**: All metrics should be visible to the entire team. Hidden metrics create distrust.

---

## Continuous Improvement

- **Treat the EADF as a product**: The framework itself should be iteratively improved. Apply the same delivery practices to the framework as to the project.
- **Experiment with one change at a time**: Isolate variables when improving the process. Changing multiple things simultaneously makes it impossible to attribute impact.
- **Retrospect on experiments**: After trying a new practice, retro specifically on that practice. Did it help? Should it become permanent?
- **Share improvements across teams**: If multiple teams use the EADF, cross-team retrospectives and knowledge sharing amplify improvements.
