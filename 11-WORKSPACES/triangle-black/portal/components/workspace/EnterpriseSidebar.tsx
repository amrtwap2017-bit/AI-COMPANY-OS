// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { enterpriseCenters } from "./nav";
import {
  LayoutDashboard, TrendingUp, Users, Wrench, Package,
  BarChart3, Zap, Activity, DollarSign, FolderKanban,
  ChevronRight, Shield, CheckSquare, LogOut,
  PanelLeftClose, PanelLeftOpen,Building2,
} from "lucide-react";

const centerIcons: Record<string, any> = {
  executive:        TrendingUp,
  customers:        Users,
  commercial:       DollarSign,
  operations:       Activity,
  "supply-chain":   Package,
  engineering:      Wrench,
  maintenance:      Activity,
  ai:               Zap,
  analytics:        BarChart3,
  "hotels":   	    Building2,
  "projects-center":FolderKanban,
  administration:   Shield,
  approvals:        CheckSquare,
};

const centerColors: Record<string, string> = {
  executive:        "text-emerald-400",
  customers:        "text-blue-400",
  commercial:       "text-amber-400",
  operations:       "text-orange-400",
  "supply-chain":   "text-yellow-400",
  engineering:      "text-purple-400",
  maintenance:      "text-red-400",
  ai:               "text-amber-300",
  analytics:        "text-cyan-400",
  "projects-center":"text-indigo-400",
  administration:   "text-slate-400",
  approvals:        "text-emerald-400",
};

const navGroups = [
  { label: "Command", keys: ["approvals", "executive", "analytics"] },
  { label: "Business", keys: ["commercial", "customers", "projects-center"] },
  { label: "Operations", keys: ["operations", "engineering", "maintenance", "supply-chain"] },
  { label: "Intelligence", keys: ["ai", "administration"] },
];

export function EnterpriseSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tb_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("tb_sidebar_collapsed", String(next));
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "TB";
  const centerMap = Object.fromEntries(enterpriseCenters.map(c => [c.key, c]));

  return (
    <aside className={`shrink-0 hidden lg:flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-200 ${collapsed ? "w-16" : "w-56"}`}>
      <div className="h-14 flex items-center border-b border-slate-800 flex-shrink-0 px-3 gap-2.5">
        <Link href="/workspace" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-700 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-bold text-sm leading-none truncate">Triangle Black</div>
              <div className="text-slate-500 text-xs mt-0.5">Enterprise OS</div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button onClick={toggleCollapse} className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors flex-shrink-0" title="Collapse sidebar">
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-800">
          <button onClick={toggleCollapse} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors" title="Expand sidebar">
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
        <div className="relative" onMouseEnter={() => collapsed && setTooltip("dashboard")} onMouseLeave={() => setTooltip(null)}>
          <Link href="/workspace" className={`flex items-center gap-3 rounded-r-xl text-sm font-medium transition-all group relative ${collapsed ? "px-0 py-2.5 justify-center rounded-xl" : "px-3 py-2"} ${isActive("/workspace") ? "bg-slate-800/80 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
            {isActive("/workspace") && !collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />}
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
          {collapsed && tooltip === "dashboard" && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">Dashboard</div>
          )}
        </div>

        {navGroups.map(group => {
          const centers = group.keys.map(k => centerMap[k]).filter(Boolean);
          if (centers.length === 0) return null;
          return (
            <div key={group.label} className="pt-2">
              {!collapsed && <div className="pb-1 px-3"><span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">{group.label}</span></div>}
              {collapsed && <div className="border-t border-slate-800/60 mx-2 mb-1" />}
              {centers.map(center => {
                const Icon = centerIcons[center.key] || LayoutDashboard;
                const color = centerColors[center.key] || "text-slate-400";
                const active = isActive(center.href);
                const tipKey = center.key;
                return (
                  <div key={center.key} className="relative" onMouseEnter={() => collapsed && setTooltip(tipKey)} onMouseLeave={() => setTooltip(null)}>
                    <Link href={center.href} className={`flex items-center gap-3 rounded-r-xl text-sm font-medium transition-all group relative ${collapsed ? "px-0 py-2.5 justify-center rounded-xl" : "px-3 py-2"} ${active ? "bg-slate-800/80 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}>
                      {active && !collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-amber-400" : `${color} group-hover:text-white`}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate text-sm">{center.shortLabel || center.label}</span>
                          {center.badge && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0 ${center.badge === "AI" ? "bg-amber-700/40 text-amber-300" : center.badge === "New" ? "bg-blue-700/40 text-blue-300" : center.badge === "Live" ? "bg-emerald-700/40 text-emerald-300" : center.badge === "Inbox" ? "bg-purple-700/40 text-purple-300" : "bg-slate-700 text-slate-300"}`}>{center.badge}</span>
                          )}
                          {active && <ChevronRight className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                        </>
                      )}
                      {collapsed && center.badge && active && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                    </Link>
                    {collapsed && tooltip === tipKey && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                        {center.label}{center.badge && <span className="ml-1.5 text-amber-400">{center.badge}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 flex-shrink-0 p-2">
        {!collapsed ? (
          <div className="px-2 py-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user?.name || "User"}</div>
                <div className="text-slate-500 text-xs capitalize truncate">{user?.role || "—"}</div>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        ) : (
          <div className="relative flex justify-center" onMouseEnter={() => setTooltip("user")} onMouseLeave={() => setTooltip(null)}>
            <button onClick={logout} className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center hover:bg-red-600 transition-colors" title="Sign out">
              <span className="text-white text-xs font-bold">{initials}</span>
            </button>
            {tooltip === "user" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">{user?.name || "User"} · Sign out</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
