// Triangle Black — Complete Enterprise Navigation v6.0
// Professional Lucide icon keys — replaces emoji

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
  subtitle?: string;
  badge?: string;
  icon?: string;
  children?: NavItem[];
}

export const enterpriseCenters: NavCenter[] = [

  // ── WORKSPACE ────────────────────────────────────────────────────────────
  {
    key: "workspace",
    label: "Workspace",
    shortLabel: "Home",
    href: "/workspace",
    badge: "Live",
    children: [
      { label: "Workspace Hub",     href: "/workspace",              icon: "Home" },
      { label: "My Day",            href: "/workspace/my-day",       icon: "Calendar" },
      { label: "All Modules",       href: "/workspace/all-modules",  icon: "LayoutDashboard" },
    ],
  },

  // ── EXECUTIVE INTELLIGENCE ───────────────────────────────────────────────
  {
    key: "executive",
    label: "Executive",
    shortLabel: "Executive",
    href: "/executive/dashboard",
    badge: "AI",
    children: [
      { label: "Executive Dashboard",   href: "/executive/dashboard",          icon: "BarChart3" },
      { label: "Executive Scorecard",   href: "/executive/scorecard",          icon: "Target" },
      { label: "Portfolio Overview",    href: "/executive/portfolio",          icon: "Briefcase" },
      { label: "Predictive Analytics",  href: "/executive/predictive",         icon: "TrendingUp" },
      { label: "Risk Dashboard",        href: "/executive/risks",              icon: "AlertTriangle" },
      { label: "Daily Review",          href: "/executive/daily-review",       icon: "Calendar" },
      { label: "Exception Report",      href: "/executive/exceptions",         icon: "Bell" },
      { label: "Intelligence Briefing", href: "/executive/intelligence",       icon: "Brain" },
        { href: "/operations/cost-intelligence", label: "Cost Intelligence", icon: "DollarSign" },
      { label: "Financial P&L",         href: "/financial",                    icon: "Coins" },
      { label: "Notifications",         href: "/notifications",                icon: "Bell" },
    ],
  },

  // ── OPERATIONS CENTER ────────────────────────────────────────────────────
  {
    key: "operations",
    label: "Operations",
    shortLabel: "Ops",
    href: "/operations/work-orders",
    badge: "OPS",
    children: [
      { label: "Work Orders",           href: "/operations/work-orders",          icon: "ClipboardList" },
      { label: "Create Work Order",     href: "/operations/work-orders/new",      icon: "Zap" },
      { label: "WO 360 View",           href: "/operations/work-orders/360",      icon: "RefreshCw" },
      { label: "Dispatch Board",        href: "/operations/dispatch",             icon: "Map" },
      { label: "Operations Command",    href: "/operations/command",              icon: "LayoutDashboard" },
      { label: "Service Requests",      href: "/operations/service-requests",     icon: "MessageSquare" },
      { label: "SLA Dashboard",         href: "/operations/sla",                  icon: "Gauge" },
      { label: "SLA Review",            href: "/operations/sla-review",           icon: "TrendingUp" },
      { label: "Technicians",           href: "/operations/technicians",          icon: "UserCheck" },
      { label: "Sites",                 href: "/operations/sites",                icon: "Map" },
      { label: "Time Tracking",         href: "/operations/time-tracking",        icon: "Clock" },
      { label: "Operations Calendar",   href: "/operations/calendar",             icon: "Calendar" },
      { label: "Bulk Operations",       href: "/operations/bulk",                 icon: "Zap" },
      { label: "Contracts",             href: "/operations/contracts",            icon: "FileText" },
      { label: "Workflows",             href: "/operations/workflows",            icon: "Workflow" },
    ],
  },

  // ── ENGINEERING ──────────────────────────────────────────────────────────
  {
    key: "engineering",
    label: "Engineering",
    shortLabel: "Eng",
    href: "/engineering",
    badge: "ENG",
    children: [
      { label: "Engineering Hub",         href: "/engineering",                      icon: "Wrench" },
      { label: "New Work Order",          href: "/engineering/new-work-order",       icon: "Zap" },
      { label: "PM Plans",                href: "/engineering/pm-plans",             icon: "Calendar" },
      { label: "Maintenance Schedule",    href: "/operations/maintenance",           icon: "Calendar" },
      { label: "Work History",            href: "/maintenance/work-history",         icon: "FileText" },
      { label: "Engineering Review",      href: "/engineering/review",               icon: "Search" },
      { label: "Maintenance Intelligence",href: "/engineering/maintenance-intelligence", icon: "Brain" },
      { label: "Engineering AI",          href: "/engineering/ai",                   icon: "Bot" },
      { label: "Actions",                 href: "/engineering/actions",              icon: "Zap" },
    ],
  },

  // ── ASSET MANAGEMENT ─────────────────────────────────────────────────────
  {
    key: "maintenance",
    label: "Assets",
    shortLabel: "Assets",
    href: "/maintenance/assets",
    children: [
      { label: "Asset Registry",          href: "/maintenance/assets",               icon: "Building2" },
      { label: "Asset 360",               href: "/maintenance/assets/360",           icon: "RefreshCw" },
      { label: "Asset Tree",              href: "/maintenance/asset-tree",           icon: "GitBranch" },
      { label: "QR Code Scanner",         href: "/operations/assets/qr",            icon: "ScanLine" },
      { label: "QR Code Gallery",         href: "/maintenance/qr-codes",            icon: "ScanLine" },
      { label: "PM Plans",                href: "/maintenance/pm-plans",             icon: "Calendar" },
      { label: "PM Plan 360",             href: "/maintenance/pm-plans/360",         icon: "RefreshCw" },
      { label: "Inspection Dashboard",    href: "/maintenance/inspection-dashboard", icon: "Search" },
      { label: "Downtime Review",         href: "/maintenance/downtime/review",      icon: "AlertTriangle" },
      { label: "Cost Review",             href: "/maintenance/costs/review",         icon: "Coins" },
      { label: "Maintenance Review",      href: "/maintenance/review",               icon: "BarChart3" },
      { label: "AI Asset Insights",       href: "/maintenance/intelligence",         icon: "Brain" },
      { label: "Predictive AI",           href: "/maintenance/predictive",           icon: "Brain" },
    ],
  },

  // ── INTELLIGENCE PLATFORM ────────────────────────────────────────────────
  {
    key: "intelligence",
    label: "Intelligence",
    shortLabel: "Intel",
    href: "/operations/command-center",
    badge: "AI",
    children: [
      { label: "Command Center",          href: "/operations/command-center",        icon: "LayoutDashboard" },
      { label: "Master Intelligence",     href: "/operations/intelligence-v2",       icon: "Layers" },
      { label: "Risk Intelligence",       href: "/operations/risk-intelligence",     icon: "Shield" },
      { label: "Energy & Sustainability", href: "/operations/energy-intelligence",   icon: "Leaf" },
      { label: "SLA Governance",          href: "/operations/sla-intelligence",      icon: "CheckCircle2" },
      { label: "Financial Leakage",       href: "/operations/financial-intelligence",icon: "TrendingDown" },
      { label: "Asset Lifecycle",         href: "/operations/asset-lifecycle",       icon: "HardDrive" },
      { label: "Supplier Analytics",      href: "/operations/supplier-intelligence", icon: "Truck" },
      { label: "IoT Telemetry",           href: "/operations/iot-telemetry",         icon: "Radio" },
      { label: "Executive Briefing",      href: "/executive/intelligence",           icon: "Brain" },
    ],
  },

  // ── PROJECTS CENTER ──────────────────────────────────────────────────────
  {
    key: "projects-center",
    label: "Projects",
    shortLabel: "Projects",
    href: "/projects-center",
    children: [
      { label: "Projects Hub",            href: "/projects-center",                  icon: "FolderKanban" },
      { label: "Project List",            href: "/projects-center/list",             icon: "ClipboardList" },
      { label: "Project Timeline",        href: "/projects-center/timeline",         icon: "Milestone" },
      { label: "Project Intelligence",    href: "/projects-center/intelligence",     icon: "Brain" },
      { label: "Schedule Review",         href: "/projects-center/review/schedule",  icon: "Calendar" },
      { label: "Project Review",          href: "/projects-center/review",           icon: "Search" },
    ],
  },

  // ── SUPPLY CHAIN ─────────────────────────────────────────────────────────
  {
    key: "supply-chain",
    label: "Procurement",
    shortLabel: "Procure",
    href: "/supply-chain/procurement",
    badge: "SCM",
    children: [
      { label: "Procurement Hub",         href: "/supply-chain/procurement",         icon: "ShoppingCart" },
      { label: "Procurement Dashboard",   href: "/supply-chain/procurement-dashboard",icon: "BarChart3" },
      { label: "Scope of Work",           href: "/supply-chain/scope-of-work",       icon: "ClipboardList" },
      { label: "RFQ Management",          href: "/supply-chain/rfq-management",      icon: "FileText" },
      { label: "Bid Comparison",          href: "/supply-chain/comparison",          icon: "BarChart2" },
      { label: "Vendor Management",       href: "/supply-chain/vendor-management",   icon: "Truck" },
      { label: "Vendor Analytics",        href: "/supply-chain/vendors/analytics",   icon: "TrendingUp" },
      { label: "Vendor 360",              href: "/supply-chain/vendors/360",         icon: "RefreshCw" },
      { label: "Purchase Orders",         href: "/supply-chain/purchase-orders-v2",  icon: "Package" },
      { label: "Goods Receipts",          href: "/supply-chain/goods-receipts",      icon: "CheckCircle2" },
      { label: "New GRN",                 href: "/supply-chain/goods-receipts/new",  icon: "Zap" },
      { label: "Invoice Matching",        href: "/supply-chain/invoice-matching",    icon: "Receipt" },
      { label: "Supplier Invoices",       href: "/supply-chain/invoices",            icon: "FileText" },
      { label: "Inventory",               href: "/supply-chain/inventory",           icon: "Warehouse" },
      { label: "Warehouses",              href: "/supply-chain/warehouses",          icon: "Warehouse" },
      { label: "Spend Analysis",          href: "/supply-chain/spend",               icon: "Coins" },
      { label: "Approvals Center",        href: "/supply-chain/approvals-center",    icon: "CheckSquare" },
      { label: "Supply Intelligence",     href: "/supply-chain/intelligence",        icon: "Brain" },
    ],
  },

  // ── ANALYTICS & REPORTS ──────────────────────────────────────────────────
  {
    key: "analytics",
    label: "Analytics",
    shortLabel: "Analytics",
    href: "/analytics",
    badge: "AI",
    children: [
      { label: "Analytics Hub",           href: "/analytics",                        icon: "PieChart" },
      { label: "Cost Analytics",          href: "/analytics/costs",                  icon: "Coins" },
      { label: "SLA Analytics",           href: "/analytics/sla",                    icon: "Gauge" },
      { label: "Trend Analysis",          href: "/analytics/trends",                 icon: "TrendingUp" },
      { label: "Scorecards",              href: "/analytics/scorecards",             icon: "Target" },
      { label: "Report Center",           href: "/reports",                          icon: "ClipboardList" },
      { label: "Executive Reports",       href: "/executive/reports",                icon: "FileText" },
      { label: "Analytics Reports",       href: "/analytics/reports",                icon: "BarChart3" },
    ],
  },

  // ── FINANCIAL ────────────────────────────────────────────────────────────
  {
    key: "financial",
    label: "Financial",
    shortLabel: "Finance",
    href: "/financial",
    children: [
      { label: "P&L Dashboard",           href: "/financial",                        icon: "Coins" },
      { label: "Invoice Management",      href: "/supply-chain/invoices",            icon: "Receipt" },
      { label: "Commercial Invoices",     href: "/commercial/invoices",              icon: "FileText" },
      { label: "Payment History",         href: "/commercial/payment-history",       icon: "CreditCard" },
      { label: "Payment Tracking",        href: "/payment-tracking",                 icon: "CreditCard" },
      { label: "Stock Levels",            href: "/supply-chain/stock-levels",        icon: "Package" },
    ],
  },

  // ── COMMERCIAL CRM ───────────────────────────────────────────────────────
  {
    key: "commercial",
    label: "Commercial",
    shortLabel: "CRM",
    href: "/commercial",
    badge: "CRM",
    children: [
      { label: "CRM Hub",                 href: "/commercial",                       icon: "Target" },
      { label: "Leads Pipeline",          href: "/commercial/leads",                 icon: "TrendingUp" },
      { label: "Pipeline View",           href: "/commercial/pipeline",              icon: "BarChart2" },
      { label: "Customers",               href: "/customers",                        icon: "Building2" },
      { label: "Customer 360",            href: "/customers/360",                    icon: "RefreshCw" },
      { label: "Customer Success",        href: "/customers/success",                icon: "Star" },
      { label: "Contracts",               href: "/commercial/contracts",             icon: "FileText" },
      { label: "Quotations",              href: "/supply-chain/quotations",          icon: "MessageSquare" },
      { label: "Review Intelligence",     href: "/commercial/review-intelligence",   icon: "Brain" },
      { label: "Commercial Workbench",    href: "/commercial/workbench",             icon: "LayoutDashboard" },
    ],
  },

  // ── PORTALS ──────────────────────────────────────────────────────────────
  {
    key: "portals",
    label: "Portals",
    shortLabel: "Portals",
    href: "/client-portal",
    children: [
      { label: "Client Portal",           href: "/client-portal",                    icon: "Building2" },
      { label: "Client Dashboard",        href: "/client-portal/dashboard",          icon: "BarChart3" },
      { label: "Client Work Orders",      href: "/client-portal/work-orders",        icon: "ClipboardList" },
      { label: "Client Approvals",        href: "/client-portal/approvals",          icon: "CheckSquare" },
      { label: "Supplier Portal",         href: "/supplier-portal",                  icon: "Truck" },
      { label: "Supplier Dashboard",      href: "/supplier-portal/dashboard",        icon: "BarChart3" },
      { label: "Supplier RFQs",           href: "/supplier-portal/rfqs",             icon: "FileText" },
      { label: "Supplier POs",            href: "/supplier-portal/purchase-orders",  icon: "Package" },
    ],
  },

  // ── ADMINISTRATION ───────────────────────────────────────────────────────
  {
    key: "administration",
    label: "Admin",
    shortLabel: "Admin",
    href: "/administration",
    children: [
      { label: "Administration Hub",      href: "/administration",                   icon: "Settings" },
      { label: "Hotels & Sites",          href: "/administration/hotels",            icon: "Building2" },
      { label: "Onboarding Wizard",       href: "/administration/onboarding",        icon: "Zap" },
      { label: "Data Import",             href: "/administration/data-import",       icon: "HardDrive" },
      { label: "Pilot Control Room",      href: "/administration/pilot-control-v2",  icon: "Layers" },
      { label: "Platform Monitoring",     href: "/administration/platform-monitoring",icon: "MonitorCheck" },
      { label: "Value Certification",     href: "/administration/value-certification-v2", icon: "Award" },
      { label: "Demo Environment",        href: "/administration/demo-environment",  icon: "Play" },
      { label: "Subscription & Billing",  href: "/administration/subscription",      icon: "CreditCard" },
      { label: "Webhook Management",      href: "/administration/webhooks",          icon: "Webhook" },
      { label: "Identity & SSO",          href: "/administration/identity",          icon: "KeyRound" },
      { label: "Customer Feedback",       href: "/administration/feedback",          icon: "MessageSquare" },
      { label: "Audit Log",               href: "/administration/audit",             icon: "FileText" },
      { label: "Platform Maturity",       href: "/administration/platform/maturity", icon: "Gauge" },
      { label: "Data Exports",            href: "/administration/platform/exports",  icon: "FileText" },
    ],
  },

  // ── SETTINGS ─────────────────────────────────────────────────────────────
  {
    key: "settings",
    label: "Settings",
    shortLabel: "Settings",
    href: "/settings/users",
    children: [
      { label: "User Management",         href: "/settings/users",                   icon: "Users" },
      { label: "Security Audit",          href: "/administration/audit",             icon: "Lock" },
      { label: "AI Hub",                  href: "/ai",                               icon: "Brain" },
      { label: "Graph Explorer",          href: "/graph",                            icon: "Network" },
      { label: "Alerts",                  href: "/alerts",                           icon: "Bell" },
      { label: "Inbox",                   href: "/inbox",                            icon: "MessageSquare" },
      { label: "Approvals",               href: "/approvals",                        icon: "CheckSquare" },
    ],
  },
];

// ── Navigation groups ────────────────────────────────────────────────────────
export const navGroups = [
  {
    label: "Platform",
    items: ["workspace", "executive"],
  },
  {
    label: "Operations",
    items: ["operations", "engineering", "maintenance", "projects-center"],
  },
  {
    label: "Intelligence",
    items: ["intelligence"],
  },
  {
    label: "Supply Chain",
    items: ["supply-chain", "financial"],
  },
  {
    label: "Commercial",
    items: ["analytics", "commercial", "portals"],
  },
  {
    label: "Platform Admin",
    items: ["administration", "settings"],
  },
];

export type { NavItem as NavSubItem };

export const mobilePrimaryNav = [
  { label: "Home",     href: "/workspace",                  icon: "Home" },
  { label: "Ops",      href: "/operations/work-orders",     icon: "ClipboardList" },
  { label: "Intel",    href: "/operations/command-center",  icon: "Brain" },
  { label: "Procure",  href: "/supply-chain/procurement",   icon: "ShoppingCart" },
  { label: "Reports",  href: "/analytics",                  icon: "PieChart" },
];

export type NavChild = NavItem;
export type NavGroup = { label: string; keys: string[]; };
