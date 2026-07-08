# Naming Standards

> Naming conventions for all artifacts generated within the Enterprise AI Delivery Framework.

## Directory Naming

| Pattern | Example | Rule |
|---------|---------|------|
| Section directories | `00-FOUNDATION/` | Two-digit prefix + uppercase name |
| Sub-directories | `01-AI-ORGANIZATION/CEO-Office/` | Same pattern, nested |
| Phase directories | `Phase-A/` | Pascal case with dash |

## File Naming

| Pattern | Example | Rule |
|---------|---------|------|
| Root documents | `MASTER-CONTEXT.md` | UPPERCASE with hyphens |
| Standard documents | `AI-Constitution.md` | Pascal case with hyphens |
| Agent specifications | `Chief-Executive-AI.md` | Full role name with hyphens |
| Templates | `ADR-Template.md` | Type + -Template |
| Prompts | `System-Prompt-Architect.md` | Category + -Prompt + -Role |
| ADR documents | `ADR-001-Title.md` | ADR prefix + number + short title |
| Sprint directories | `Sprint-001/` | Sprint prefix + three-digit number |

## Content Standards

| Artifact | Standard |
|----------|----------|
| Model names | PascalCase: `Lead`, `Opportunity`, `Timesheet` |
| API endpoints | kebab-case: `/api/v1/crm/leads` |
| Database columns | snake_case: `first_name`, `created_at` |
| Environment variables | UPPER_SNAKE_CASE: `DATABASE_URL` |
| Event names | dot.case: `lead.created`, `timesheet.approved` |
| Tags | PascalCase: `CRM`, `HR`, `ProjectDelivery` |
