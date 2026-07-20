# TRIANGLE BLACK - UI/UX TASK REGISTRY
# Generated: 2026-07-20 10:59
# Goal: World-class enterprise UI comparable to Linear/Vercel/SAP Fiori
# Total: 52 tasks across 5 sprints

======================================================================
SPRINT UI-0 - CRITICAL BUGS (Execute TODAY - 2 hours)
======================================================================

UI-000  CRITICAL  Fix LoadingState grid-cols dynamic class bug
  File: components/ui/LoadingState.tsx
  Bug: grid-cols-${cols} is purged by Tailwind at build time
  Fix: Use lookup object: {2:'grid-cols-2', 3:'grid-cols-3'...}
  Impact: Card loading states show wrong layout on every page
  Time: 15 minutes

UI-001  HIGH  Load Inter font via next/font
  File: portal/app/layout.tsx
  Add: import { Inter } from 'next/font/google'
  Apply: className={inter.className} to <html>
  Impact: Consistent typography across all OS/browsers
  Time: 30 minutes

UI-002  HIGH  Fix Topbar user menu - wire Profile and Settings links
  File: components/workspace/EnterpriseTopbar.tsx
  Fix: My Profile -> router.push('/profile')
       Settings   -> router.push('/settings')
  Impact: Dead buttons in production - users cannot navigate
  Time: 15 minutes

UI-003  HIGH  Fix Topbar notification endpoint URL
  File: components/workspace/EnterpriseTopbar.tsx
  Current: NEXT_PUBLIC_API_URL + '/notifications/?limit=20'
  Fix: use /api/v1/notifications/?limit=20 (uses Next.js proxy rewrite)
  Impact: Notifications bypass auth proxy and may fail cross-origin
  Time: 10 minutes

UI-004  MEDIUM  Remove double breadcrumb pattern
  Issue: PageWrapper has showBreadcrumb=true by default
         Some pages also render <Breadcrumb/> manually
  Fix: Audit all pages - remove standalone Breadcrumb when PageWrapper used
  Time: 1 hour

======================================================================
SPRINT UI-1 - DESIGN SYSTEM FOUNDATION (Week 1)
======================================================================

UI-010  CRITICAL  Wire CSS tokens to components
  Components use raw Tailwind, CSS tokens are orphaned
  Fix: Create Tailwind theme extension in tailwind.config.ts
    colors.brand = 'var(--color-brand)'
    colors.surface = 'var(--color-surface)'
    etc for all tokens
  Then use: bg-brand instead of bg-amber-700
  Apply to: Button, MetricCard, PageHeader first
  Time: 3 hours

UI-011  HIGH  Apply typography scale consistently
  Define semantic heading usage:
    Page titles:   text-display (2rem 700)
    Section heads: text-heading (1.25rem 600)
    Card titles:   text-subhead (1rem 600)
    Body text:     text-body (0.875rem 400)
    Labels/caps:   text-label (0.6875rem 600 uppercase)
  Apply to: PageHeader, SectionCard, MetricCard, DataTable headers
  Time: 2 hours

UI-012  HIGH  Create tailwind.config.ts with token bridge
  File: portal/tailwind.config.ts
  Map all CSS tokens to Tailwind utilities
  Add: z-index scale (modal:50, drawer:60, tooltip:70, toast:80)
  Add: screen breakpoints documentation
  Time: 2 hours

UI-013  HIGH  Add skip-to-content and ARIA landmarks
  File: components/workspace/EnterpriseShell.tsx
  Add: <a href='#main-content'> skip link (first element)
  Add: aria-label to aside, header, main, nav
  Time: 1 hour

UI-014  MEDIUM  Standardize z-index across overlays
  Currently: z-30 z-40 z-50 z-[80] z-[85] mixed randomly
  Define and document z-index scale
  Apply consistently to: sidebar, topbar, modals, tooltips, toasts
  Time: 1 hour

======================================================================
SPRINT UI-2 - MISSING CORE COMPONENTS (Week 2)
======================================================================

UI-020  CRITICAL  Build Input component
  File: components/ui/Input.tsx
  Variants: default, error, success, disabled
  Features: label, helper text, error message, prefix/suffix icon
  Replace: all raw <input> in forms
  Time: 2 hours

UI-021  CRITICAL  Build Select component
  File: components/ui/Select.tsx
  Features: label, placeholder, options, error state, searchable
  Replace: all raw <select> in forms
  Time: 2 hours

UI-022  CRITICAL  Build Modal component
  File: components/ui/Modal.tsx
  Features: focus trap, Escape close, backdrop click, animation
  Replace: ConfirmDialog (which is not generic enough)
  Time: 3 hours

UI-023  HIGH  Build Tabs component
  File: components/ui/Tabs.tsx
  Features: underline and pill variants, keyboard navigation
  Use in: center sub-pages (Operations has 10+ sub-pages)
  Time: 2 hours

UI-024  HIGH  Build Drawer component
  File: components/ui/Drawer.tsx
  Features: right/left slide, overlay, Escape close
  Use in: entity detail, notifications, filters
  Time: 2 hours

UI-025  HIGH  Build Avatar component
  File: components/ui/Avatar.tsx
  Features: image, initials fallback, size variants, online indicator
  Use in: user menu, technician cards, agent cards
  Time: 1 hour

UI-026  HIGH  Build Tooltip component
  File: components/ui/Tooltip.tsx
  Features: hover + focus, placement, accessible aria-describedby
  Use in: collapsed sidebar, icon buttons, truncated text
  Time: 2 hours

UI-027  HIGH  Build Badge/Chip component
  File: components/ui/Badge.tsx (merge StatusPill + StatusBadge)
  Variants: status, priority, count, removable
  Consolidate: StatusPill and StatusBadge into one component
  Time: 2 hours

UI-028  HIGH  Build Textarea component
  File: components/ui/Textarea.tsx
  Features: auto-resize, character count, label, error state
  Time: 1 hour

UI-029  MEDIUM  Build Progress component
  File: components/ui/Progress.tsx
  Variants: linear bar, circular ring, segmented
  Use in: PM plan completion, project progress, capacity bars
  Time: 1 hour

======================================================================
SPRINT UI-3 - COMPONENT UPGRADES (Week 3)
======================================================================

UI-030  HIGH  Upgrade MetricCard with sparkline
  File: components/ui/MetricCard.tsx
  Add: optional sparkline prop (number[])
  Render: inline SVG sparkline using recharts Sparkline
  Add: comparison period (vs last month)
  Add: skeleton loading variant
  Time: 3 hours

UI-031  HIGH  Upgrade DataTable
  File: components/ui/DataTable.tsx
  Add: sticky header (position:sticky top-0)
  Add: row selection checkboxes
  Add: bulk action bar (appears when rows selected)
  Add: column visibility toggle
  Add: proper skeleton per column type
  Time: 4 hours

UI-032  HIGH  Upgrade Pagination
  File: components/ui/Pagination.tsx
  Add: per-page selector (10/25/50/100)
  Add: total records display
  Add: keyboard navigation
  Time: 2 hours

UI-033  HIGH  Upgrade SearchInput
  File: components/ui/SearchInput.tsx
  Add: clear button (X) when value present
  Add: keyboard shortcut hint (/)
  Add: built-in useDebounce (300ms)
  Time: 1 hour

UI-034  HIGH  Upgrade LoadingState (fix bug + improve)
  File: components/ui/LoadingState.tsx
  Fix: grid-cols dynamic class bug
  Add: shimmer animation (use .skeleton class)
  Add: more skeleton types (form, detail panel, list)
  Time: 2 hours

UI-035  MEDIUM  Upgrade EmptyState
  File: components/ui/EmptyState.tsx
  Replace: emoji icon with Lucide icon component prop
  Add: illustration slot
  Add: secondary action
  Improve: enterprise-appropriate visual style
  Time: 1 hour

UI-036  MEDIUM  Upgrade ActionBar
  File: components/ui/ActionBar.tsx
  Add: view toggle (table/grid)
  Add: column visibility menu
  Add: date range filter slot
  Time: 2 hours

UI-037  MEDIUM  Build Sparkline component
  File: components/ui/Sparkline.tsx
  Features: SVG sparkline, color variants, area fill
  Use in: MetricCard trend visualization
  Time: 2 hours

======================================================================
SPRINT UI-4 - PAGE STANDARDIZATION (Week 4)
======================================================================

UI-040  HIGH  Standardize all list pages
  Pattern: PageWrapper > PageHeader > KPI strip > ActionBar > DataTable > Pagination
  Pages to standardize:
    leads, work-orders, technicians, assets, inventory, warehouses
    contracts, quotes, invoices, agents, reports, notifications
  Each must use same pattern without deviation
  Time: 6 hours

UI-041  HIGH  Standardize all center hub pages
  Pattern: PageWrapper > CenterHeader > KPI cards > Module grid
  Pages: operations, maintenance, supply-chain, commercial,
         executive, engineering, analytics, projects-center, customers
  Time: 4 hours

UI-042  HIGH  Build center sub-navigation (Tabs pattern)
  Each center has 8-12 sub-pages but no tab navigation
  Add: horizontal tab bar below topbar for each center
  Use: Tabs component from UI-023
  Time: 4 hours

UI-043  HIGH  Build reusable KPI section component
  File: components/ui/KpiSection.tsx
  Standard: 4-column grid, consistent card size, same skeleton
  Replace: all custom KPI div patterns across pages
  Time: 2 hours

UI-044  MEDIUM  Standardize status filter tab pattern
  File: components/ui/StatusFilterTabs.tsx
  All list pages need: All | Status1 | Status2 | Status3
  Single reusable component instead of per-page button groups
  Time: 1 hour

UI-045  MEDIUM  Standardize error handling display
  All pages: use AlertBanner with retry button on data fetch errors
  No page should show raw error strings
  Time: 2 hours

======================================================================
SPRINT UI-5 - POLISH AND WORLD-CLASS FEATURES (Week 5)
======================================================================

UI-050  HIGH  Add page transition animation
  File: app/layout.tsx or providers.tsx
  Method: CSS opacity fade on route change
  Duration: 150ms ease
  Time: 1 hour

UI-051  HIGH  Add toast notification system (TB branded)
  Sonner is installed - create TB wrapper
  File: lib/toast.ts
  Methods: toast.success(), toast.error(), toast.info(), toast.loading()
  Use consistently after every mutation
  Time: 1 hour

UI-052  HIGH  Add inline form validation errors
  All forms must show errors below each field immediately
  Use react-hook-form + zod that is already installed
  Create: FormField component that wraps Input + error display
  Time: 3 hours

UI-053  HIGH  Add optimistic UI for approvals
  approvals/page.tsx: when approve/reject clicked
  Immediately remove item from list (optimistic)
  Rollback if API call fails
  Show toast confirmation
  Time: 2 hours

UI-054  MEDIUM  Add column max-width to prevent ultra-wide layout
  PageWrapper: add max-w-screen-2xl (already there, verify)
  DataTable: cap table width at screen-2xl
  Time: 30 minutes

UI-055  MEDIUM  Add pull-to-refresh pattern on mobile
  Mobile list pages: swipe down triggers refetch()
  Show loading indicator at top
  Time: 2 hours

UI-056  MEDIUM  Add keyboard shortcut system
  G+W = Go to Workspace
  G+L = Go to Leads
  G+O = Go to Operations
  N   = New (context-aware)
  / or Cmd+K = Command bar
  ? = Show keyboard shortcuts modal
  File: lib/keyboard-shortcuts.ts + ShortcutsModal component
  Time: 3 hours

UI-057  MEDIUM  Improve mobile command bar access
  Current: Cmd+K only (desktop)
  Add: Floating search button on mobile (bottom right)
  Time: 1 hour

UI-058  LOW  Add page-level context actions dock
  Each page: floating action button (FAB) on mobile
  Desktop: appears in PageHeader actions already
  Time: 2 hours

======================================================================
EXECUTION PRIORITY MATRIX
======================================================================

EXECUTE TODAY:
  UI-000  LoadingState grid bug fix           15 min  CRITICAL
  UI-001  Inter font loading                  30 min  HIGH
  UI-002  Topbar user menu links              15 min  HIGH
  UI-003  Notification URL fix               10 min  HIGH

WEEK 1:
  UI-010  CSS token wiring                    3h      CRITICAL
  UI-011  Typography scale                    2h      HIGH
  UI-013  Skip link + ARIA                    1h      HIGH
  UI-012  Tailwind config                     2h      HIGH

WEEK 2:
  UI-020  Input component                     2h      CRITICAL
  UI-021  Select component                    2h      CRITICAL
  UI-022  Modal component                     3h      CRITICAL
  UI-023  Tabs component                      2h      HIGH
  UI-024  Drawer component                    2h      HIGH
  UI-025  Avatar component                    1h      HIGH
  UI-026  Tooltip component                   2h      HIGH
  UI-027  Badge/Chip component               2h      HIGH

WEEK 3:
  UI-030  MetricCard upgrade                  3h      HIGH
  UI-031  DataTable upgrade                   4h      HIGH
  UI-032  Pagination upgrade                  2h      HIGH
  UI-033  SearchInput upgrade                 1h      HIGH
  UI-034  LoadingState upgrade                2h      HIGH

WEEK 4:
  UI-040  List page standardization           6h      HIGH
  UI-041  Center hub standardization          4h      HIGH
  UI-042  Center sub-navigation               4h      HIGH
  UI-043  KPI section component              2h      HIGH

WEEK 5:
  UI-050  Page transitions                    1h      HIGH
  UI-051  Toast system                        1h      HIGH
  UI-052  Form validation                     3h      HIGH
  UI-053  Optimistic UI                       2h      MEDIUM
  UI-056  Keyboard shortcuts                  3h      MEDIUM

======================================================================
EXPECTED OUTCOME AFTER ALL SPRINTS
======================================================================

Design System            5/10 -> 9/10
Component Quality        7/10 -> 9/10
Component Coverage       4/10 -> 9/10
Navigation UX            7/10 -> 9/10
Page Layout Consistency  6/10 -> 9/10
Typography               4/10 -> 9/10
Responsive Design        6/10 -> 8/10
Interaction Quality      6/10 -> 9/10
Accessibility            3/10 -> 7/10
Visual Polish            6/10 -> 9/10

OVERALL: 5.5/10 -> 8.8/10
Comparable to: Retool, Vercel Dashboard, Planetscale, Linear
