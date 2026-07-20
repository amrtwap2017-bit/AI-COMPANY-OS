// @ts-nocheck
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard:       "Dashboard",
  leads:           "Leads",
  "work-orders":   "Work Orders",
  technicians:     "Technicians",
  assets:          "Assets",
  warehouses:      "Warehouses",
  inventory:       "Inventory",
  reports:         "Reports",
  operations:      "Operations",
  maintenance:     "Maintenance",
  engineering:     "Engineering",
  executive:       "Executive",
  "supply-chain":  "Supply Chain",
  analytics:       "Analytics",
  enterprise:      "Enterprise",
  "app":           "",
  new:             "New",
  edit:            "Edit",
  "360":           "360° View",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean)
    .filter(s => !s.startsWith("("))  // remove route groups
    .filter(s => s !== "app");

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] || seg.replace(/-/g, " "),
    href:  "/" + segments.slice(0, i + 1).join("/"),
    last:  i === segments.length - 1,
  })).filter(c => c.label);

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 mb-4"
      aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
        <Home className="w-3 h-3" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          {crumb.last ? (
            <span className="text-slate-300 capitalize font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href}
              className="capitalize hover:text-slate-300 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
