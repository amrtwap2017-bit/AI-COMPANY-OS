# Epic Template

## 1. Epic ID

**Field:** `EPIC-{NNN}`
**Guidance:** Auto-generated unique identifier. Assigned upon registration in the Epic Catalog.

---

## 2. Title

**Field:** `{Concise, business-readable name}`
**Guidance:** Format: `[Capability Area] - [Action/Outcome]`. Example: "Customer Onboarding - Automate Identity Verification". Max 80 characters.

---

## 3. Description

**Field:** `{Detailed description of the epic}`
**Guidance:** 2-4 paragraphs describing:
- What problem or opportunity this epic addresses
- The context and background
- What the epic will deliver at a high level
- Why this approach was chosen

---

## 4. Strategic Objective

**Field:** `{Reference to strategic objective}`
**Guidance:** Link to the strategic objective this epic serves. Reference the objective ID from the Enterprise Blueprint (Program 1). Objectives include: revenue growth, cost optimization, customer experience, operational excellence, compliance, innovation.

---

## 5. Business Capability

**Field:** `{Business capability mapping}`
**Guidance:** Identify the business capability(s) from the Enterprise Blueprint (Program 1) that this epic enables or enhances. Format: `CAP-{NNN}: {Capability Name}`. List primary and secondary capabilities.

---

## 6. Expected Value

| Dimension | Expected Impact | Measurement |
|-----------|----------------|-------------|
| Revenue Impact | {Description} | {Metric} |
| Cost Savings | {Description} | {Metric} |
| Customer Satisfaction | {Description} | {Metric} |
| Operational Efficiency | {Description} | {Metric} |
| Risk Reduction | {Description} | {Metric} |
| Compliance | {Description} | {Metric} |

**Guidance:** Quantify where possible. Use ranges for uncertain estimates. Each dimension should include the specific metric and target value (e.g., "Reduce processing time by 40%").

---

## 7. Acceptance Criteria

The epic is considered complete when:

1. {Criterion 1 — specific, measurable condition}
2. {Criterion 2 — specific, measurable condition}
3. {Criterion 3 — specific, measurable condition}
4. {Criterion 4 — specific, measurable condition}
5. {Criterion 5 — specific, measurable condition}

**Guidance:** Each criterion must be verifiable. Avoid subjective language. Criteria should be testable through demonstration, metrics, or inspection.

---

## 8. Scope

### In Scope

- {Item 1}
- {Item 2}
- {Item 3}

### Out of Scope

- {Item 1}
- {Item 2}
- {Item 3}

**Guidance:** Be explicit about boundaries. Clear out-of-scope items prevent scope creep. Use actionable descriptions rather than vague categories.

---

## 9. Dependencies

| Dependency ID | Type | Description | External? | Status |
|--------------|------|-------------|-----------|--------|
| DEP-{NNN} | Technical/Data/API/UI/External | {Description} | Yes/No | Open/Resolved |
| DEP-{NNN} | Technical/Data/API/UI/External | {Description} | Yes/No | Open/Resolved |

**Guidance:** Identify all dependencies that must be satisfied before or during epic execution. Include external dependencies on vendors, partners, or other programs.

---

## 10. Estimated Effort

**T-Shirt Size:** {XS / S / M / L / XL / XXL}
**Story Points (Range):** {Low} - {High}
**Sprint Estimate:** {Number of sprints}

| Phase | Effort Estimate | Confidence |
|-------|----------------|------------|
| Discovery | {Story points or sprints} | {High/Medium/Low} |
| Design | {Story points or sprints} | {High/Medium/Low} |
| Development | {Story points or sprints} | {High/Medium/Low} |
| Testing | {Story points or sprints} | {High/Medium/Low} |
| Deployment | {Story points or sprints} | {High/Medium/Low} |

**Guidance:** Use t-shirt sizing for initial estimation during identification. Refine to story point ranges during definition. Update estimates as more information becomes available.

---

## 11. Risk Assessment

| Risk ID | Description | Probability | Impact | Mitigation | Owner |
|---------|-------------|-------------|--------|------------|-------|
| RISK-{NNN} | {Risk description} | H/M/L | H/M/L | {Mitigation strategy} | {Owner} |
| RISK-{NNN} | {Risk description} | H/M/L | H/M/L | {Mitigation strategy} | {Owner} |

**Guidance:** Identify top 5-10 risks. Probability and impact ratings follow: H=High, M=Medium, L=Low. Track risk responses and reassess at each epic review.

---

## 12. Stakeholders

| Role | Name | Organization | Expectations |
|------|------|-------------|-------------|
| Epic Owner | {Name} | {Team/Dept} | {Key expectation} |
| Program Manager | {Name} | {Team/Dept} | {Key expectation} |
| Product Owner | {Name} | {Team/Dept} | {Key expectation} |
| Technical Lead | {Name} | {Team/Dept} | {Key expectation} |
| Business Sponsor | {Name} | {Team/Dept} | {Key expectation} |
| Key Stakeholder | {Name} | {Team/Dept} | {Key expectation} |

**Guidance:** Include both internal and external stakeholders. Document their specific expectations to ensure alignment. Update as stakeholders change during the epic lifecycle.

---

## 13. Version History

| Version | Date | Author | Change Description |
|---------|------|--------|-------------------|
| 0.1 | {Date} | {Name} | Initial draft |
| 1.0 | {Date} | {Name} | Approved |
| {N} | {Date} | {Name} | {Change description} |
