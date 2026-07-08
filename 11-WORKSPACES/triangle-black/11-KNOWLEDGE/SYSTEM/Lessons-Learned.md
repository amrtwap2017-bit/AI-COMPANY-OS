# Lessons Learned

## Overview

Lessons learned are the primary mechanism for continuous improvement in the EADF. Captured during sprint retrospectives and post-incident reviews, each lesson documents what happened, why it happened, and what the team will do differently.

---

## Lesson Lifecycle

```
Identify → Capture → Categorize → Validate → Apply → Track → Archive
```

| Stage | Description | Owner | Timeframe |
|-------|-------------|-------|-----------|
| Identify | Recognize a lesson worth capturing | Any | During retro or incident |
| Capture | Record using the template below | Recorder | Within 24 hours |
| Categorize | Assign type, severity, domain | TAL | Within 48 hours |
| Validate | Verify lesson is accurate and actionable | ADL | Next coordination point |
| Apply | Implement recommended action | Assigned owner | Next sprint |
| Track | Monitor whether the action resolved the issue | QS | Following 2 sprints |
| Archive | Move to historical log when no longer relevant | ADL | Quarterly |

---

## Lesson Template

```markdown
---
id: LL-<YYYY>-<NNN>
type: process | technical | communication | tooling | governance
severity: critical | major | minor
status: identified | validated | in-progress | resolved | archived
source: retro-sprint-<N> | incident-<ID> | review-<N> | ad-hoc
date: YYYY-MM-DD
author: @name
tags: [tag1, tag2, tag3]
---

# LL-<YYYY>-<NNN>: <Short Title>

## Context

Describe the situation in which the lesson was learned. Include:
- What was happening (project phase, task, activity)
- Who was involved
- What the expected outcome was

## Observation

What actually happened. Be specific and factual. Include:
- What went wrong (or what went unexpectedly well)
- What the impact was (schedule, quality, cost, team morale)
- Any contributing factors

## Root Cause Analysis

Identify why the gap between expected and actual occurred. Use:
- 5 Whys technique
- Contributing factors (process, tooling, communication, skills)
- Systemic vs. one-time cause

## Recommendation

What should be done differently in the future:
- Specific action items (who, what, when)
- Process changes needed
- Tooling or automation improvements
- Training or documentation updates

## Action Items

| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
| 1 | ...    | @name | YYYY-MM-DD | [ ] |
| 2 | ...    | @name | YYYY-MM-DD | [ ] |

## Related

- Link to related lesson: LL-YYYY-NNN
- Link to pattern/anti-pattern: PATTERN-NNN
- Link to retrospective notes: sprint-<N>/retrospective/

## Verification

- [ ] Lesson validated by ADL
- [ ] Action items assigned
- [ ] Knowledge base updated with cross-references
- [ ] Team notified
```

---

## Lesson Categories

### Process
Lessons about workflow, ceremonies, role definitions, handoffs, and lifecycle.

*Example*: Sprint planning consistently runs over time because backlog items lack Definition of Ready.

### Technical
Lessons about code, architecture, testing, performance, security, and tooling.

*Example*: Automated tests fail intermittently due to race conditions in test fixtures.

### Communication
Lessons about information flow, reporting, documentation, and stakeholder engagement.

*Example*: Stakeholders were surprised by a feature change because the review invitation was sent too late.

### Tooling
Lessons about CI/CD, agent platforms, monitoring, version control, and collaboration tools.

*Example*: Context injection fails when reference docs exceed 50 pages due to token limits.

### Governance
Lessons about compliance, security policies, standards enforcement, and audit requirements.

*Example*: Security review gate was bypassed for a low-priority item, introducing a vulnerability.

---

## Severity Levels

| Severity | Definition | Action Required |
|----------|------------|-----------------|
| Critical | Significant impact on delivery or quality | Immediate remediation, report to stakeholders |
| Major | Moderate impact, requires process change | Address in next sprint |
| Minor | Low impact, good to know | Document for awareness, optional action |

---

## Lessons Learned Log (Running)

### Current Sprint Lessons

| ID | Title | Type | Severity | Status | Owner |
|----|-------|------|----------|--------|-------|
| LL-2026-001 | Sprint planning timebox exceeded | Process | Major | In-progress | ADL |
| LL-2026-002 | Agent context window overflow | Technical | Critical | Resolved | TAL |

### Resolved Lessons

| ID | Title | Resolved In | Verification | 
|----|-------|-------------|--------------|
| LL-2026-002 | Agent context window overflow | Sprint 4 | Confirmed stable for 2 sprints |

---

## Applying Lessons Across Sprints

1. At the start of each sprint planning, the ADL reviews open lessons
2. Lessons with open action items are discussed during planning
3. Action items are added to the sprint backlog if they require effort
4. Completed action items are verified by QS before closing
5. Lessons that have been resolved for 2+ sprints are archived
6. Archived lessons inform the Best Practices and Patterns documents

---

## Metrics

| Metric | Purpose | Target |
|--------|---------|--------|
| Lessons captured per sprint | Measure capture rate | ≥ 2 |
| Action items completion rate | Measure follow-through | ≥ 80% |
| Time from capture to validation | Measure responsiveness | ≤ 48 hours |
| Lesson recurrence rate | Measure effectiveness | Decreasing |
