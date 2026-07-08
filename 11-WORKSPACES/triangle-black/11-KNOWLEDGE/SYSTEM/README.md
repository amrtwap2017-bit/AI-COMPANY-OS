# Knowledge Management System

## Overview

The EADF Knowledge Management System (KMS) is the centralized repository for capturing, organizing, versioning, and retrieving knowledge generated across all program activities. It ensures that insights, patterns, decisions, and learnings persist beyond individual sprints and are accessible to all agents and humans.

---

## Knowledge Capture Principles

1. **Capture once, use many times**: Knowledge is recorded in one canonical location and referenced from elsewhere.
2. **Low friction**: Recording knowledge requires minimal overhead. Templates and automation reduce capture effort.
3. **Versioned and traceable**: All knowledge artifacts are version controlled, with clear provenance and change history.
4. **Discoverable**: Knowledge is categorized, tagged, and indexed for retrieval by humans and agents alike.
5. **Actionable**: Knowledge is structured to inform decisions, not merely stored for reference.

---

## Knowledge Taxonomy

Knowledge is organized into eight categories within the `12-KNOWLEDGE/` directory:

| Directory | Content | Update Frequency |
|-----------|---------|------------------|
| `Lessons-Learned.md` | Insights from retrospectives and incidents | Per sprint |
| `Patterns.md` | Reusable solutions to common problems | As discovered |
| `Anti-Patterns.md` | Common mistakes and how to avoid them | As discovered |
| `Architecture-Library.md` | Reference architectures and design resources | As needed |
| `Prompt-Library.md` | Index and catalog of all prompt templates | Per sprint |
| `Best-Practices.md` | Accumulated wisdom on EADF usage | Per sprint |
| `Framework-Evolution.md` | EADF versioning and change management | Per release |
| `README.md` | This file — system overview and navigation | As needed |

---

## Knowledge Lifecycle

```
Identify → Capture → Review → Organize → Publish → Retrieve → Apply → Evolve
```

| Stage | Description | Owner |
|-------|-------------|-------|
| Identify | Recognize knowledge worth capturing | Any team member or agent |
| Capture | Record knowledge using standardized template | Originator |
| Review | Validate accuracy, relevance, uniqueness | TAL or ADL |
| Organize | Categorize, tag, link to related knowledge | TAL |
| Publish | Commit to repository, announce to team | TAL |
| Retrieve | Search and access knowledge for use | Any |
| Apply | Use knowledge to inform decisions and work | Any |
| Evolve | Update knowledge as context changes | ADL |

---

## Versioning Strategy

| Knowledge Type | Version Scheme | Changelog |
|----------------|---------------|-----------|
| Patterns/Anti-patterns | Semantic (1.0.0) | Per update |
| Prompt Library | Sprint-based (v1.2-s3) | Per sprint |
| Best Practices | Date-based (2026-Q2) | Per quarter |
| Lessons Learned | Sprint-based (S12-L3) | Per sprint |
| Architecture Library | Date-based (2026-07) | Per addition |
| Framework Evolution | Semantic (2.1.0) | Per release |

---

## Retrieval Methods

### For Humans
- Directory browsing via file explorer or IDE
- Full-text search across markdown files
- Cross-reference links between knowledge documents
- Table of contents in each document
- Index file in `12-KNOWLEDGE/` linking key topics

### For Agents
- Context injection: relevant knowledge loaded into agent context at sprint start
- Retrieval-augmented generation (RAG): agents query knowledge base via search tools
- Prompt attachment: specific patterns or lessons attached to task prompts
- Automated linking: agent tools auto-suggest relevant knowledge based on task type

---

## Quality Standards

All knowledge entries must meet these criteria:

1. **Accurate**: Factually correct and verified
2. **Relevant**: Addresses a real need or problem
3. **Clear**: Written in plain language, free of ambiguity
4. **Concise**: No extraneous content; gets to the point
5. **Actionable**: Provides guidance that can be directly applied
6. **Traceable**: Includes source, author, date, and version
7. **Linked**: Cross-references related knowledge entries

---

## Maintenance

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Knowledge audit | Quarterly | ADL |
| Orphan check | Quarterly | TAL |
| Relevance review | Per sprint | QS |
| Link validation | Per release | TAL |
| Archive stale entries | Per release | ADL |

---

## Directory Index

| File | Purpose | Read by |
|------|---------|---------|
| `Lessons-Learned.md` | Retrospective insights and actions | All |
| `Patterns.md` | Reusable solution templates | Agents + TAL |
| `Anti-Patterns.md` | Common pitfalls to avoid | All |
| `Architecture-Library.md` | Reference architectures | TAL + Agents |
| `Prompt-Library.md` | Prompt templates catalog | All |
| `Best-Practices.md` | Operational wisdom | All |
| `Framework-Evolution.md` | EADF change history | ADL + TAL |
