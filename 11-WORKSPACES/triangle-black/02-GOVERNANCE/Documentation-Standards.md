# Documentation Standards

## Every Document Must Include

1. **Document Purpose** — Why this document exists (one sentence)
2. **Business Value** — What business outcome this document enables
3. **Stakeholders** — Who this document serves
4. **Content** — The body of the document
5. **Business Rules** — Any rules that govern the content
6. **KPIs** — How success is measured
7. **Risks** — What could go wrong
8. **AI Opportunities** — Where AI can augment this area
9. **Exit Criteria** — When this document is considered complete
10. **Review Checklist** — Self-review before submission

## Every Module/Feature Must Include

- Business Value, Revenue Impact, Operational Impact, Customer Impact
- Future AI Opportunities, Automation, Mobile, Integrations
- KPIs, Risks, Dependencies, Exit Criteria

## Traceability Footer

Every document must end with this traceability section:

```markdown
## Traceability

| Relation | Reference |
|---|---|
| Related Business Capability | Link to Business Capability Matrix |
| Related Workflow | Link to 06-Operations/ workflow |
| Related Database Tables | Table names |
| Related APIs | API endpoints |
| Related UI | UI screens |
| Related Roles | Role(s) involved |
| Related ADR | Link to Architecture Decision Record |
| Related KPIs | Metric names |
| AI Opportunities | AI capabilities applicable to this area |
```

This creates an end-to-end traceability chain from business capability to implementation detail. Every document must be traceable. If a document cannot be traced to a business capability, its content should be questioned.

## Writing Style

- Professional, consulting-grade
- Consistent terminology (use the Ubiquitous Language from 05-Domain/)
- Short sentences. Clear structure. Bullet points for lists.
- No jargon without definition
- No duplicated information — cross-reference instead
- Arabic terms included where relevant (with English translation)
