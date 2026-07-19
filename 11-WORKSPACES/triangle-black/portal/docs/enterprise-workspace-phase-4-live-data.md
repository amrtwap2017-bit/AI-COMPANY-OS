
Triangle Black Enterprise Workspace
Phase 4 — Live Data Integration

Objective
Connect the first 4 enterprise centers to real backend data safely.

Centers
- Executive Center
- Commercial Center
- Operations Center
- Supply Chain Center

Principles
- Always render the page shell
- Never fail the whole page because one endpoint fails
- Show integration status per endpoint
- Use enterprise centers as the stable entry points
- Keep legacy routes available in parallel

Data Strategy
- Use client-side authenticated API calls
- Wrap every request in safe error handling
- Surface failures as visible status cards instead of blank UI
- Derive KPIs from available data even if some endpoints are missing

Expected Result
- /dashboard redirects to /executive
- /executive shows live executive metrics where available
- /commercial shows real leads, quotes, and contracts previews
- /operations shows live work order and technician integration status
- /supply-chain shows live procurement and inventory integration status
