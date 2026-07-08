# AI Agent Loading Strategy — Triangle Black

## Role-Based Context Packs

| Role | Context File | Primary Folders | Purpose |
|------|-------------|-----------------|---------|
| **Architect** | `10-AI/CONTEXTS/ARCHITECT.md` | 00-ARCHITECT, 02-GOVERNANCE, 07-INTEGRATION | Make architecture decisions, review ADRs |
| **Developer** | `10-AI/CONTEXTS/DEVELOPER.md` | 05-ENGINEERING, 06-DOMAINS, 07-INTEGRATION | Implement features, write code |
| **Reviewer** | `10-AI/CONTEXTS/REVIEWER.md` | 02-GOVERNANCE/QUALITY, 05-ENGINEERING | Review code, check quality gates |
| **Tester** | `10-AI/CONTEXTS/TESTER.md` | 05-ENGINEERING/TESTING, 06-DOMAINS | Write tests, validate coverage |
| **Planner** | `10-AI/CONTEXTS/PLANNER.md` | 01-EXECUTIVE, 09-EVOLUTION, 10-AI/MAPPING | Plan sprints, roadmap, sequencing |
| **Manager** | `10-AI/CONTEXTS/MANAGER.md` | 08-OPERATIONS, 10-AI/EXECUTION | Track progress, manage risks |
| **Security** | `10-AI/CONTEXTS/SECURITY.md` | 05-ENGINEERING/SECURITY, 04-DESIGN/SECURITY | Security review, threat modeling |
| **Research** | `10-AI/CONTEXTS/RESEARCH.md` | 09-EVOLUTION/RESEARCH, 03-BUSINESS/MARKET | Market research, innovation |
| **Writer** | `10-AI/CONTEXTS/WRITER.md` | 12-SHARED/TEMPLATES, 03-BUSINESS | Technical writing, documentation |
| **Analyst** | `10-AI/CONTEXTS/ANALYST.md` | 06-DOMAINS, 02-GOVERNANCE/TRACEABILITY | Business analysis, requirements |
| **Database** | `10-AI/CONTEXTS/DATABASE.md` | 04-DESIGN/DATABASE, 05-ENGINEERING/DATABASE | Schema design, migrations |
| **Frontend** | `10-AI/CONTEXTS/FRONTEND.md` | 04-DESIGN/PORTAL, 05-ENGINEERING/FRONTEND | UI implementation |
| **Backend** | `10-AI/CONTEXTS/BACKEND.md` | 04-DESIGN/BACKEND, 05-ENGINEERING/BACKEND | API implementation |
| **DevOps** | `10-AI/CONTEXTS/DEVOPS.md` | 05-ENGINEERING/DEVOPS, CI-CD, 08-OPERATIONS | Infrastructure, deployment |
| **QA** | `10-AI/CONTEXTS/QA.md` | 05-ENGINEERING/TESTING, 08-OPERATIONS/READINESS/QA | Quality assurance |
| **CTO** | `10-AI/CONTEXTS/CTO.md` | All layers | Executive oversight |

## Loading Protocol

### Step 1: Identity
Load `.ai-context.md` at root — establishes repository structure, vector collections, navigation.

### Step 2: Role Context
Load the role-specific context pack from `10-AI/CONTEXTS/`.

### Step 3: Repository Map
Load `99-META/REPOSITORY-MAP.md` for complete directory inventory.

### Step 4: Vector Query
Query appropriate vector collections based on the task type:
- Strategic questions → triangle-executive, triangle-evolution
- Domain questions → triangle-domains, triangle-business
- Technical questions → triangle-engineering, triangle-design
- AI questions → triangle-ai, triangle-knowledge

### Step 5: Document Retrieval
Navigate using INDEX.md files at each directory level.

## Context Pack Template

Each context pack follows this structure:

```markdown
# [Role] Context Pack

## Role Definition
[What this role does]

## Primary Folders
- [Folder path]: [purpose, file count, key docs]

## Vector Collections
- [Collection name]: [description]

## Key Documents to Load
- [Document path]: [why this matters]

## Common Queries
- [Query type]: [which folders to search]

## Related Roles
- [Role name]: [when to consult]
```
