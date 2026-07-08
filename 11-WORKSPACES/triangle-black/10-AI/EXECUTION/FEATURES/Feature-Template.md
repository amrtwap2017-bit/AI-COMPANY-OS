# Feature Template

## 1. Feature ID

**Field:** `FEAT-{NNN}`
**Guidance:** Auto-generated unique identifier. Assigned upon registration in the Feature Catalog.

---

## 2. Title

**Field:** `{Concise feature name}`
**Guidance:** Format: `[Action] - [Object/Outcome]`. Example: "Submit Identity Documents for Verification". Max 60 characters.

---

## 3. Epic Link

**Field:** `EPIC-{NNN}: {Epic Title}`
**Guidance:** Reference to the parent epic. Each feature must belong to exactly one epic. Features without epic linkage are not accepted into the catalog.

---

## 4. Description

**Field:** `{Detailed description of the feature}`
**Guidance:** 1-3 paragraphs describing:
- What the feature does from a user or system perspective
- The problem it solves or opportunity it enables
- Key functional and non-functional aspects
- How it fits within the broader epic

---

## 5. Business Value

| Dimension | Description |
|-----------|-------------|
| User Impact | {How this feature benefits the end user} |
| Business Impact | {How this feature benefits the organization} |
| Value Category | {Revenue / Cost / Experience / Efficiency / Compliance / Risk} |
| Success Metric | {Specific, measurable metric} |
| Target Outcome | {Expected value or improvement} |

**Guidance:** Be specific about the measurable outcome. Avoid generic statements like "improves user experience". Instead, specify "reduces document submission time by 30%".

---

## 6. Acceptance Criteria

```
Scenario: {Scenario name}
Given {precondition}
When {action}
Then {expected outcome}
```

**Guidance:** Use Given/When/Then format. Include multiple scenarios to cover:
- Happy path
- Error conditions
- Edge cases
- Security considerations
- Performance expectations

---

## 7. Scope

### In Scope
- {Item 1}
- {Item 2}
- {Item 3}

### Out of Scope
- {Item 1}
- {Item 2}
- {Item 3}

**Guidance:** Clear scope boundaries prevent feature creep. Documenting what is NOT included is equally important as documenting what is included.

---

## 8. Dependencies

| Dependency ID | Type | Description | Source | Status |
|--------------|------|-------------|--------|--------|
| DEP-{NNN} | {Technology/Data/API/UI/External/Platform} | {Description} | {Team/System} | {Open/Resolved} |

**Guidance:** Identify both internal and external dependencies. Include API dependencies, data source dependencies, UI component dependencies, and cross-team dependencies.

---

## 9. Effort Estimate

**T-Shirt Size:** {XS / S / M / L / XL}
**Story Points (Range):** {Low} - {High}
**Sprint Duration:** {1 / 2 / 3+} sprints

**Guidance:** Features should ideally be sized for delivery within 1-2 sprints. Features larger than 3 sprints should be split into smaller features.

---

## 10. Risk

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| {Risk description} | H/M/L | H/M/L | {Mitigation approach} |

**Guidance:** Identify feature-specific risks. Technical complexity, data quality issues, API instability, and unclear requirements are common feature risks.

---

## 11. UX References

| Artifact Type | Reference | Location |
|---------------|-----------|----------|
| Wireframe | {Name/ID} | {Link} |
| Mockup | {Name/ID} | {Link} |
| Prototype | {Name/ID} | {Link} |
| User Flow | {Name/ID} | {Link} |

**Guidance:** Link to all UX artifacts that define the feature's user interface and interaction design. Include version numbers.

---

## 12. Technical Notes

- {Note 1: Architectural decisions, design patterns, or technical constraints}
- {Note 2: Integration points, data models, or algorithm choices}
- {Note 3: Performance considerations, security requirements, or scalability notes}

**Guidance:** Capture technical context that informs implementation. This section is written by or in consultation with the Technical Lead. Avoid implementation details that belong in stories.

---

## 13. Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 0.1 | {Date} | {Name} | Initial draft |
| 1.0 | {Date} | {Name} | Approved |
| {N} | {Date} | {Name} | {Change description} |
