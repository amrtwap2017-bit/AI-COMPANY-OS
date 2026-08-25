# UX Reality — A-001 Audit August 2026

## Design System: TBEDS 7.1
- 414 CSS utility classes in portal/app/globals.css
- Token system: tb-hero, tb-card, tb-btn, tb-badge, tb-grid-*
- Component library: 49 components in portal/components/ui/
- Color system: neutral enterprise with champagne/bronze brand accent

## Inline Style Status
- Total: 1,025 (was 2,236 at start of TBEDS work)
- All remaining: dynamic values (chart colors, progress widths)
- Status: ACCEPTABLE — no further bulk cleanup needed

## @ts-nocheck Status
- Count: 2 files (was 234)
- Remaining: login/page.tsx + supplier-portal/page.tsx (dark theme — intentional)
- Status: ✅ CLEAN

## Workflow UX Gap (From Upgrade Plan)
The upgrade plan identifies "Workflow UX" as next priority.
Current UX is built around pages, not personas.
Required persona-based views:
- Executive: "Tell me what needs my attention" → Baseline Report ✅
- Manager: "Tell me what is going wrong" → Risk Score ✅
- Engineer: "Tell me what to execute" → Work Order list
- Procurement: "Tell me what to buy" → PO/PR dashboard
- Technician: "Tell me what to do next" → Technician portal ✅ (basic)
- Client: "Tell me what is happening" → Client portal ✅ (basic)
