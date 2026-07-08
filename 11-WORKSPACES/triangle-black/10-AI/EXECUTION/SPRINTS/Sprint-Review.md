# Sprint Review

## Overview

The Sprint Review is the second-to-last event of the sprint. Its purpose is to inspect the increment of work completed during the sprint, demonstrate results to stakeholders, gather feedback, and validate progress against the sprint goal. The Sprint Review is a working session, not a presentation.

**Duration: 1 hour maximum** for a standard 2-week sprint. Shorter sprints (1 week) use a 30-minute review window.

## Participants

| Participant | Role in Review |
|---|---|
| **AI Agents** | Demonstrate completed work, answer technical questions, show quality metrics |
| **Program Manager AI** | Facilitates the review, presents sprint goal status, compiles metrics |
| **Human Stakeholders** | Provide feedback, accept or reject deliverables, clarify future priorities |
| **Other AI Agents (optional)** | Observe for cross-team learning; may provide input on integrations |

## Review Format

### 1. Sprint Goal Review (10 minutes)

- Restate the sprint goal.
- Present the goal achievement score: Achieved / Partially Achieved / Not Achieved / Obsolete.
- If partially achieved or not achieved, explain the gap and root cause.
- Demonstrate the sprint goal outcome live (or via recorded/automated demo).

### 2. Completed Work Demonstration (25 minutes)

- For each completed backlog item, briefly demonstrate the deliverable:
  - **Feature work**: Live demo or automated test pass showing the feature working against acceptance criteria.
  - **Infrastructure/technical work**: Show evidence — pipeline output, performance benchmark, security scan report, architecture diagram.
  - **Documentation**: Link to published documentation and highlight key sections.
- Focus on outcomes, not implementation details. Stakeholders should see what was built, not how it was built.
- If a backlog item was partially completed, show what is working and what remains.

### 3. Metrics Review (10 minutes)

| Metric | Value | Trend |
|---|---|---|
| Sprint Goal Achievement | X% | vs. last sprint |
| Planned Story Points | X | - |
| Completed Story Points | X | Δ from last sprint |
| Story Completion Rate | X% | Δ from last sprint |
| Task Completion Rate | X% | Δ from last sprint |
| Quality Gate Pass Rate | X% | Δ from last sprint |
| Rework Rate | X% | Δ from last sprint |
| Escaped Defects | N | Δ from last sprint |

- Present the sprint metrics dashboard.
- Highlight notable improvements or regressions.
- Brief discussion of what contributed to the metric trends.

### 4. What Went Well / Challenges (10 minutes)

- AI agents and stakeholders share observations:
  - What went well this sprint? What should we keep doing?
  - What challenges did we face? What should we change?
  - Are there any insights for the upcoming retrospective?
- This is a facilitated discussion, not a blame session.

### 5. Feedback and Next Steps (5 minutes)

- Stakeholders provide feedback on the delivered increment:
  - Does the delivered work meet the intended need?
  - Are there adjustments or clarifications needed?
  - What is the highest-priority item for the next sprint?
- Capture all feedback in the sprint review notes.
- Confirm the date and time for the next sprint planning.

## Review Template

```
Sprint Review — Sprint [N]

Date: [YYYY-MM-DD]
Participants: [List]

1. Sprint Goal
   Goal: [Goal Statement]
   Achievement: [Achieved / Partially Achieved / Not Achieved / Obsolete]
   Gap Explanation (if applicable): [Explanation]

2. Completed Backlog Items
   | Backlog Item | Status | Demo Evidence |
   |--------------|--------|---------------|
   | [BI-001]     | Done   | [link/evidence] |
   | [BI-002]     | Done   | [link/evidence] |
   | [BI-003]     | Partial | [link/evidence] |

3. Metrics
   Sprint Goal Achievement: X%
   Planned Story Points: X
   Completed Story Points: X
   Story Completion Rate: X%
   Task Completion Rate: X%
   Quality Gate Pass Rate: X%
   Rework Rate: X%
   Escaped Defects: N
   Cycle Time (avg): X hours

4. What Went Well
   - [Item 1]
   - [Item 2]

5. Challenges
   - [Item 1]
   - [Item 2]

6. Stakeholder Feedback
   - [Feedback item 1]
   - [Feedback item 2]

7. Next Sprint Priority Guidance
   - [Guidance from stakeholders]
```

## Rules of Sprint Review

1. **Do not skip the demo.** Stakeholders must see working software or evidence of completion. Reading from a task list is not sufficient.
2. **Only completed or meaningfully partial work is shown.** Work that is in progress but not demonstrable is deferred to a future review.
3. **The review is about the product, not the process.** Process improvement is discussed in the Sprint Retrospective, not the Sprint Review.
4. **Feedback is captured, not debated.** Stakeholder feedback is recorded and considered during the next sprint planning. The review is not the place to argue about requirements.
5. **The sprint goal is the yardstick.** All evaluation of success starts with the sprint goal, not individual task completion.
