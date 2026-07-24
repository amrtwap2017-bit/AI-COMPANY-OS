// @ts-nocheck
// Triangle Black - Enterprise Breadcrumb
"use client"; // @ts-nocheck
// Fix: Home links to /workspace not /dashboard
// Fix: Extended label map for all enterprise routes
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  // Legacy routes
  dashboard:          "Dashboard",
  leads:              "Leads",
  "work-orders":      "Work Orders",
  technicians:        "Technicians",
  assets:             "Assets",
  warehouses:         "Warehouses",
  inventory:          "Inventory",
  reports:            "Reports",
  contracts:          "Contracts",
  invoices:           "Invoices",
  quotes:             "Quotes",
  agents:             "AI Agents",
  notifications:      "Notifications",
  profile:            "Profile",
  settings:           "Settings",
  // Enterprise centers
  workspace:          "Dashboard",
  operations:         "Operations",
  maintenance:        "Maintenance",
  engineering:        "Engineering",
  executive:          "Executive",
  "supply-chain":     "Supply Chain",
  analytics:          "Analytics",
  commercial:         "Commercial",
  customers:          "Customer Success",
  "projects-center":  "Projects",
  administration:     "Administration",
  approvals:          "Approvals",
  ai:                 "AI Assistant",
  inbox:              "Inbox",
  alerts:             "Alerts",
  graph:              "Knowledge Graph",
  recommendations:    "Recommendations",
  // Sub-routes
  new:                "New",
  edit:               "Edit",
  "360":              "360 View",
  command:            "Command",
  workbench:          "Workbench",
  intelligence:       "Intelligence",
  review:             "Review",
  dispatch:           "Dispatch",
  calendar:           "Calendar",
  "sla-review":       "SLA Review",
  "service-requests": "Service Requests",
  "work-orders":      "Work Orders",
  workflows:          "Workflows",
  approvals:          "Approvals",
  designer:           "Designer",
  instances:          "Instances",
  "asset-tree":       "Asset Tree",
  "pm-plans":         "PM Plans",
  schedule:           "Schedule",
  actions:            "Actions",
  "costs":            "Costs",
  downtime:           "Downtime",
  schedules:          "Schedules",
  pipeline:           "Pipeline",
  renewal:            "Renewal",
  "review-intelligence": "Review Intelligence",
  "purchase-orders":  "Purchase Orders",
  "purchase-requests":"Purchase Requests",
  suppliers:          "Suppliers",
  vendors:            "Vendors",
  rfqs:               "RFQs",
  quotations:         "Quotations",
  "goods-receipts":   "Goods Receipts",
  "stock-balances":   "Stock Balances",
  "supplier-invoices":"Supplier Invoices",
  spend:              "Spend Analysis",
  risk:               "Risk",
  agreements:         "Agreements",
  transfers:          "Transfers",
  comparison:         "Comparison",
  "invoice-matching": "Invoice Matching",
  queue:              "Queue",
  procurement:        "Procurement",
  portfolio:          "Portfolio",
  risks:              "Risks",
  exceptions:         "Exceptions",
  "daily-review":     "Daily Review",
  scorecards:         "Scorecards",
  sla:                "SLA",
  "my-day":           "My Day",
  launcher:           "Launcher",
  backend:            "Backend",
  entities:           "Entities",
  integration:        "Integration",
  admin:              "Admin",
  "notification-rules":"Notification Rules",
  hotels:             "Hotels & Properties",
  section:            "Section",
  presets:            "Presets",
};

export function Breadcrumb({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter(s => !s.startsWith("("));   // remove route groups like (app)

  // Don't show breadcrumb on root/home pages
  if (segments.length <= 1) return null;

  // Build crumb list
  const crumbs = segments
    .map((seg, i) => ({
      label: LABELS[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      href:  "/" + segments.slice(0, i + 1).join("/"),
      last:  i === segments.length - 1,
    }))
    .filter(c => c.label && c.label !== "App");

  return (
    <nav
      className={"flex items-center gap-1 text-xs text-slate-400 " + className}
      aria-label="Breadcrumb"
    >
      <Link
        href="/workspace"
        className="hover:text-amber-500 transition-colors flex items-center"
        aria-label="Home"
      >
        <Home className="w-3 h-3" />
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-slate-600" />
          {crumb.last ? (
            <span className="text-slate-300 font-medium truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-amber-500 transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
