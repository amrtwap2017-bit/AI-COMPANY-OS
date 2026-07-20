# TRIANGLE BLACK PORTAL — HUB OS TASK REGISTRY

## ROOT CAUSE ANALYSIS

### Why Two Sidebars Appear

PROBLEM 1: PageWrapper missing 'use client'
  PageWrapper imports Breadcrumb which uses usePathname() hook
  Without 'use client' this crashes on server render
  Result: 'Breadcrumb is not defined' on every page

PROBLEM 2: error.tsx files import Breadcrumb
  Next.js error.tsx cannot use hooks
  Result: error boundary itself crashes = blank screen

PROBLEM 3: MobileNav.tsx renders its own fixed header
  Legacy component with h-14 fixed top bar
  EnterpriseTopbar also renders = double topbar on mobile

PROBLEM 4: Sidebar.tsx still imported by ai/page.tsx
  Old sidebar renders INSIDE enterprise shell
  Result: two sidebars visible

PROBLEM 5: Login uses old tokenStore, redirects to /dashboard
  tokenStore is now a shim, direct tokenManager is correct
  /dashboard redirects to /workspace = double redirect

PROBLEM 6: 32 pages use old brand color #1B2B4B
  Enterprise color is amber-600
  Old color creates visual inconsistency

## TASK LIST

TB-001  CRITICAL  PageWrapper - add use client
TB-002  CRITICAL  Error boundaries - remove Breadcrumb import
TB-003  CRITICAL  MobileNav - neutralize legacy component
TB-004  CRITICAL  Sidebar - neutralize legacy component
TB-005  HIGH      Login - tokenManager + /workspace redirect
TB-006  HIGH      Color scheme - replace #1B2B4B with amber-600
TB-007  HIGH      Double layout - remove page-level shell patterns
TB-008  MEDIUM    Breadcrumb label map - complete enterprise labels
TB-009  MEDIUM    Health check script - automated pattern detection
TB-010  HIGH      Enterprise pages - wrap all in PageWrapper
TB-011  HIGH      Route test - all 139 routes return 200

## SPRINT 1 (TB-001 to TB-006) - EXECUTED

## SPRINT 2 NEXT
TB-007: Find all pages with min-h-screen inside shell
TB-010: Wrap remaining enterprise pages in PageWrapper
TB-011: Run route test automation

## ANTI-PATTERNS (never do this in page.tsx)

NEVER:
  <div className='min-h-screen'> inside a page
  import { Sidebar } from '@/components/Sidebar'
  import { MobileNav } from '@/components/ui/MobileNav'
  localStorage.getItem('tb_token')

ALWAYS:
  'use client'; as first line if using hooks
  import { PageWrapper } from '@/components/ui'
  return <PageWrapper>...</PageWrapper> as outermost element
  import { tokenManager } from '@/lib/auth/token-manager'
