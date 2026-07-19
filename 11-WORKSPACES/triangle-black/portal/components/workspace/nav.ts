export type CenterNavItem = {
  key: string;
  label: string;
  href: string;
  subtitle: string;
  badge?: string;
  shortLabel: string;
};

export const enterpriseCenters: CenterNavItem[] = [
  {
    key: "approvals",
    label: "Approval Center",
    href: "/approvals",
    subtitle: "Unified inbox for all items requiring review or approval",
    badge: "Inbox",
    shortLabel: "Inbox",
  },
  {
    key: "executive",
    label: "Executive Center",
    href: "/executive",
    subtitle: "Revenue, risk, portfolio, and decisions",
    badge: "Live",
    shortLabel: "Exec",
  },
  {
    key: "customers",
    label: "Customer Success",
    href: "/customers",
    subtitle: "Health scores, renewals, satisfaction and 360 client view",
    badge: "New",
    shortLabel: "CS",
  },
  {
    key: "commercial",
    label: "Commercial Center",
    href: "/commercial",
    subtitle: "CRM, quotations, contracts, and relationships",
    shortLabel: "Sales",
  },
  {
    key: "operations",
    label: "Operations Center",
    href: "/operations",
    subtitle: "Dispatch, work orders, SLA, and execution",
    shortLabel: "Ops",
  },
  {
    key: "supply-chain",
    label: "Supply Chain Center",
    href: "/supply-chain",
    subtitle: "Procurement, vendors, requests, and spend",
    shortLabel: "Supply",
  },
  {
    key: "engineering",
    label: "Engineering Center",
    href: "/engineering",
    subtitle: "Projects, documents, inspections, and site management",
    shortLabel: "Eng",
  },
  {
    key: "maintenance",
    label: "Maintenance Center",
    href: "/maintenance",
    subtitle: "Asset tree, PM plans, work items, and corrective actions",
    shortLabel: "MX",
  },
  {
    key: "ai",
    label: "AI Assistant",
    href: "/ai",
    subtitle: "Natural language search, grounded Q&A, smart recommendations",
    badge: "AI",
    shortLabel: "AI",
  },
  {
    key: "analytics",
    label: "Analytics Platform",
    href: "/analytics",
    subtitle: "KPIs, scorecards, trends and executive intelligence across all domains",
    badge: "New",
    shortLabel: "KPIs",
  },
  {
    key: "hotels",
  subtitle: "Hotel properties and site management",
    label: "Hotels & Properties",
    shortLabel: "Hotels",
    href: "/administration/hotels",
    
    badge: "Core",
  },
  {
    key: "administration",
    label: "Administration",
    href: "/administration",
    subtitle: "Users, settings, audit and system management",
    shortLabel: "Admin",
  },
  {
    key: "projects-center",
    label: "Projects Center",
    href: "/projects-center",
    subtitle: "Project 360, phases, budget, risks, and site reports",
    shortLabel: "Proj",
  },
];

export const legacyLinks = [
  { label: "Legacy Dashboard", href: "/dashboard" },
  { label: "Leads", href: "/leads" },
  { label: "Quotes", href: "/quotes" },
  { label: "Contracts", href: "/contracts" },
  { label: "Agents", href: "/agents" },
  { label: "Reports", href: "/reports" },
];

export const commandItems = [
  "Create lead",
  "Create quotation",
  "Create work order",
  "Create purchase request",
  "Search customer",
  "Search supplier",
  "Ask AI",
];

export const mobilePrimaryNav = enterpriseCenters.map((item) => ({
  label: item.shortLabel,
  href: item.href,
}));
