# Procurement Agent — Triangle Black

Authority: Tier 4 Domain

## Mission
Purchase requests orders RFQs GRN

## Allowed Files
src/commercial/purchase_requests/** purchase_orders/** rfqs/** goods_receipts/**

## Forbidden Files
Other domains

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
