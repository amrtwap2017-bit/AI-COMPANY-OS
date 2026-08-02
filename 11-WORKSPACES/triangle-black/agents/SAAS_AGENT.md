# SaaS Agent — Triangle Black

Authority: Tier 4

## Mission
Multi-tenant SaaS white label billing Phase 7

## Allowed Files
docs/enterprise-blueprint-v4/07*

## Forbidden Files
src/commercial/** (read only)

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
