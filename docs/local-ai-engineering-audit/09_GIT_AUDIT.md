# GIT WORKFLOW AUDIT
## Generated: Wed Aug 26 15:44:16 UTC 2026

## Current Branch
main

## All Branches
  epic/remaining-enterprise-program
  feature/b0-api-foundation
  feature/b1-auth-guards
  feature/b2-ops-complete-forms
  feature/ops-portal-foundation-v1
  feature/ops-portal-identity-mobile-v1
  feature/ops-portal-phase-10a-10b-ai-timeline
  feature/ops-portal-phase-11a-11b-tabs-knowledge
  feature/ops-portal-phase-12a-12b-actions-workflows
  feature/ops-portal-phase-13a-13b-summary-related
  feature/ops-portal-phase-14a-14b-context-graph
  feature/ops-portal-phase-15a-15b-entity-intelligence
  feature/ops-portal-phase-16a-16b-workspace-memory
  feature/ops-portal-phase-17a-17b-backend-alignment
  feature/ops-portal-phase-18a-18b-workbenches
  feature/ops-portal-phase-19a-19b-entity-detail-apis
  feature/ops-portal-phase-21a-21b-executive-scorecards
  feature/ops-portal-phase-22a-22b-exec-kpis
  feature/ops-portal-phase-22c-22d-trends-watchlists
  feature/ops-portal-phase-23a-23b-alerts-escalations
  feature/ops-portal-phase-24a-24b-inbox-followup
  feature/ops-portal-phase-25a-25b-notification-rules-presets
  feature/ops-portal-phase-26a-26b-calendar-dispatch
  feature/ops-portal-phase-27a-27b-queue-review
  feature/ops-portal-phase-28a-28b-commercial-executive-review
  feature/ops-portal-phase-29a-29b-supply-sla-review
  feature/ops-portal-phase-30a-30b-commercial-exceptions
  feature/ops-portal-phase-4-live-data
  feature/ops-portal-phase-5-command-workspaces
  feature/ops-portal-phase-6-command-search-filters

## Recent Commits
821cc52e fix(P0-last-2): ETA __future__ import order + assets-sync route ordering
034b231c fix(P0-final-batch): Fix remaining 11 failures → target 0
a70d01c9 fix(P0-zero): Final push to 0 failures
4f95f709 fix(P0-final): Fix remaining 15 test failures → 0
1c7f14e3 fix(P0-round3): Fix final 26 test failures → target 0
b4f84723 fix(P0-round2): Fix remaining 25 test failures
7c17ba17 fix(P0): Fix all 31 pre-existing test failures
ac69ce25 feat(A-013): 3 intelligence portal pages — /operations/cost-intelligence, /operations/sla-intelligence, /operations/risk-intelligence; nav updated
56fa445e feat(A-012): Operational Risk Engine — 5-domain composite risk (ASSETS/OPERATIONS/MAINTENANCE/FINANCE/PROCUREMENT), overall risk score, top risk factors — 9 tests
c81dbfdd feat(A-010/A-011): Cost Intelligence (monthly trend, aging, efficiency score) + SLA Intelligence (breach by priority/category, backlog, recommendations) — 18 tests
4d996bda feat(A-010): Cost Intelligence Engine — monthly spend trend, invoice aging, cost efficiency score, top drivers — 9 tests; all 10 KPIs returning real data confirmed
e6fe7423 chore(ai-os): HUB-T001 complete — state updated
3bb5cdb5 feat(ai-os): HUB-T001 — ai-verify v4 auto server detection and start
d1f3cef1 feat(ai-os): SPRINT-HUB-001 — Hub Enhancement sprint started
159fcac4 fix(A-009): Fix KPI data zeros — remove deleted_at from invoices (column missing), PM always uses asset join, supplier query fixed — all 10 KPIs now return real data
5b49d39a fix(A-008): Fix 4 KPI data gaps — invoices.total_amount, PM plans via asset join, supplier health formula, contract status; add /operations/kpi-dashboard portal page
5cac03a8 feat(A-007): KPI Engine — 10-KPI morning dashboard, OHI score, RAG status, alerts, trends — unified executive briefing in one API call; re-registered executive_api + analytics_api
04a1b6f7 feat(A-006): Supplier Engine — performance scores 0-100, concentration risk, prefer/avoid recommendations, category diversity — 9 tests; supplier_api re-registered
8c37897b chore(ai-os): SPRINT-N-FIX-T003 complete — state updated
1ea79965 feat(A-005): PM Engine — compliance by category, 30-day schedule, overdue ranking, executive summary — reveals 70 unscheduled assets gap — 9 tests

## Git Status
On branch main
Your branch is ahead of 'origin/main' by 573 commits.
  (use "git push" to publish your local commits)

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/local-ai-engineering-audit/00_HARDWARE_BASELINE.md
	docs/local-ai-engineering-audit/01_RUNTIME_BASELINE.md
	docs/local-ai-engineering-audit/02_MODEL_AUDIT.md
	docs/local-ai-engineering-audit/03_OPENCODE_AUDIT.md
	docs/local-ai-engineering-audit/04_AGENT_INSTRUCTIONS_AUDIT.md
	docs/local-ai-engineering-audit/05_REPOSITORY_STRUCTURE.md
	docs/local-ai-engineering-audit/06_DOCUMENTATION_AUDIT.md
	docs/local-ai-engineering-audit/07_SPRINT_TASK_AUDIT.md
	docs/local-ai-engineering-audit/08_TESTING_AUDIT.md
	docs/local-ai-engineering-audit/09_GIT_AUDIT.md

nothing added to commit but untracked files present (use "git add" to track)

## Remotes
origin	git@github.com:amrtwap2017-bit/AI-COMPANY-OS.git (fetch)
origin	git@github.com:amrtwap2017-bit/AI-COMPANY-OS.git (push)

## Git Hooks
.rwxr-xr-x  478 amr  6 Jul 17:50 applypatch-msg.sample
.rwxr-xr-x  896 amr  6 Jul 17:50 commit-msg.sample
.rwxr-xr-x 4.7k amr  6 Jul 17:50 fsmonitor-watchman.sample
.rwxr-xr-x  189 amr  6 Jul 17:50 post-update.sample
.rwxr-xr-x  424 amr  6 Jul 17:50 pre-applypatch.sample
.rwxr-xr-x  342 amr 21 Jul 04:58 pre-commit
.rwxr-xr-x 1.6k amr  6 Jul 17:50 pre-commit.sample
.rwxr-xr-x  416 amr  6 Jul 17:50 pre-merge-commit.sample
.rwxr-xr-x 1.4k amr  6 Jul 17:50 pre-push.sample
.rwxr-xr-x 4.9k amr  6 Jul 17:50 pre-rebase.sample
.rwxr-xr-x  544 amr  6 Jul 17:50 pre-receive.sample
.rwxr-xr-x 1.5k amr  6 Jul 17:50 prepare-commit-msg.sample
.rwxr-xr-x 2.8k amr  6 Jul 17:50 push-to-checkout.sample
.rwxr-xr-x 2.3k amr  6 Jul 17:50 sendemail-validate.sample
.rwxr-xr-x 3.6k amr  6 Jul 17:50 update.sample

## .gitignore
07-AI-ENGINE/qdrant_storage/
90-ARCHIVE/
# Security auto-added
*.env
.env
.env.local
.env.production
.env*.local
*.pem
*.key
*.crt
__pycache__/
*.pyc
.venv/
node_modules/
reports/*.md
*.bak
*.bak.*
*.bak2
*.tsfix.bak
*.ts-fix.bak
reports/daily/
tasks/logs/

# Sprint task folders (local only)
tasks/
tasks/**
SPRINT_*_ANALYSIS.md
backups/
*.sql
*.log
__pycache__/
.next/
node_modules/

# AI Engineering OS — preserve .ai/ task and session system
!.ai/
!.ai/**

## GitHub Actions / CI
.github/workflows/check.yml
.github/workflows/ci.yml
.github/workflows/portal-ci.yml
.github/workflows/wave3-deploy.yml
