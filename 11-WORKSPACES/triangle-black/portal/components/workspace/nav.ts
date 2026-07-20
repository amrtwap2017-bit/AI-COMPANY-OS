// Triangle Black - Unified Navigation
// Merged: Legacy accordion sub-nav + Enterprise center structure
// Every feature from both systems preserved in one sitemap
// Zero features lost in migration

// ── Types ─────────────────────────────────────────────────────────

export type NavChild = {
  label:  string;
  href:   string;
  badge?: string;
};

export type NavCenter = {
  key:       string;
  label:     string;
  shortLabel:string;
  href:      string;
  subtitle:  string;
  badge?:    string;
  icon?:     string;
  children?: NavChild[];
};

export type NavGroup = {
  label: string;
  keys:  string[];
};

// ── Complete Center + Sub-nav Map ─────────────────────────────────
// Merges: legacy accordion children + enterprise center top-level nav
// Rule: enterprise href is the center landing page
//       children are the sub-pages (legacy routes preserved)

export const enterpriseCenters: NavCenter[] = [
  // ── COMMAND GROUP ─────────────────────────────────────────────
  {
    key:        "workspace",
    label:      "Dashboard",
    shortLabel: "Home",
    href:       "/workspace",
    subtitle:   "Live overview of operations, pipeline, and team",
    badge:      "Live",
  },
  {
    key:        "approvals",
    label:      "Approval Center",
    shortLabel: "Inbox",
    href:       "/approvals",
    subtitle:   "Unified inbox for all items requiring review or approval",
    badge:      "Inbox",
  },
  {
    key:        "executive",
    label:      "Executive Center",
    shortLabel: "Exec",
    href:       "/executive",
    subtitle:   "Revenue, risk, portfolio, and decisions",
    children: [
      { label: "Overview",        href: "/executive" },
      { label: "Intelligence",    href: "/executive/intelligence" },
      { label: "Daily Review",    href: "/executive/daily-review" },
      { label: "Portfolio",       href: "/executive/portfolio" },
      { label: "Risks",           href: "/executive/risks" },
      { label: "Exceptions",      href: "/executive/exceptions" },
      { label: "Reports",         href: "/executive/reports" },
      { label: "Workbench",       href: "/executive/workbench" },
    ],
  },
  {
    key:        "analytics",
    label:      "Analytics",
    shortLabel: "KPIs",
    href:       "/analytics",
    subtitle:   "KPIs, scorecards, trends and executive intelligence",
    badge:      "New",
    children: [
      { label: "Overview",    href: "/analytics" },
      { label: "Scorecards",  href: "/analytics/scorecards" },
      { label: "SLA Reports", href: "/analytics/sla" },
    ],
  },

  // ── BUSINESS GROUP ────────────────────────────────────────────
  {
    key:        "commercial",
    label:      "Commercial",
    shortLabel: "Sales",
    href:       "/commercial",
    subtitle:   "CRM, quotations, contracts, and relationships",
    badge:      "CRM",
    children: [
      { label: "Overview",       href: "/commercial" },
      { label: "Leads",          href: "/leads",              badge: "CRM" },
      { label: "Customers",      href: "/customers" },
      { label: "Contracts",      href: "/contracts" },
      { label: "Invoices",       href: "/invoices" },
      { label: "Quotes",         href: "/quotes" },
      { label: "Pipeline",       href: "/commercial/pipeline" },
      { label: "Workbench",      href: "/commercial/workbench" },
      { label: "Review",         href: "/commercial/review" },
      { label: "Contract Renewal", href: "/commercial/contracts/renewal" },
    ],
  },
  {
    key:        "customers",
    label:      "Customer Success",
    shortLabel: "CS",
    href:       "/customers",
    subtitle:   "Health scores, renewals, satisfaction and 360 client view",
    badge:      "New",
    children: [
      { label: "Overview",    href: "/customers" },
      { label: "360 View",    href: "/customers/360" },
      { label: "Review",      href: "/customers/review" },
    ],
  },
  {
    key:        "projects-center",
    label:      "Projects",
    shortLabel: "Proj",
    href:       "/projects-center",
    subtitle:   "Project 360, phases, budget, risks, and site reports",
    children: [
      { label: "Overview",    href: "/projects-center" },
      { label: "Actions",     href: "/projects-center/actions" },
      { label: "Intelligence",href: "/projects-center/intelligence" },
      { label: "Review",      href: "/projects-center/review" },
      { label: "Schedule",    href: "/projects-center/review/schedule" },
    ],
  },

  // ── OPERATIONS GROUP ──────────────────────────────────────────
  {
    key:        "operations",
    label:      "Operations",
    shortLabel: "Ops",
    href:       "/operations",
    subtitle:   "Dispatch, work orders, SLA, and execution",
    badge:      "OPS",
    children: [
      { label: "Overview",         href: "/operations" },
      { label: "Work Orders",      href: "/operations/work-orders" },
      { label: "New Work Order",   href: "/operations/work-orders/new" },
      { label: "Dispatch Board",   href: "/operations/dispatch" },
      { label: "Service Requests", href: "/operations/service-requests" },
      { label: "Calendar",         href: "/operations/calendar" },
      { label: "SLA Review",       href: "/operations/sla-review" },
      { label: "Technicians",      href: "/operations/technicians" },
      { label: "Workbench",        href: "/operations/workbench" },
      { label: "Workflows",        href: "/operations/workflows" },
      { label: "Command",          href: "/operations/command" },
    ],
  },
  {
    key:        "maintenance",
    label:      "Maintenance",
    shortLabel: "MX",
    href:       "/maintenance",
    subtitle:   "Asset tree, PM plans, work items, and corrective actions",
    badge:      "MNT",
    children: [
      { label: "Overview",      href: "/maintenance" },
      { label: "Assets",        href: "/maintenance/assets" },
      { label: "Asset Tree",    href: "/maintenance/asset-tree" },
      { label: "PM Plans",      href: "/maintenance/pm-plans" },
      { label: "Schedule",      href: "/maintenance/schedule" },
      { label: "Intelligence",  href: "/maintenance/intelligence" },
      { label: "Actions",       href: "/maintenance/actions" },
      { label: "Cost Review",   href: "/maintenance/costs/review" },
      { label: "Downtime",      href: "/maintenance/downtime/review" },
    ],
  },
  {
    key:        "engineering",
    label:      "Engineering",
    shortLabel: "Eng",
    href:       "/engineering",
    subtitle:   "Projects, documents, inspections, and site management",
    badge:      "ENG",
    children: [
      { label: "Overview",      href: "/engineering" },
      { label: "AI Assistant",  href: "/engineering/ai" },
      { label: "Intelligence",  href: "/engineering/intelligence" },
      { label: "Actions",       href: "/engineering/actions" },
      { label: "Review",        href: "/engineering/review" },
    ],
  },
  {
    key:        "supply-chain",
    label:      "Supply Chain",
    shortLabel: "Supply",
    href:       "/supply-chain",
    subtitle:   "Procurement, vendors, inventory, warehouses, and spend",
    badge:      "SCM",
    children: [
      { label: "Overview",          href: "/supply-chain" },
      { label: "Inventory",         href: "/supply-chain/inventory" },
      { label: "Warehouses",        href: "/warehouses" },
      { label: "Purchase Requests", href: "/supply-chain/purchase-requests" },
      { label: "Purchase Orders",   href: "/supply-chain/purchase-orders" },
      { label: "Suppliers",         href: "/supply-chain/suppliers" },
      { label: "RFQs",              href: "/supply-chain/rfqs" },
      { label: "Quotations",        href: "/supply-chain/quotations" },
      { label: "Goods Receipts",    href: "/supply-chain/goods-receipts" },
      { label: "Stock Balances",    href: "/supply-chain/stock-balances" },
      { label: "Supplier Invoices", href: "/supply-chain/supplier-invoices" },
      { label: "Spend Analysis",    href: "/supply-chain/spend" },
      { label: "Risk",              href: "/supply-chain/risk" },
      { label: "Workbench",         href: "/supply-chain/workbench" },
      { label: "Command",           href: "/supply-chain/command" },
    ],
  },

  // ── INTELLIGENCE GROUP ────────────────────────────────────────
  {
    key:        "ai",
    label:      "AI Assistant",
    shortLabel: "AI",
    href:       "/ai",
    subtitle:   "Natural language search, grounded Q&A, smart recommendations",
    badge:      "AI",
  },
  {
    key:        "administration",
    label:      "Administration",
    shortLabel: "Admin",
    href:       "/administration",
    subtitle:   "Users, settings, audit and system management",
    children: [
      { label: "Overview",            href: "/administration" },
      { label: "Hotels & Properties", href: "/administration/hotels" },
      { label: "Notification Rules",  href: "/admin/notification-rules" },
      { label: "Integration",         href: "/integration/backend" },
      { label: "Entities",            href: "/integration/entities" },
      { label: "Profile",             href: "/profile" },
      { label: "Settings",            href: "/settings" },
    ],
  },

  // ── UTILITY (shown at bottom, no group) ───────────────────────
  {
    key:        "agents",
    label:      "AI Agents",
    shortLabel: "Agents",
    href:       "/agents",
    subtitle:   "AI agent management and monitoring",
    badge:      "AI",
  },
  {
    key:        "reports",
    label:      "Reports",
    shortLabel: "Reports",
    href:       "/reports",
    subtitle:   "Business intelligence and reporting",
  },
];

// ── Nav Groups (sidebar sections) ─────────────────────────────────
export const navGroups: NavGroup[] = [
  { label: "Command",      keys: ["workspace", "approvals", "executive", "analytics"] },
  { label: "Business",     keys: ["commercial", "customers", "projects-center"] },
  { label: "Operations",   keys: ["operations", "maintenance", "engineering", "supply-chain"] },
  { label: "Intelligence", keys: ["ai", "agents", "reports", "administration"] },
];

// ── Command palette items ──────────────────────────────────────────
export const commandItems = [
  "Create lead",
  "Create quotation",
  "Create work order",
  "Create purchase request",
  "Add technician",
  "Search customer",
  "Search supplier",
  "View dashboard",
  "Ask AI",
  "View analytics",
  "Dispatch board",
  "Asset tree",
];

// ── Mobile primary nav (bottom bar) ───────────────────────────────
export const mobilePrimaryNav = [
  { label: "Home",    href: "/workspace" },
  { label: "Ops",     href: "/operations" },
  { label: "Supply",  href: "/supply-chain" },
  { label: "AI",      href: "/ai" },
  { label: "Admin",   href: "/administration" },
];

// ── Legacy links (kept for backward compat) ────────────────────────
export const legacyLinks = [
  { label: "Dashboard",  href: "/dashboard" },
  { label: "Leads",      href: "/leads" },
  { label: "Quotes",     href: "/quotes" },
  { label: "Contracts",  href: "/contracts" },
  { label: "Agents",     href: "/agents" },
  { label: "Reports",    href: "/reports" },
];
