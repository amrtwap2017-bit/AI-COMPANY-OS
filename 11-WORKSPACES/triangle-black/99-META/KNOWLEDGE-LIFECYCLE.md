# Knowledge Lifecycle — Triangle Black

## Lifecycle Stages

| Stage | Description | Action |
|-------|-------------|--------|
| **Draft** | Initial creation, not yet reviewed | Store in working directory |
| **Active** | Current source of truth | Primary reference, vectorized |
| **Frozen** | Approved, immutable without ADR | Reference only, vectorized |
| **Superseded** | Replaced by newer version | Moved to archive, cross-reference added |
| **Historical** | No longer operationally relevant | Archived, not vectorized |

## Current State by Layer

| Layer | Status | Lifecycle | Next Review |
|-------|--------|-----------|-------------|
| 00-ARCHITECT | Frozen | Active/Reference | Quarterly |
| 01-EXECUTIVE | Complete | Active | Annually |
| 02-GOVERNANCE | Frozen | Active/Reference | Quarterly |
| 03-BUSINESS | Complete | Active | Semi-annually |
| 04-DESIGN | Frozen | Reference | Per ADR |
| 05-ENGINEERING | Frozen | Active/Reference | Per ADR |
| 06-DOMAINS | Complete | Active | Semi-annually |
| 07-INTEGRATION | Draft | Active | Per release |
| 08-OPERATIONS | Draft | Active | Per go-live |
| 09-EVOLUTION | Draft | Active | Annually |
| 10-AI | Frozen | Reference | Quarterly |
| 11-KNOWLEDGE | Draft | Active | Per release |
| 12-SHARED | Frozen | Active/Reference | Semi-annually |

## Archive Policy

1. **Move to `13-ARCHIVE/`** when superseded by newer document
2. **Keep original file** in archive with `superseded-by: [path]` in metadata
3. **Add cross-reference** in the new document pointing to archived version
4. **Never delete** — always move to archive
5. **Archived documents** are NOT vectorized by default

## Review Cadence

| Layer | Review Cycle | Owner |
|-------|-------------|-------|
| Architecture principles | Quarterly | CTO |
| ADRs | Per decision | Architect |
| Business docs | Semi-annually | Product |
| Domain specs | Per sprint | Domain experts |
| Engineering standards | Quarterly | Tech Lead |
| AI context packs | Per release | AI Team |
