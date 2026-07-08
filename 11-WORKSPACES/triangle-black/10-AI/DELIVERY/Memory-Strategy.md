# Enterprise Memory Strategy

> How knowledge persists across sessions, what is stored, where it lives, how it's loaded, updated, versioned, and retired.

## Memory Principles

1. **Knowledge persists across sessions** — No agent relies on chat history
2. **Structured stores over free text** — Memory is organized, tagged, and queryable
3. **Versioned** — Every memory change is tracked
4. **Auditable** — All memory writes are logged with agent, timestamp, and rationale
5. **Compressed** — Memory is stored efficiently; no raw conversation logs
6. **Access-controlled** — Memory is scoped per agent role and domain

## Memory Architecture

```
┌─────────────────────────────────────────────────────┐
│                 ENTERPRISE MEMORY                     │
├─────────────┬──────────────┬─────────────────────────┤
│  GLOBAL     │  DOMAIN      │  SESSION                 │
│  MEMORY     │  MEMORY      │  MEMORY                  │
├─────────────┼──────────────┼─────────────────────────┤
│ Immutable   │ Per bounded  │ Active session only      │
│ rules       │ context      │ Ephemeral                │
│ Constitution│ Business     │ Task context             │
│ Principles  │ rules        │ Working decisions        │
│ Stack       │ Entities     │ In-progress artifacts    │
│ Standards   │ ADRs         │                          │
└─────────────┴──────────────┴─────────────────────────┘
```

## Memory Stores

### Global Memory (Read-Only for All Agents)

| Store | Location | Contents | Updated By |
|-------|----------|----------|------------|
| AI Constitution | `00-FOUNDATION/AI-CONSTITUTION.md` | Immutable rules | Chief Executive AI + CTO |
| Enterprise Principles | `00-FOUNDATION/Enterprise-Principles.md` | Design philosophy | Chief Enterprise Architect AI |
| Architecture Baseline | `00-FOUNDATION/Architecture-Baseline.md` | System constraints | Chief Enterprise Architect AI |
| Glossary | `00-FOUNDATION/Glossary.md` | Shared language | Documentation Engineer AI |
| Naming Standards | `00-FOUNDATION/Naming-Standards.md` | Naming conventions | Documentation Engineer AI |
| Documentation Standards | `00-FOUNDATION/Documentation-Standards.md` | Doc format rules | Documentation Engineer AI |
| Decision Rules | `00-FOUNDATION/Decision-Rules.md` | ADR and escalation rules | Chief Enterprise Architect AI |
| Traceability | `00-FOUNDATION/Traceability.md` | Artifact chain rules | Documentation Engineer AI |

### Domain Memory (Per Bounded Context)

| Store | Location | Contents | Updated By |
|-------|----------|----------|------------|
| Business Rules | Domain-specific files | Rules for the domain | Business Analyst AI |
| Entity Definitions | Domain-specific files | Domain entities and VOs | Solution Architect AI |
| ADR Records | `02-DECISION-RECORDS.md` | Architecture decisions | Solution Architect AI |
| API Contracts | Domain-specific files | API specifications | Solution Architect AI |
| Domain Events | Domain-specific files | Event definitions | Solution Architect AI |

### Session Memory (Ephemeral)

| Store | Purpose | Duration |
|-------|---------|----------|
| Task Context | Current task details | Single session |
| Working Decisions | In-progress choices | Single session |
| In-progress Artifacts | Files being created/edited | Single session |
| Session Log | Full session record | Logged to audit trail |

### Knowledge Base (Persistent, Growing)

| Store | Location | Contents | Updated By |
|-------|----------|----------|------------|
| Patterns | `12-KNOWLEDGE/patterns/` | Reusable solutions | All agents |
| Anti-patterns | `12-KNOWLEDGE/anti-patterns/` | Mistakes to avoid | All agents |
| Lessons Learned | `12-KNOWLEDGE/lessons/` | Experience records | All agents |
| FAQ | `12-KNOWLEDGE/faq/` | Common questions | Documentation Engineer AI |
| Troubleshooting | `12-KNOWLEDGE/troubleshooting/` | Known issues and fixes | All agents |

## Memory Loading Sequence

Every agent loads memory in this exact order when a session starts:

```
Step 1: Global Memory
   Load: AI Constitution, Enterprise Principles, Architecture Baseline
   Source: 00-FOUNDATION/
   
Step 2: Standards
   Load: Naming Standards, Documentation Standards, Coding Standards
   Source: 05-STANDARDS/
   
Step 3: Domain Context
   Load: Business Rules, Entity Definitions for assigned domain
   Source: Domain-specific files
   
Step 4: Architecture Context
   Load: Relevant ADRs, API Contracts
   Source: ADR register, contract files
   
Step 5: Sprint Context
   Load: Sprint goal, backlog, Definition of Done
   Source: Program Manager AI context packet
   
Step 6: Task Context
   Load: Task ID, acceptance criteria, dependencies
   Source: Program Manager AI context packet
   
Step 7: Knowledge Base (if applicable)
   Load: Relevant patterns, lessons learned, troubleshooting guides
   Source: 12-KNOWLEDGE/
   
Step 8: Previous Session Memory (if resuming)
   Load: Last session summary from audit trail
   Source: Session archive
```

## Memory Update Protocol

### Who Can Update What

| Memory Store | Can Update | Requires Approval |
|-------------|------------|-------------------|
| AI Constitution | Chief Executive AI | CTO approval |
| Enterprise Principles | Chief Enterprise Architect AI | CEO approval |
| Architecture Baseline | Chief Enterprise Architect AI | ADR required |
| Glossary | Documentation Engineer AI | Program Manager AI |
| Standards | Documentation Engineer AI | Program Manager AI |
| Business Rules | Business Analyst AI | Product Owner AI |
| Entity Definitions | Solution Architect AI | Chief Enterprise Architect AI |
| ADR Records | Solution Architect AI | Chief Enterprise Architect AI |
| API Contracts | Solution Architect AI | Chief Enterprise Architect AI |
| Knowledge Base | All agents | Documentation Engineer AI review |

### Update Format

```markdown
MEMORY UPDATE
═════════════
ID: MEM-001
Date: YYYY-MM-DD HH:MM UTC

STORE
─────
Store: [Global / Domain / Knowledge Base]
Location: [File path]
Type: [Create / Update / Deprecate / Archive]

CHANGE
──────
[Description of what changed]

RATIONALE
─────────
[Why this change is needed]

BEFORE
──────
[Previous content or reference]

AFTER
─────
[New content or reference]

UPDATED BY
──────────
Agent: [Role]
Session: [Session ID]

APPROVED BY
───────────
Agent: [Role]
```

### Update Frequency

| Memory Type | Update Frequency | Review Cadence |
|-------------|-----------------|----------------|
| Global | Rare (quarterly max) | Every sprint retro |
| Domain | Per sprint | Per domain completion |
| Knowledge Base | Continuous | Monthly |
| Session | Every session | Never (archived) |

## Memory Lifecycle

```
                    ┌──────────────┐
                    │   Created    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Active     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐  ┌────▼────┐  ┌───▼────────┐
     │  Updated   │  │Archived │  │ Deprecated  │
     └────────┬───┘  └─────────┘  └───┬────────┘
              │                        │
              └──────────┬─────────────┘
                         │
                  ┌──────▼───────┐
                  │   Deleted    │
                  └──────────────┘
```

### Lifecycle States

| State | Meaning | Visibility |
|-------|---------|------------|
| Created | Memory item is new | Readable by authorized agents |
| Active | Memory item is current and authoritative | Readable |
| Updated | Replaced by newer version; old version retained | Readable with version note |
| Archived | No longer active but preserved for history | Readable only by request |
| Deprecated | Replaced and should not be used | Marked with deprecation notice |
| Deleted | Permanently removed after archival period | Not visible |

## Memory Versioning

### Version Scheme
Memory artifacts use semantic versioning: `MAJOR.MINOR`

| Version Component | Change Type | Example |
|-------------------|-------------|---------|
| MAJOR | Breaking change | `1.0` → `2.0` |
| MINOR | Non-breaking addition or refinement | `1.0` → `1.1` |

### Version Tracking
Every memory artifact includes a version header:

```markdown
---
version: 1.2
last-updated: YYYY-MM-DD
updated-by: Documentation Engineer AI
change-summary: Added pattern for event-driven communication
---
```

### Version History
Version history is maintained alongside the artifact:
- Previous versions are archived with the version number
- A changelog at the artifact level tracks all versions
- Cross-references include version numbers

## Memory Query Protocol

Agents may query memory stores using:

```markdown
MEMORY QUERY
════════════
ID: MQ-001
From: [Agent Role]
Store: [Global / Domain / Knowledge Base]
Query: [Specific question or search term]
Purpose: [Why the information is needed]

RESPONSE
────────
[Query result with source reference and version]
```

### Query SLA
| Store | Response SLA |
|-------|-------------|
| Global Memory | Immediate (pre-loaded) |
| Domain Memory | Immediate (pre-loaded) |
| Knowledge Base | < 30 seconds |
| Archived Memory | < 5 minutes (requires retrieval) |
