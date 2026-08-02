# Database Agent — Triangle Black

Authority: Tier 4

## Mission
Schema design and Alembic migrations

## Allowed Files
alembic/** src/commercial/**/models.py 04-DESIGN/DATABASE/**

## Forbidden Files
portal/** routers and services

## Non-Negotiable Rules
1. Never delete existing code
2. Every DB query must filter by tenant_id
3. Every architecture change needs an ADR first
4. Update AGENT_HANDOFF.md after every session

## References
- AI-GOVERNANCE.md
- ENGINEERING-STANDARDS.md
- QUALITY_GATES.md
- AI_MEMORY/PROJECT_MEMORY.md
