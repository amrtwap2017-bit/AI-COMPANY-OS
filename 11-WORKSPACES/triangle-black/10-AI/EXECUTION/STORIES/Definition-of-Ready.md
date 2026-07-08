# Definition of Ready

## Overview

The Definition of Ready (DoR) establishes the pre-conditions that a user story must satisfy before development work can begin. A story that meets the DoR has been sufficiently refined, estimated, and validated to give the team confidence in deliverability. No story enters a sprint unless it meets all DoR criteria.

## DoR Criteria

### 1. Story Approved

- [ ] The story has been reviewed and approved by the Product Owner.
- [ ] The story aligns with the feature roadmap and sprint goals.
- [ ] Business value is clearly stated in the "so that" clause.
- [ ] The story title and description are finalized.

### 2. Acceptance Criteria Defined

- [ ] Acceptance criteria are written in Condition → Expected Result format.
- [ ] Each criterion is objectively testable (pass/fail).
- [ ] Criteria cover standard flow, error cases, and edge cases.
- [ ] Criteria have been reviewed by QA.
- [ ] Criteria have been reviewed by Engineering.
- [ ] Criterion priorities are assigned (Must / Should / Could).

### 3. BDD Scenarios Written

- [ ] At least one standard flow scenario is documented.
- [ ] Error flow and edge case scenarios are documented for complex stories.
- [ ] BDD scenarios follow the Given/When/Then format.
- [ ] Scenarios use concrete data values.
- [ ] Scenarios have been reviewed by the Product Owner.

### 4. Dependencies Identified

- [ ] All upstream dependencies (stories this one needs) are documented.
- [ ] All downstream effects (stories blocked by this one) are documented.
- [ ] External dependencies (third-party services, API availability) are identified.
- [ ] Dependency risks are assessed and mitigation plans exist.

### 5. Effort Estimated

- [ ] Story points have been assigned using the Fibonacci sequence (1, 2, 3, 5, 8, 13).
- [ ] The estimate was derived through team consensus (planning poker or equivalent).
- [ ] Stories exceeding 13 points have been split.
- [ ] Estimation variance is within acceptable range (max 2x between highest and lowest estimate).

### 6. Design References Available

- [ ] Architecture diagram or design document is referenced (if applicable).
- [ ] API contract specifications are linked (if API changes are involved).
- [ ] Data model changes are documented.
- [ ] Integration points with existing services are identified.

### 7. UX Mockups Ready (if applicable)

- [ ] UI mockups or wireframes are approved by Product Owner.
- [ ] Mockups cover all states: default, empty, error, loading, edge cases.
- [ ] Accessibility requirements are noted.
- [ ] Responsive design requirements are specified.
- [ ] Design system components are identified (no new component creation needed without prior approval).

### 8. Dev Environment Readiness

- [ ] Required sandbox or test environment is available.
- [ ] Test data sets are identified or prepared.
- [ ] Feature flags are configured (if needed).
- [ ] Required service credentials or permissions are provisioned.

## DoR Checklist Summary

```
Story: [US-XXX] [Title]

[ ] Story approved by Product Owner
[ ] Acceptance criteria defined and reviewed
[ ] BDD scenarios written
[ ] Dependencies identified
[ ] Effort estimated (points: ___)
[ ] Design references available
[ ] UX mockups ready (N/A if no UI changes)
[ ] Dev environment ready
```

## DoR Escalation

If a story cannot meet all DoR criteria within the refinement period:

1. Identify which criteria are not met and why.
2. Determine if the story should be returned to Draft for further refinement.
3. If the blocker is a dependency, flag the dependency story for prioritization.
4. If the blocker is information availability, schedule a cross-team sync.
5. Document the gap and escalate to the Scrum Master or Program Manager.

Stories that fail DoR but are "pulled through" under pressure carry significant execution risk. Teams should resist the temptation to begin work on stories that are not fully ready, as this typically results in rework, missed estimates, and quality issues.

## DoR Exception Process

In rare cases where a story must enter development before meeting all DoR criteria (e.g., time-critical security fix), an exception may be granted by the Program Manager. The exception must:

- Be documented with the specific criteria waived and the rationale.
- Include a remediation plan with dates for fulfilling the waived criteria.
- Be time-boxed — the exception is automatically reviewed after 5 business days.
- Be escalated to the Engineering Director for approval.
