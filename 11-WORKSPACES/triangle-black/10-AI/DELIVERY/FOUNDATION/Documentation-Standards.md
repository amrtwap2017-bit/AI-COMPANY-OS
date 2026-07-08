# Documentation Standards

> Standards for every document generated within the Enterprise AI Delivery Framework.

## Required Frontmatter

Every document MUST include the following frontmatter block at the top:

```markdown
# Title

> One-line summary of the document's purpose.
```

## Document Structure

| Section | Required | Notes |
|---------|----------|-------|
| Title + summary | Yes | H1 with > quote |
| Metadata table | Yes | Author, version, status, last updated |
| Introduction | Yes | 2-3 sentences on what this document covers |
| Body | Yes | Structured content with headings |
| References | Yes | Links to related documents |
| Changelog | Yes | Version history for the document |

## Metadata Pattern

```markdown
| Attribute | Value |
|-----------|-------|
| Author | [Role/Agent Name] |
| Version | [SemVer] |
| Status | Draft / Review / Approved / Superseded |
| Last Updated | [Date] |
```

## Writing Standards

- Use active voice
- One idea per paragraph
- Use tables for structured data
- Use code blocks for technical specifications
- Use Mermaid or ASCII diagrams for architecture
- Every claim must be verifiable or referenceable
- Avoid ambiguous terms: "soon," "later," "maybe"
- Be specific: "within 24 hours" not "quickly"

## Cross-References

When referencing another document:
```markdown
See [AI Constitution](00-FOUNDATION/AI-CONSTITUTION.md) Article 5 for quality gate requirements.
```

When referencing an external standard:
```markdown
Complies with [RFC 7807](https://tools.ietf.org/html/rfc7807) Problem Details for HTTP APIs.
```
