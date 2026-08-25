# Gap Register — Authoritative
## A-001 Full Audit — August 2026

### Severity Classification
- CRITICAL: Blocks first customer or causes data loss/security breach
- HIGH: Blocks scaling beyond first customer or degrades commercial value
- MEDIUM: Reduces efficiency or product quality; planned fix
- LOW: Minor improvement; address in maintenance window

---

## CRITICAL Gaps

### GAP-C001: PM Plans Endpoint 404
- Finding: GET /api/v1/pm-plans/ returns 404
- Impact: Breaks Operations Loop (Preventive Maintenance not accessible)
- Fix: Find correct route prefix and register or fix pm_plan_api
- Sprint: IMMEDIATE

### GAP-C002: CI/CD Not Verified End-to-End
- Finding: .github/workflows/ci.yml exists but pipeline not run/verified
- Impact: No automated quality gate — manual process error-prone
- Fix: Run pipeline, verify all steps pass
- Sprint: A-002

### GAP-C003: Backup/Restore Not Verified
- Finding: Backup scripts exist but restore never tested
- Impact: Data loss risk for any customer data
- Fix: Run restore drill, document PITR capability
- Sprint: A-002

### GAP-C004: Staging Environment Not Deployed
- Finding: Production compose exists, staging not deployed
- Impact: No safe place to test before production
- Fix: Deploy staging environment
- Sprint: A-002

---

## HIGH Gaps

### GAP-H001: main.py 8,560 Lines
- Finding: 211 routes, 309 SQL, 152 engines inline
- Impact: Unmaintainable, hard to audit, connection pool risk
- Fix: Extract 10 routes/sprint (A-007 progressive)
- Target: < 4,000 lines

### GAP-H002: 70/122 Routers Missing Full DDD
- Finding: Only 43% have models+schemas+repository+router
- Impact: Business logic scattered, hard to test
- Fix: Progressive migration by business value
- Priority order: financial, procurement, maintenance

### GAP-H003: 86 Broad except Exception Blocks
- Finding: Silent failure swallowing across codebase
- Impact: Hidden bugs reach production silently
- Fix: Typed exception hierarchy (TriangleBlackError subclasses)

### GAP-H004: 1 Direct localhost:8030 Fetch in Portal
- Finding: One portal page still uses raw fetch to localhost
- Impact: Breaks in production (wrong URL)
- Fix: Replace with authFetch

### GAP-H005: Observability SLOs Not Connected
- Finding: SLO tracker exists but no external alerting
- Impact: Production failures not detected automatically
- Fix: Connect to monitoring system

### GAP-H006: Revenue Loop Incomplete (PM Plans)
- Same as GAP-C001 — listed here for commercial tracking

---

## MEDIUM Gaps

### GAP-M001: Customer Self-Service Onboarding Polish
- Finding: provision-property works but wizard not production-quality
- Fix: A-003 onboarding UX polish

### GAP-M002: ROI Measurement Not Built
- Finding: No per-customer before/after comparison
- Fix: A-008 KPI Engine

### GAP-M003: Time-to-Value Not Measured
- Finding: No tracking of customer onboarding duration
- Fix: Add onboarding timestamps + dashboard

### GAP-M004: 16 Audit Documents (Only 6 Written)
- Finding: A-001 requires 16 docs, only 6 written here
- Fix: Complete remaining 10 docs

### GAP-M005: Full Backend Suite Unknown
- Finding: Last full run was old (pre-session), 31 failures unknown
- Fix: Run clean full suite with no sleeps

---

## LOW Gaps

### GAP-L001: 1,025 Inline Styles (All Irreducible)
- All remaining are dynamic values (chart colors, progress bars)
- Status: Acceptable

### GAP-L002: SSO/SAML Sandbox Only
- Not needed until enterprise customers

### GAP-L003: Stripe Billing Production Keys Not Set
- Not needed until first paying customer

### GAP-L004: WCAG 2.2 AA Not Audited
- Future requirement for enterprise contracts
