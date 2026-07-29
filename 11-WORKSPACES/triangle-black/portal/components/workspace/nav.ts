// Triangle Black — Unified Enterprise Navigation
// Sprint 262: Complete navigation rebuild — all 16 sprints connected
// Every link verified against actual built pages

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  description?: string;
}

export interface NavCenter {
  key: string;
  label: string;
  shortLabel?: string;
  href: string;
  subtitle?: string;  // optional for backward compat
  badge?: string;
  icon?: string;
  children?: NavItem[];
}

export const enterpriseCenters: NavCenter[] = [
  // ── WORKSPACE ──────────────────────────────────────────────────────────────
  {
    key: "workspace",
    label: "Workspace",
    shortLabel: "Home",
    href: "/workspace",
    badge: "Live",
  },

  // ── EXECUTIVE ──────────────────────────────────────────────────────────────
  {
    key: "executive",
    label: "Executive",
    shortLabel: "Executive",
    href: "/executive/dashboard",
    children: [
      { label: "Executive Dashboard",  href: "/executive/dashboard",   icon: "📊", description: "Live KPIs + alerts" },
      { label: "Financial P&L",        href: "/financial",              icon: "💰", description: "Revenue, aging, projects" },
      { label: "Reports Center",       href: "/reports",                icon: "📋", description: "12 report types + CSV/PDF" },
      { label: "Notifications",        href: "/notifications",          icon: "🔔", description: "Alerts + platform events" },
    ],
  },

  // ── OPERATIONS ─────────────────────────────────────────────────────────────
  {
    key: "operations",
    label: "Operations",
    shortLabel: "Ops",
    href: "/operations/work-orders",
    badge: "OPS",
    children: [
      { label: "Work Orders",          href: "/operations/work-orders",          icon: "🔧", description: "All work orders" },
      { label: "Create Work Order",    href: "/operations/work-orders/new",      icon: "➕", description: "New WO" },
      { label: "Dispatch Board",       href: "/operations/dispatch",             icon: "📋", description: "Kanban + tech assign" },
      { label: "Service Requests",     href: "/operations/service-requests",     icon: "🎫", description: "Client requests" },
      { label: "Maintenance Schedule", href: "/operations/maintenance",          icon: "📅", description: "PM scheduler + calendar" },
      { label: "Technicians",          href: "/operations/technicians",          icon: "👷", description: "Team management" },
      { label: "Sites",                href: "/operations/sites",                icon: "📍", description: "Hotel sites" },
    ],
  },

  // ── ASSETS ─────────────────────────────────────────────────────────────────
  {
    key: "assets",
    label: "Assets",
    shortLabel: "Assets",
    href: "/operations/assets/qr",
    children: [
      { label: "Asset QR Codes",       href: "/operations/assets/qr",           icon: "📱", description: "Scan → view + create WO" },
      { label: "Asset Inventory",      href: "/maintenance/assets",             icon: "🏭", description: "All managed assets" },
      { label: "Maintenance Schedule", href: "/operations/maintenance",          icon: "📅", description: "PM calendar" },
    ],
  },

  // ── PROCUREMENT (Supply Chain) ─────────────────────────────────────────────
  {
    key: "supply-chain",
    label: "Procurement",
    shortLabel: "Procure",
    href: "/supply-chain/procurement",
    badge: "SCM",
    children: [
      { label: "Procurement Hub",      href: "/supply-chain/procurement",        icon: "🏗️",  description: "P2P overview" },
      { label: "Scope of Work",        href: "/supply-chain/scope-of-work",      icon: "📋", description: "SOW + BOQ" },
      { label: "Vendor Management",    href: "/supply-chain/vendor-management",  icon: "🏭", description: "Approved vendors" },
      { label: "RFQ Management",       href: "/supply-chain/rfq-management",     icon: "📝", description: "Requests for quotation" },
      { label: "Purchase Orders",      href: "/supply-chain/purchase-orders-v2", icon: "📦", description: "PO with line items" },
      { label: "Goods Receipts",       href: "/supply-chain/goods-receipts/new", icon: "✅", description: "Receive deliveries" },
      { label: "Approvals Center",     href: "/supply-chain/approvals-center",   icon: "✍️",  description: "Pending approvals" },
    ],
  },

  // ── FINANCIAL ──────────────────────────────────────────────────────────────
  {
    key: "financial",
    label: "Financial",
    shortLabel: "Finance",
    href: "/financial",
    children: [
      { label: "P&L Dashboard",        href: "/financial",                       icon: "💰", description: "Revenue + costs" },
      { label: "Invoice Management",   href: "/supply-chain/invoices",           icon: "📄", description: "3-way match + payment" },
      { label: "Invoice Aging",        href: "/reports",                         icon: "⏰", description: "Aged receivables" },
      { label: "Payment Tracking",     href: "/payment-tracking",                icon: "💳", description: "Payment records" },
    ],
  },

  // ── REPORTS ────────────────────────────────────────────────────────────────
  {
    key: "reports",
    label: "Reports",
    shortLabel: "Reports",
    href: "/reports",
    children: [
      { label: "Report Center",        href: "/reports",                         icon: "📊", description: "12 report types" },
      { label: "Work Orders Report",   href: "/reports",                         icon: "🔧", description: "WO analysis" },
      { label: "Invoice Report",       href: "/reports",                         icon: "📄", description: "Financial reports" },
      { label: "Vendor Performance",   href: "/reports",                         icon: "🏭", description: "Vendor KPIs" },
      { label: "Executive Summary",    href: "/reports",                         icon: "📈", description: "All KPIs" },
    ],
  },

  // ── PORTALS ────────────────────────────────────────────────────────────────
  {
    key: "portals",
    label: "Portals",
    shortLabel: "Portals",
    href: "/client-portal",
    children: [
      { label: "Client Portal",        href: "/client-portal",                   icon: "🏨", description: "Hotel clients (PIN)" },
      { label: "Supplier Portal",      href: "/supplier-portal",                 icon: "🏭", description: "Vendors (PIN)" },
    ],
  },

  // ── COMMERCIAL ─────────────────────────────────────────────────────────────
  {
    key: "commercial",
    label: "Commercial",
    shortLabel: "CRM",
    href: "/commercial",
    badge: "CRM",
    children: [
      { label: "Leads Pipeline",       href: "/commercial/leads",                icon: "🎯", description: "Sales leads" },
      { label: "Pipeline View",        href: "/commercial/pipeline",             icon: "📊", description: "Deal pipeline" },
      { label: "Contracts",            href: "/commercial/contracts",            icon: "📋", description: "Active contracts" },
    ],
  },
];

// Navigation groups for sections
export const navGroups = [
  {
    label: "Platform",
    items: ["workspace", "executive"],
  },
  {
    label: "Operations",
    items: ["operations", "assets"],
  },
  {
    label: "Supply Chain",
    items: ["supply-chain", "financial"],
  },
  {
    label: "Intelligence",
    items: ["reports", "portals", "commercial"],
  },
];

export type { NavItem as NavSubItem };

// ── Mobile primary nav (bottom bar) ───────────────────────────────
export const mobilePrimaryNav = [
  { label: "Home",     href: "/workspace",               icon: "🏠" },
  { label: "Ops",      href: "/operations/work-orders",  icon: "🔧" },
  { label: "Procure",  href: "/supply-chain/procurement",icon: "📦" },
  { label: "Reports",  href: "/reports",                 icon: "📊" },
  { label: "More",     href: "/executive/dashboard",     icon: "📈" },
];

// ── Legacy re-exports for backward compat ──────────────────────────
export type NavChild = NavItem;
export type NavGroup = { label: string; keys: string[]; };
