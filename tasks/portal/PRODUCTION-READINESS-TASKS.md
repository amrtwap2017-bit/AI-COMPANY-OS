# TRIANGLE BLACK - PRODUCTION READINESS TASK REGISTRY
# Generated: 2026-07-20 10:42
# Total: 42 tasks across 6 sprints

======================================================================
SPRINT PR-0 - EMERGENCY (Execute TODAY - 3 hours)
======================================================================

PR-000  EMERGENCY  Disable AUTH_BYPASS
  .env.local: NEXT_PUBLIC_AUTH_BYPASS=false
  Create .env.production and .env.example
  Time: 10 minutes

PR-001  EMERGENCY  Fix login to set httpOnly cookie
  Create portal/app/api/auth/login/route.ts
  Create portal/app/api/auth/logout/route.ts
  Create portal/app/api/health/route.ts
  Update login page to POST to /api/auth/login
  Time: 2 hours

PR-002  EMERGENCY  Remove hardcoded secrets
  src/core/auth.py: warn if no TB_SECRET_KEY set
  src/core/config.py: raise error in production with default secret
  Time: 30 minutes

PR-003  EMERGENCY  Fix CORS origins
  main.py: restrict allow_origins to known domains
  Time: 15 minutes

======================================================================
SPRINT PR-1 - SECURITY FOUNDATION (Week 1)
======================================================================

PR-010  CRITICAL  Add auth to all enterprise API endpoints
  maintenance, analytics, approvals, customers, projects routers
  Add: current_user = Depends(get_current_user) to each router
  Time: 3 hours

PR-011  HIGH  Add rate limiting on auth endpoint
  Nginx: 5r/m on /api/v1/auth/login
  Backend: account lockout after 5 failed attempts
  Time: 2 hours

PR-012  HIGH  Add Content Security Policy header
  Nginx: add CSP header to server block
  Time: 1 hour

PR-013  HIGH  Remove unused packages from bundle
  Remove axios (unused - native fetch is used)
  Audit framer-motion - remove if unused
  Move react-query-devtools to devDependencies
  Time: 1 hour

PR-014  HIGH  Restrict proxy.ts for production
  Also check Authorization header not just cookie
  Handle token refresh on 401
  Time: 2 hours

======================================================================
SPRINT PR-2 - CI/CD PIPELINE (Week 2)
======================================================================

PR-020  CRITICAL  Create portal CI workflow
  .github/workflows/portal-ci.yml
  Steps: npm ci -> build -> test -> lint -> type-check
  Time: 3 hours

PR-021  HIGH  Enable TypeScript Phase 1
  Remove @ts-nocheck from lib/api/ files
  Fix type errors that surface
  Time: 4 hours

PR-022  HIGH  Add jest test runner
  Install jest + @testing-library/react
  Create jest.config.ts
  Add test script to package.json
  Time: 2 hours

PR-023  HIGH  Create ESLint configuration
  Create eslint.config.mjs
  Rules: no-unused-vars, no-console, react-hooks
  Time: 1 hour

PR-024  HIGH  Create backend CI workflow
  .github/workflows/backend-ci.yml
  Steps: pytest, ruff lint
  Time: 2 hours

PR-025  MEDIUM  Fix next.config.ts basePath
  Add basePath: '/portal' to match Nginx routing
  OR update Nginx to serve portal at root
  Time: 2 hours

======================================================================
SPRINT PR-3 - TESTING (Week 3)
======================================================================

PR-030  CRITICAL  Write critical path tests
  auth flow, work orders CRUD, approvals
  Target: 40% coverage
  Time: 8 hours

PR-031  HIGH  Write backend API tests
  pytest + httpx TestClient for every router
  Verify 401 on unprotected endpoints
  Time: 8 hours

PR-032  HIGH  Write component tests
  PageWrapper, EnterpriseSidebar, error boundaries
  Time: 4 hours

PR-033  MEDIUM  Add E2E critical journey
  Playwright: login -> dashboard -> create WO -> approve
  Time: 6 hours

======================================================================
SPRINT PR-4 - OBSERVABILITY AND INFRA (Week 4)
======================================================================

PR-040  HIGH  Add Sentry error tracking
  Frontend: @sentry/nextjs
  Backend: sentry-sdk
  Time: 3 hours

PR-041  HIGH  Create systemd service for TB Admin
  /etc/systemd/system/tb-admin.service
  systemctl enable tb-admin
  Time: 1 hour

PR-042  MEDIUM  Add database backup cron
  pg_dump daily, retain 7 days
  Time: 1 hour

PR-043  MEDIUM  Add structured logging to backend
  Replace print() with Python logging
  Time: 3 hours

======================================================================
SPRINT PR-5 - ACCESSIBILITY (Week 5)
======================================================================

PR-050  HIGH  Add skip-to-content link
PR-051  HIGH  Add ARIA landmark labels
PR-052  HIGH  Add global focus ring in globals.css
PR-053  HIGH  Add aria-label to icon-only buttons
PR-054  MEDIUM  Add PWA manifest.json
PR-055  MEDIUM  Add offline detection banner

======================================================================
SPRINT PR-6 - MISSING ENTERPRISE FEATURES (Week 6)
======================================================================

PR-060  HIGH  User management UI (/administration/users)
PR-061  HIGH  Audit log UI (/administration/audit)
PR-062  HIGH  Real-time notification badge updates
PR-063  HIGH  Document management UI
PR-064  MEDIUM  PDF download on quote detail page
PR-065  MEDIUM  Enable TypeScript Phase 2 (components)
PR-066  MEDIUM  RBAC enforcement on portal pages
PR-067  LOW  Dark mode foundation

======================================================================
PRODUCTION GATE CHECKLIST
======================================================================

[ ] AUTH_BYPASS disabled
[ ] Login sets httpOnly cookie
[ ] All enterprise API endpoints require valid JWT
[ ] No hardcoded secrets in source
[ ] CORS restricted to known origins
[ ] CI/CD pipeline passing
[ ] Test coverage > 40%
[ ] Nginx basePath alignment verified
[ ] Error tracking active
[ ] Health endpoint responding
[ ] systemd service running TB Admin
[ ] Database backup active
