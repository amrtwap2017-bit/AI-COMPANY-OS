# SPRINT 9 TASK REGISTRY
# Generated: 2026-07-21 09:10
# Method: Qwen 2.5 7b analysis of 12 modules
# Status: Analysis complete, ready for execution

## FINDINGS SUMMARY
- Total pages: 143
- Placeholder pages: 1 (need real implementation)
- Real data pages: 142
- API routes: 168 (100% smoke test passing)
- Backend tests: 19/19 PASS

## CRITICAL FIXES (execute immediately)
FIX-001: dashboard.router import error (non-blocking but incomplete)
  File: src/commercial/dashboard/repository.py
  Error: cannot import get_dashboard_repo
  Action: Check function name, fix import in router.py

FIX-002: pdf_service.router has no attribute 'router'
  File: src/commercial/pdf_service/router.py
  Action: Verify router = APIRouter() exists in file

## TIER 1: HIGH VALUE PAGES (implement these first)
T1-001: /operations/calendar           - schedule view from maintenance_plans
T1-002: /operations/sla-review         - SLA KPIs from work_orders
T1-003: /maintenance/schedule          - PM schedule calendar
T1-004: /supply-chain/purchase-requests - wire to real API (1 record exists)
T1-005: /analytics/trends              - revenue + lead funnel charts
T1-006: /executive/portfolio           - contract portfolio view
T1-007: /operations/workbench          - field manager daily view

## TIER 2: MEDIUM VALUE (after Tier 1)
T2-001: /maintenance/intelligence      - predictive insights
T2-002: /supply-chain/spend            - spend analysis chart
T2-003: /commercial/pipeline           - lead funnel visualization
T2-004: /executive/reports             - revenue trend + SLA report
T2-005: /projects-center/review        - multi-project signals
T2-006: /engineering/intelligence      - BOQ and inspection review

## TIER 3: QUALITY IMPROVEMENTS
T3-001: Remove @ts-nocheck from lib/api/ (10 files, safe start)
T3-002: Add ESLint config (no-unused-vars, no-console)
T3-003: Add keyboard shortcuts (G+W=work orders, G+L=leads, /=search)
T3-004: Add bulk actions to work-orders list (assign, complete)
T3-005: Add login rate limiting to FastAPI (5 attempts, 15min lockout)
T3-006: Fix dashboard.router import error

## ANALYSIS FILES
See: /home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_01_operations.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_02_maintenance.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_03_supply_chain.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_04_analytics.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_05_executive.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_06_api_contracts.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_07_frontend_quality.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_08_security.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_09_ux_gaps.md
/home/amr/AI-COMPANY-OS/tasks/portal/sprint9/task_9_10_priority_matrix.md

## EXECUTION COMMAND FOR EACH TIER
Tier 1: python3 tasks/portal/execute_tier1.py
Tier 2: python3 tasks/portal/execute_tier2.py
Tier 3: python3 tasks/portal/execute_tier3.py
