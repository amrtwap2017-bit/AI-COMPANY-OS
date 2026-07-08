# Repository Standards

| Field | Value |
|---|---|
| Document ID | 00-Governance-01 |
| Document Purpose | Define the rules and conventions for this repository |
| Version | 1.0 |
| Status | Approved |

## Structure

- Every folder is numbered for ordering: 00, 01, 02, ...
- Every folder has a README.md explaining its contents
- Documents use Markdown format (.md)
- Files use kebab-case naming: `file-name.md`
- Maximum file length: 2000 lines (split if exceeded)

## Document Header

Every document must begin with:

```markdown
# Title
| Field | Value |
|---|---|
| Document ID | {FOLDER}-{NUMBER} |
| Document Purpose | One sentence |
| Version | x.y |
| Status | Draft / Review / Approved / Superseded |
```

## Cross-Referencing

- Reference other documents by their relative path
- Use `[text](path/to/file.md)` for links
- Never duplicate information — reference instead
- Keep cross-reference map in MASTER_CONTEXT.md

## Versioning

- Major version: breaking changes to scope or architecture
- Minor version: additions, clarifications, corrections
- CHANGELOG.md must be updated with every change
