# Story Writing Standards

## The INVEST Principle in Depth

### Independent

Stories should be self-contained and deliverable independently of other stories. Independence enables flexible prioritization, parallel development, and minimizes coordination overhead.

**How to achieve independence:**
- Identify and document dependencies explicitly rather than bundling stories together.
- Use dependency declarations (Depends On / Blocking) rather than merging related stories.
- Design stories to deliver value even if upstream stories are delayed — consider fallback behaviors.

### Negotiable

Stories are an invitation to conversation, not a fixed specification. Details emerge through collaboration between product owners, engineers, and QA.

**How to maintain negotiability:**
- Keep stories concise — two to three sentences plus bulleted acceptance criteria.
- Avoid prescribing implementation details in the story description.
- Reserve technical decisions for task decomposition and technical notes.

### Valuable

Every story must deliver identifiable value to a user, customer, or internal stakeholder. Value must be stated explicitly in the "so that" clause.

**How to verify value:**
- Ask: "Who benefits from this story and how?"
- If the answer is unclear, the story needs more refinement.
- Stories should not describe pure technical work — refactoring, infrastructure, or tooling improvements should be framed in terms of the value they enable (e.g., "so that deployment time is reduced by 40%").

### Estimable

Teams must be able to estimate effort with reasonable confidence. Stories that are too large, vague, or poorly understood cannot be reliably estimated.

**How to ensure estimability:**
- Split stories that exceed 13 story points.
- Include technical notes for known complexities.
- Hold refinement sessions where the team can ask clarifying questions.
- If estimation variance exceeds 100% (e.g., estimates range from 3 to 13), split the story.

### Small

Stories should be completable within a single sprint (typically 1–5 days of effort). Small stories reduce risk, improve predictability, and increase throughput.

**Story sizing guidelines:**

| Points | Effort       | Typical Scope                                      |
|--------|-------------|----------------------------------------------------|
| 1      | 2–4 hours   | A simple UI change, one API parameter, text update |
| 2      | 4–8 hours   | Single endpoint, small component, basic validation |
| 3      | 8–16 hours  | New page, moderate service logic, data migration   |
| 5      | 16–24 hours | Feature slice with backend + frontend work         |
| 8      | 24–40 hours | Complex workflow, multiple integrations            |
| 13     | 40–80 hours | Large story that should likely be split            |

### Testable

Acceptance criteria must be unambiguous and objectively verifiable. If a tester cannot determine with certainty whether a criterion passes or fails, the story is not testable.

**How to ensure testability:**
- Write acceptance criteria as concrete conditions with expected results.
- Avoid subjective terms like "fast", "responsive", "user-friendly", or "clean".
- Replace with measurable thresholds: "under 200ms", "fits within 1024px viewport", "completes without error".
- Include BDD scenarios for nontrivial behavior.

## Good Stories vs Bad Stories

| Aspect         | Good Story                                        | Bad Story                                           |
|----------------|--------------------------------------------------|------------------------------------------------------|
| Title          | "Admin can revoke agent credentials via UI"       | "Agent stuff"                                       |
| Description    | "As a platform admin, I want to revoke..."       | "Fix the agent management screen"                   |
| Acceptance     | "Credential revoked within 2 seconds"             | "Should work well"                                  |
| Size           | 5 points — fits neatly in a sprint                | 21 points — spans multiple sprints                  |
| Dependencies   | Explicitly linked to US-012                       | No dependencies listed despite known blockers       |
| Value          | "so that compromised agents are decommissioned"  | No benefit stated                                   |
| Testability    | Tests pass/fail based on documented criteria      | Cannot determine when the story is truly done       |

## Story Writing Checklist

Before a story enters the Ready state, verify the following:

- [ ] Story has a unique ID and descriptive title.
- [ ] Story is linked to a parent feature.
- [ ] Description uses the standard "As a... I want... So that..." format.
- [ ] The "so that" clause articulates a clear business benefit.
- [ ] Acceptance criteria are written as testable conditions.
- [ ] At least one BDD scenario exists for complex stories.
- [ ] Technical notes capture known implementation considerations.
- [ ] Effort estimate is provided using story points.
- [ ] Priority is assigned using MoSCoW or similar scheme.
- [ ] Dependencies are documented and up to date.
- [ ] The story passes the INVEST test for each letter.
- [ ] The story is small enough to complete in one sprint.
- [ ] UX mockups or design references are linked if visual changes are involved.
- [ ] API contract changes are noted in technical notes.
- [ ] The story has been reviewed by at least one other team member.
