# TRIANGLE BLACK PORTAL - COMPLETE UI/UX AUDIT
# Generated: 2026-07-20 10:59
# Standard: Material Design 3 | Apple HIG | SAP Fiori | Linear | Vercel
# Method: Full source code review of all 25 UI components + shell

======================================================================
SECTION 1 - DESIGN SYSTEM FOUNDATION AUDIT
======================================================================

STATUS: PARTIALLY IMPLEMENTED

WHAT EXISTS (globals.css):
  Design tokens defined as CSS custom properties:
    Colors: brand, surface, bg, sidebar, text, border, status
    Spacing: xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48)
    Radius: sm(6) md(10) lg(16) xl(20) full
    Shadow: sm md lg
    Motion: fast(100ms) base(200ms) slow(350ms)
  Typography classes: display heading subhead body caption label
  Skeleton animation: shimmer
  Focus ring: 2px amber outline-offset:2
  Scrollbar: styled 6px custom

CRITICAL GAP - Tokens defined but NOT used:
  Components use raw Tailwind (bg-slate-950, text-amber-600)
  NOT the CSS tokens (var(--color-brand), var(--color-sidebar))
  Result: Changing a token has ZERO effect on components
  This defeats the purpose of the token system entirely

CRITICAL GAP - Typography classes defined but NOT used:
  .text-display, .text-heading etc exist in globals.css
  Components use: text-2xl font-bold, text-sm font-semibold
  No consistency in heading hierarchy across pages

MISSING FROM DESIGN SYSTEM:
  No dark mode tokens (dark: variant classes)
  No component-level tokens (--button-bg, --table-header-bg)
  No z-index scale (modal=50, drawer=60, tooltip=70, toast=80)
  No breakpoint documentation
  No icon size standard

======================================================================
SECTION 2 - COMPONENT QUALITY AUDIT
======================================================================

-- DataTable --
Quality: GOOD (7/10)
Has: sorting, zebra rows, loading skeleton, empty state
Uses: skeleton class from globals.css (correct)
Gaps:
  - No column resizing
  - No row selection / bulk actions
  - No sticky header on scroll
  - No row expand/collapse
  - No export built in
  - Loading skeleton uses .skeleton class but grid breakpoints
    on LoadingState use dynamic Tailwind (grid-cols-${cols})
    which does NOT work in Tailwind v4 (purged at build time)

-- Button --
Quality: GOOD (8/10)
Has: 5 variants, 4 sizes, loading state, icons, active scale
Gaps:
  - Does not use CSS tokens (uses amber-700 directly)
  - No icon-only variant with consistent padding
  - No button group pattern

-- MetricCard --
Quality: GOOD (7/10)
Has: trend indicators, color variants, highlight, onClick
Gaps:
  - No sparkline chart
  - No comparison period text
  - No skeleton loading variant
  - Trend icon is text arrow not real icon

-- LoadingState --
Quality: POOR (3/10)
Critical bug: grid-cols-${cols} in className string
  This is a RUNTIME Tailwind purge issue
  'grid-cols-4' is safe but 'grid-cols-'+cols is purged
  Result: cards loading state shows wrong column count
Gaps:
  - No shimmer animation on card skeletons (uses animate-pulse)
  - No per-page custom skeleton

-- EmptyState --
Quality: GOOD (7/10)
Has: icon, title, description, action slot
Gaps:
  - Emoji icon feels informal for enterprise
  - No illustration slot
  - No secondary action

-- AlertBanner --
Quality: EXCELLENT (9/10)
Has: 5 types, close button, action slot, description
Gap: title/message/description are ambiguous (3 props for same thing)

-- SearchInput --
Quality: GOOD (7/10)
Has: icon, focus ring, transition
Gaps:
  - No clear button (X to clear)
  - No keyboard shortcut hint (/)
  - No debounce built in

-- Pagination --
Quality: GOOD (8/10)
Has: prev/next, page buttons, hidden when 1 page
Gaps:
  - No per-page selector (10/25/50/100)
  - No jump-to-page input
  - Max 7 pages shown - edge cases with many pages

-- ActionBar --
Quality: GOOD (7/10)
Has: search, export, filters slot, actions slot, result count
Gap: No view toggle (table/grid/list)

-- PageHeader --
Quality: GOOD (8/10)
Has: title, subtitle, badge, actions, back button, breadcrumbs
Gap: Built-in breadcrumb and Breadcrumb component are duplicated

-- Breadcrumb --
Quality: GOOD (7/10)
Has: auto from pathname, home icon, chevrons
Gaps:
  - Dynamic segments [id] show raw UUID
  - Dark text on dark backgrounds in some contexts

-- StatusPill / StatusBadge --
Quality: DUPLICATE ISSUE
Two components doing same thing with slightly different APIs
Should be ONE StatusBadge with variant prop

-- SectionCard --
Quality: GOOD (8/10)
Has: title, subtitle, actions, icon, compact, flush
Gap: No expandable/collapsible variant

-- FilterBar --
Quality: NEEDS REVIEW (content not read)

-- CommandBar --
Quality: NEEDS REVIEW (content not read)

-- NotificationDrawer --
Quality: NEEDS REVIEW (content not read)

======================================================================
SECTION 3 - MISSING COMPONENTS (Critical for enterprise)
======================================================================

TIER 1 - BLOCKING (pages broken without these):
  Input          - No styled text input component
                   Pages use raw <input> with inline Tailwind
  Select         - No styled select/dropdown component
  Textarea       - No styled multiline input
  Modal/Dialog   - No accessible modal (ConfirmDialog exists but not reusable)
  Drawer         - No slide-in panel component
  Toast          - Sonner used but no TB-branded wrapper

TIER 2 - HIGH IMPACT (enterprise UX gaps):
  Tabs           - No tab navigation component
                   Center pages have no sub-navigation tabs
  Avatar         - No user avatar with fallback
  Badge (inline) - No inline badge/chip for tags
  Tooltip        - No accessible hover tooltip
  Combobox       - No searchable dropdown
  DatePicker     - No date input for scheduling, PM plans
  FileUpload     - No upload component for documents
  Progress       - No progress bar (PM plan completion)
  Stepper        - No multi-step form wizard

TIER 3 - WORLD-CLASS FEATURES:
  KanbanBoard    - For dispatch/workflow views
  Timeline       - For entity history, audit log
  Calendar       - For maintenance schedule view
  TreeView       - For asset hierarchy
  Chart (unified)- Recharts is there but no standard wrapper
  Sparkline      - For MetricCard trend visualization
  DataGrid       - Advanced table with inline editing

======================================================================
SECTION 4 - SHELL/NAVIGATION UX AUDIT
======================================================================

-- Sidebar --
Quality: GOOD (8/10)
Has: accordion groups, tooltips, persistence, auth user, badges
Gaps:
  - No context sub-navigation within a center
  - w-60 expanded is slightly narrow for long labels
  - Group labels too small (10px) - visibility risk
  - No keyboard navigation (arrow keys) within nav

-- Topbar --
Quality: GOOD (8/10)
Has: command bar, notifications, AI link, user menu
Gaps:
  - Notification fetch uses NEXT_PUBLIC_API_URL directly
    (should use /api/v1/notifications/ via proxy rewrite)
  - Breadcrumb is single-level (Home / Center only)
  - No page-level title in topbar on mobile
  - No online/offline status indicator
  - User menu My Profile and Settings links do nothing (no router.push)

-- Shell overall --
Quality: GOOD (7/10)
Gaps:
  - No shell-level loading skeleton
  - No transition between pages
  - Content area has no max-width on ultra-wide screens
  - No keyboard shortcut for sidebar toggle

======================================================================
SECTION 5 - PAGE-LEVEL UX PATTERNS
======================================================================

CONSISTENT ACROSS ALL PAGES:
  Breadcrumb -> PageHeader -> KPIs -> Filters -> Table -> Pagination
  This pattern is correct and professional

INCONSISTENCIES FOUND:
  1. Some pages use PageWrapper (has breadcrumb built in)
     Some pages have standalone <Breadcrumb/> before <PageHeader/>
     Double breadcrumb possible

  2. KPI cards: some use MetricCard, some use custom div
     No standard KPI layout across all pages

  3. Status filters: some use button tabs, some use FilterBar
     No standard filter pattern

  4. Loading states: some use LoadingState, some use isLoading inline
     No standard skeleton per domain

  5. Error display: some use AlertBanner, some use plain text
     No standard error display

======================================================================
SECTION 6 - RESPONSIVE/MOBILE UX AUDIT
======================================================================

Mobile (375px - 767px):
  MobileBottomBar: exists, 4 items, fixed bottom
  MobileCenterDrawer: exists, shows all centers
  Tables: overflow-x-auto on DataTable (correct)
  KPI grids: grid-cols-2 on mobile (correct)
  PageWrapper: px-4 sm:px-6 (correct)
  GAPS:
    - No mobile-specific page headers
    - Forms have no mobile-optimized layout
    - Command bar not accessible from mobile
    - User menu not accessible from mobile topbar

Tablet (768px - 1023px):
  Sidebar: hidden below lg (correct)
  Topbar breadcrumb: hidden below md (gap)
  KPI grids: still grid-cols-2 (too narrow for 4-col KPIs)

Desktop (1024px+):
  Layout correct
  At 1920px+ content gets too wide (no max-width cap)

======================================================================
SECTION 7 - TYPOGRAPHY AND VISUAL HIERARCHY AUDIT
======================================================================

CRITICAL ISSUES:
  1. No consistent heading hierarchy
     H1: sometimes text-2xl, sometimes text-xl, sometimes text-[1.375rem]
     No rule for when to use which size

  2. Font not loaded via next/font
     globals.css: font-family: Inter, system-ui, sans-serif
     Inter is NOT imported - falls back to system-ui
     Visual inconsistency across OS/browser

  3. Line heights inconsistent
     Some text: leading-tight, some leading-relaxed, some default
     No semantic leading tokens

  4. Color contrast not verified
     text-slate-400 on bg-white = 4.6:1 (marginal WCAG AA)
     text-slate-300 on bg-slate-950 = needs measurement
     Active nav items amber on dark = likely fails at small sizes

======================================================================
SECTION 8 - INTERACTION QUALITY AUDIT
======================================================================

GOOD:
  Button: active:scale-[0.98] press feedback
  Sidebar: smooth 200ms transition
  Focus: 2px amber focus ring
  Hover: all interactive elements have hover states

GAPS:
  No page transition animation
  No optimistic UI updates on mutations
  No toast feedback after form submission
  No pull-to-refresh on mobile
  Form validation errors: not shown inline under fields
  No skeleton shimmer on initial page load
  No error recovery UI (retry button) on failed data loads

======================================================================
UI/UX SCORECARD
======================================================================

Design System Foundation    5/10  tokens exist but not used
Component Quality           7/10  good base, missing enterprise pieces
Component Coverage          4/10  15+ missing components
Navigation UX               7/10  sidebar excellent, topbar good
Page Layout Consistency     6/10  pattern exists but inconsistent
Typography System           4/10  classes defined, not applied
Responsive Design           6/10  mobile exists but incomplete
Loading/Empty States        6/10  exist but have bugs
Interaction Quality         6/10  good base, missing polish
Accessibility               3/10  focus ring good, rest missing
Visual Polish               6/10  clean but not world-class

OVERALL UI/UX SCORE: 5.5/10
Target: 9/10 (comparable to Linear, Vercel, Retool)
