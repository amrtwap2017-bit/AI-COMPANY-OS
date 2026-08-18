# Design Migration Plan

## Current State

Token Architecture: EXISTS (CSS custom properties in globals.css)
Tailwind Integration: EXISTS (var() references in tailwind.config.ts)
Component Library: EXISTS (40+ components in portal/components/ui/)
Design Tokens File: EXISTS (portal/lib/design-tokens.ts)
Current Theme: warm-dark default in platform-config.ts

## Migration Strategy

DO NOT perform a global color replacement.
DO migrate token by token with verification.

## Phase 1 — Token Override (SPRINT-009)

Update globals.css :root token values.
NO component changes required — everything using CSS vars updates automatically.

Key changes:
- --color-bg: #181614 → #F4F4F2
- --color-surface: #2D2723 → #FFFFFF  
- --color-sidebar: #0F0D0B → #1C1C1E
- --color-text-1: (already correct in light mode)
- Status colors: add semantic completeness

## Phase 2 — Component Audit (SPRINT-010+)

Identify components with hardcoded colors bypassing token system.
Migrate each component to use tokens exclusively.

Priority order:
1. Button
2. Badge/Status
3. Table
4. Card
5. Navigation
6. Form inputs
7. Dialogs

## Phase 3 — Reference Screens (SPRINT-011+)

Upgrade 5 reference screens:
1. Executive Dashboard
2. Operations Command Center
3. Maintenance / Asset Workspace
4. Procurement Workspace
5. AI Intelligence Workspace

## Phase 4 — Systematic Migration

Workspace by workspace migration.
Lint/typecheck/test after each workspace.

## Risk Register

HIGH: Inline styles (1223) bypass token system — must be removed incrementally
HIGH: 238 ts-nocheck directives may hide color issues
MEDIUM: Dark/light mode toggle wiring not connected to PLATFORM config
LOW: Portal/client-portal/supplier-portal use separate styling

## Rollback

Token changes in globals.css are instantly reversible.
Git revert of globals.css restores previous visual state.
No database or API changes involved.
