# TRIANGLE BLACK — V8 SPRINT PLAN
Date: 2026-08-31
Status: EVIDENCE-BASED, DEPENDENCY-ORDERED

---

## STRATEGIC OBJECTIVE

Make Triangle Black capable of:
1. Being deployed on a real server (not localhost)
2. Being used by a real customer without developer assistance
3. Producing trustworthy, defensible intelligence
4. Closing the Signal → Recommendation → Action → Outcome → ROI loop
5. Delivering Package 1 (Assessment) to a paying customer

---

## GATE A — COMMERCIAL TRUST (Before any pilot outreach)

### V8-002: ROI Report Defensibility
**Why first:** Cannot have commercial conversations without defensible ROI
**Files:** src/commercial/roi/service.py + router.py
**What:** Add formula, assumptions, source_data, confidence to ROI report
**Test:** Customer can explain the calculation → challenge it → still trust it
**Acceptance:** 7/7 defensibility fields present in /api/v1/roi/report

### V8-003: Data Confidence Display
**Why:** Intelligence claims need confidence context or customers won't trust them
**What:** Show "Based on X of Y records — confidence: LOW/MEDIUM/HIGH" 
         alongside every KPI in intelligence endpoints
**Builds on:** V7-004 confidence engine (already built)
**Acceptance:** Every intelligence endpoint shows confidence + coverage

### V8-004: WO Creation — Force Asset Linkage
**Why:** 7.7% WO-asset linkage makes MTTR and critical path unreliable
**What:** Enforce asset_id required on WO creation (API validation)
         Add warning if WO progressed without asset
**Acceptance:** New WOs have asset_id > 90% within 30 days of pilot

### V8-005: Technician Assignment Enforcement
**Why:** 422 open WOs have no technician — cannot close the action loop
**What:** Workflow: cannot move to in_progress without technician_id
         (V7-009 already has this — verify it works in practice)
**Acceptance:** WOs cannot reach in_progress without technician

---

## GATE B — PILOT EXPERIENCE

### V8-006: Production Deployment (Staging → Cloud VM)
**Why:** Cannot pilot on localhost
**What:** Deploy to DigitalOcean/Hetzner VM (~$24/month)
         SSL certificate, domain, health monitoring
**Acceptance:** https://app.triangleblack.com or similar accessible URL

### V8-007: Attention Dashboard (Primary UX)
**Why:** Customer needs to see "what needs attention" within 30 seconds of login
**What:** A landing page that shows:
         - Critical open WOs (P0/P1)
         - Overdue PM plans  
         - Daily digest top 3
         - One-click action buttons
**Acceptance:** Engineering manager can take first action within 2 minutes of login

### V8-008: Loading + Error States (Top 20 pages)
**Why:** 129 pages show blank screens on load/error
**What:** Add consistent loading skeleton + error message to top 20 pages:
         dashboard, work orders, assets, PM plans, recommendations,
         suppliers, procurement, reports, onboarding, data quality
**Acceptance:** No blank screens on these 20 pages

### V8-009: Pilot Onboarding Wizard
**Why:** Customer must be able to onboard without developer help
**What:** UI version of the onboarding checklist
         Step-by-step guided journey with progress tracking
**Acceptance:** Customer can complete onboarding in < 2 hours unassisted

---

## GATE C — INTELLIGENCE TRUST

### V8-010: Intelligence → Action UI
**Why:** Daily digest and action queue exist as APIs but not as primary UX
**What:** Surface daily-digest as the primary post-login view
         Add "Record Outcome" button to every approved recommendation
**Acceptance:** Outcome recording rate increases from 40% to > 60%

### V8-011: workflow_events Schema Fix
**Why:** workflow_events.hotel_id missing — cannot tenant-scope workflow reports
**What:** Migration to add hotel_id to workflow_events table
**Acceptance:** Workflow audit trail is fully tenant-scoped

### V8-012: TypeScript Build Fix (34 errors)
**Why:** Portal cannot build for production
**What:** Fix enterprise JSX Unknown tags (lines 26-27 pattern)
**Acceptance:** npx tsc --noEmit = 0 errors

---

## GATE D — PRODUCTION RELIABILITY

### V8-013: Backup Restore Verification
**Why:** Backup exists but restore untested — not a real backup
**What:** Test restore to staging DB, verify row counts
         Document RPO/RTO, automate monthly restore test
**Acceptance:** Restore completes successfully with verified data

### V8-014: CI/CD Full Gate
**Why:** Current CI runs "fast subset" only — not production-safe
**What:** Add to CI: full test suite, TypeScript build, security tests
**Acceptance:** Push to main = full validation before any deployment

---

## GATE E — FIRST PILOT (Business Sprint — no code)

### V8-021: First Real Pilot
**Execute:** docs/v7/V7_PILOT_PLAYBOOK.md
**Target:** 1 hotel engineering company, 1 property, 30 days
**Measure:** Before/after on PM compliance, open WOs, MTTR, DQ score
**Deliver:** ROI report with evidence

---

## SPRINT DEPENDENCY GRAPH
V8-002 (ROI defensibility) → pilot conversations V8-003 (data confidence) → intelligence trust V8-004 (WO asset enforcement) → data quality V8-005 (technician enforcement) → workflow completion V8-006 (production deployment) → ALL pilot work V8-007 (attention dashboard) → pilot UX V8-008 (loading/error states) → pilot UX V8-009 (onboarding wizard) → pilot independence V8-010 (intelligence→action UI) → outcome tracking V8-011 (schema fix) → workflow reporting V8-012 (TypeScript fix) → production build V8-013 (backup restore) → reliability V8-014 (CI/CD gate) → release safety → V8-021 (First Pilot)

---

## WHAT NOT TO BUILD IN V8

Before first pilot:
❌ Native mobile app
❌ Multi-region
❌ SSO/SCIM
❌ Complex billing
❌ More AI features
❌ More dashboards (except attention dashboard)
❌ More tests without product reason
❌ Kubernetes
❌ Microservices

After pilot proves value:
✅ Then expand based on customer feedback

---

## SUCCESS DEFINITION FOR V8
V8 is COMPLETE when:

Platform deployed to cloud VM (real URL, SSL)
First customer onboarded without developer assistance
30-day pilot completed with real operational data
Before/after KPI comparison documented
ROI calculated with formula + assumptions + evidence
Customer willing to provide reference
All intelligence claims have confidence ratings
Recommendation acceptance > 20%
Outcome tracking > 50% of approved recommendations
Portal builds without TypeScript errors

