// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, LayoutDashboard, Users, Wrench,
  Package, Warehouse, ClipboardList, BarChart3,
  Settings, LogOut, Building2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",   icon: LayoutDashboard },
  { href: "/leads",        label: "Leads",       icon: Users },
  { href: "/work-orders",  label: "Work Orders", icon: Wrench },
  { href: "/technicians",  label: "Technicians", icon: Users },
  { href: "/assets",       label: "Assets",      icon: Package },
  { href: "/warehouses",   label: "Warehouses",  icon: Warehouse },
  { href: "/inventory",    label: "Inventory",   icon: ClipboardList },
  { href: "/reports",      label: "Reports",     icon: BarChart3 },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14
        flex items-center justify-between px-4
        bg-slate-950 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-amber-500" />
          <span className="font-bold text-white text-sm">Triangle Black</span>
        </Link>
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <nav
            className="absolute left-0 top-14 bottom-0 w-72 bg-slate-950
              border-r border-slate-800 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                      font-medium transition-colors ${
                      active
                        ? "bg-amber-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
