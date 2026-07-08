# Program Charter

## Purpose

The Program Charter is the foundational governance document that formally authorizes a program. It defines the program's purpose, scope, objectives, key deliverables, budget, timeline, stakeholders, and success criteria. The charter serves as the single source of truth for what the program is, why it exists, what it will deliver, and how it will be governed.

The charter is developed during the Define stage and approved by the executive sponsor and portfolio review board before any significant investment is made.

## Charter Approval Workflow

The charter approval process ensures appropriate diligence and stakeholder alignment:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   DRAFT      │───>│   REVIEW     │───>│   APPROVE    │───>│   PUBLISH    │
│   (PM)       │    │ (Stakeholders)│    │  (Sponsor)   │    │  (PMO)       │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                  │                   │                   │
       │ Initial draft    │ Feedback,         │ Final sign-off    │ Distributed to
       │ by Program       │ revisions         │ by sponsor        │ all stakeholders
       │ Manager          │ incorporated      │ and PRB           │
       └──────────────────┴───────────────────┴───────────────────┘
```

### Approval Stages

| Stage | Owner | Activity | Duration |
|-------|-------|----------|----------|
| **Draft** | Program Manager | Develop charter content, engage key stakeholders for input | 1-2 weeks |
| **Review** | Stakeholders | Circulate for feedback, conduct review meeting, incorporate revisions | 1 week |
| **Approve** | Executive Sponsor | Final review and signature, portfolio review board concurrence | 1 week |
| **Publish** | PMO | Distribute to stakeholders, store in program repository, activate program | 1 day |

### Change Control

Charter changes require a formal amendment process:
- **Minor changes** (e.g., timeline adjustments within tolerance): Program Manager approves, sponsor notified
- **Major changes** (e.g., scope change, budget increase, timeline extension beyond tolerance): Sponsor and portfolio review board approval required
- **Critical changes** (e.g., program cancellation, fundamental objective change): Executive leadership approval required

## Program Charter Template

```
==========================================================================
PROGRAM CHARTER
==========================================================================

1. PROGRAM IDENTIFICATION
--------------------------------------------------------------------------
Program Name:       {Descriptive program name}
Program ID:         PROG-{NNN}
Portfolio:          {PORT-NNN} — {Portfolio Name}
Strategic Objective: {OBJ-NNN} — {Objective Name}

2. AUTHORIZATION
--------------------------------------------------------------------------
Executive Sponsor:  {Name, Title}
Program Manager:    {Name, Title}
Date:               {Date}
Version:            {Version number}

3. EXECUTIVE SUMMARY
--------------------------------------------------------------------------
{2-3 paragraph summary of the program covering:
 - What problem or opportunity the program addresses
 - What the program will deliver
 - Why it is important to the enterprise
 - How success will be measured}

4. PROGRAM OBJECTIVE
--------------------------------------------------------------------------
{Clear, concise statement of the program's primary objective. This should
 be specific, measurable, and time-bound.}

Example: "Deliver an enterprise AI/ML platform that enables 80% of
 business units to deploy production AI models within 6 months of
 identification, reducing model deployment time from 12 weeks to 2 weeks."

5. SCOPE
--------------------------------------------------------------------------
IN SCOPE:
- {Item included in program scope}
- {Item included in program scope}
- {Item included in program scope}

OUT OF SCOPE:
- {Item explicitly excluded from program scope}
- {Item explicitly excluded from program scope}

BOUNDARIES:
- {Organizational boundaries, system boundaries, geographic boundaries}

6. KEY DELIVERABLES
--------------------------------------------------------------------------
ID         | Deliverable                     | Description
-----------|---------------------------------|--------------------------------
DEL-001    | {Deliverable name}              | {Brief description}
DEL-002    | {Deliverable name}              | {Brief description}
DEL-003    | {Deliverable name}              | {Brief description}

7. BUDGET
--------------------------------------------------------------------------
Cost Category          | Estimated Cost
-----------------------|----------------
Labor                  | ${Amount}
Technology             | ${Amount}
Infrastructure         | ${Amount}
External Services      | ${Amount}
Contingency            | ${Amount}
------------------------|----------------
TOTAL                  | ${Amount}

8. TIMELINE
--------------------------------------------------------------------------
Start Date:            {Date}
End Date:              {Date}
Duration:              {Months} months

KEY MILESTONES:
--------------------------------------------------------------------------
Milestone ID | Milestone Name                | Target Date
-------------|-------------------------------|-------------
MS-001       | {Milestone name}              | {Date}
MS-002       | {Milestone name}              | {Date}
MS-003       | {Milestone name}              | {Date}

9. STAKEHOLDERS
--------------------------------------------------------------------------
Stakeholder | Role              | Interest Level | Influence Level
------------|-------------------|----------------|-----------------
{Name}      | {Title}           | High/Medium/Low | High/Medium/Low
{Name}      | {Title}           | High/Medium/Low | High/Medium/Low

10. SUCCESS CRITERIA
--------------------------------------------------------------------------
Criteria ID | Criteria Description                   | Target | Measurement Method
------------|----------------------------------------|--------|-------------------
SC-001      | {Measurable success criterion}         | {Value}| {How measured}
SC-002      | {Measurable success criterion}         | {Value}| {How measured}
SC-003      | {Measurable success criterion}         | {Value}| {How measured}

11. DEPENDENCIES
--------------------------------------------------------------------------
ID          | Dependency Description                 | Type      | Source Program
------------|----------------------------------------|-----------|---------------
DEP-001     | {Dependency description}               | {Type}    | {Source}
DEP-002     | {Dependency description}               | {Type}    | {Source}

12. ASSUMPTIONS
--------------------------------------------------------------------------
- {Assumption 1}
- {Assumption 2}
- {Assumption 3}

13. CONSTRAINTS
--------------------------------------------------------------------------
- {Constraint 1 (e.g., fixed end date, fixed budget)}
- {Constraint 2 (e.g., must use approved technology stack)}
- {Constraint 3 (e.g., must comply with regulatory requirements)}

14. RISKS
--------------------------------------------------------------------------
Risk ID | Risk Description              | Probability | Impact  | Mitigation Strategy
--------|-------------------------------|-------------|---------|-------------------
RIS-001 | {Risk description}            | H/M/L       | H/M/L   | {Mitigation approach}
RIS-002 | {Risk description}            | H/M/L       | H/M/L   | {Mitigation approach}

15. GOVERNANCE
--------------------------------------------------------------------------
Governance Body        | Cadence       | Responsibilities
-----------------------|---------------|-----------------
Program Board          | Monthly       | Strategic direction, resource decisions
Steering Committee     | Weekly        | Tactical decisions, progress review
Stage Gate Review      | Per milestone | Go/no-go decisions

16. APPROVALS
--------------------------------------------------------------------------
Role                     | Name          | Signature     | Date
-------------------------|---------------|---------------|---------
Executive Sponsor        | {Name}        | ________      | {Date}
Portfolio Director       | {Name}        | ________      | {Date}
Program Manager          | {Name}        | ________      | {Date}

==========================================================================
```

## Charter Quality Checklist

Before a charter is submitted for approval, verify the following:

- [ ] Program objective is specific, measurable, and time-bound
- [ ] Scope clearly defines what is in and out
- [ ] Budget estimate is within portfolio allocation
- [ ] Timeline is realistic and aligned with business needs
- [ ] Key deliverables are identified and described
- [ ] Stakeholders are identified and engaged
- [ ] Success criteria are specific and measurable
- [ ] Dependencies are identified and acknowledged
- [ ] Key risks have mitigation strategies
- [ ] Governance structure is defined
- [ ] Sponsor and portfolio director have provided input
- [ ] Charter aligns with enterprise blueprint standards
