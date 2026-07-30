
================================================================================
QWEN ANALYSIS TASK — Triangle Black Platform Gap Analysis
Run at the START of every new session before writing any code
================================================================================

PROMPT TO SEND TO QWEN (http://localhost:11434/api/generate, model=qwen2.5-coder:7b):

import requests

prompt = """You are Chief Product Officer and Principal Architect for Triangle Black — an enterprise MEP operations platform for Egyptian hotel engineering companies.

PLATFORM STATE:
- 200+ pages, FastAPI backend, Next.js 14 portal
- 109 pages with live API data, 27 interactive pages, 74 stubs
- Design: TBDL 1.0 warm light — sandy hero, champagne bronze, obsidian sidebar
- Role-aware workspace and sidebar for 5 user roles
- Full E2E workflow verified: SR → WO → Assign → Time → Complete → Invoice → Pay
- Toast notifications, audit trail, CSV export all working
- Auto-notifications via _notify() helper in backend

INTERACTIVE PAGES (27 total):
  Service Request create, Work Order create/edit/delete/assign/status
  Time tracking, Dispatch kanban, SOW create, Vendor create, RFQ create
  Invoice approve/pay, Approval approve, Project create, Contracts activate/renew
  User management, Profile, Audit trail, All-modules sitemap

STILL DISPLAY-ONLY (no create/edit/delete — 94 pages):
  commercial/leads, operations/sites, operations/technicians
  supply-chain/purchase-orders-v2 (no create), maintenance/assets
  financial, analytics pages (no filters), executive pages
  administration/hotels, customers pages

KNOWN GAPS:
  1. _notify not wired to SR create (pattern changed)
  2. No + New PO button on purchase orders list
  3. Technician [id] detail page shows empty for many IDs
  4. RFQ detail needs award/reject bid buttons
  5. No SOW → RFQ direct creation link
  6. Mobile experience not tested or optimized
  7. No date range filters on analytics charts
  8. Sidebar shows Platform Admin to all roles (should be admin only)
  9. Email notifications not configured (SMTP)
  10. No bulk actions on any list (select multiple WOs to assign)
  11. No drag-and-drop on dispatch board (currently click-only)
  12. No real-time updates (no WebSocket or SSE)
  13. Password change form (in profile) not implemented in backend
  14. Client portal (/client-portal) and supplier portal pages need review

USER ROLES AND THEIR DAILY PAIN:
  Field Engineer: assigned WOs, log time, scan QR, update status
  Operations Manager: daily briefing, approve, dispatch, SLA review
  Procurement Officer: SOW→RFQ→PO workflow, compare bids
  Finance Manager: invoice review, approve payments, P&L
  Admin: user management, security audit, platform health
  Hotel GM: raise SR, track status, approve SOW (client portal)
  Vendor: view POs, submit invoices, acknowledge delivery (supplier portal)

YOUR TASK:
Analyze the gaps above and create a prioritized sprint plan.

OUTPUT FORMAT for each sprint:
SPRINT-N | PRIORITY (P1/P2/P3) | TITLE | WHO IS UNBLOCKED | EXACT PAGES/APIs | ESTIMATED EFFORT (S/M/L) | BUSINESS IMPACT

Create exactly 15 sprints ordered by business impact.
Focus on: user actions, workflow completion, data accuracy, UX quality.
Be specific about exact URLs and API endpoints.
Under 400 words total.
"""

r = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "qwen2.5-coder:7b",
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": 800, "temperature": 0.0}
    },
    timeout=180
)
print(r.json().get("response", "").strip())

================================================================================
END OF QWEN TASK
================================================================================
