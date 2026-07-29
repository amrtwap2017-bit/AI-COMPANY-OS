// @ts-nocheck
// Triangle Black - Unified Enterprise Sidebar
// Merges: Enterprise visual quality + Legacy accordion sub-navigation
// Features: collapse/expand groups, sub-items, tooltips, persistence,
//           real auth, badges, active indicators, smooth transitions
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { enterpriseCenters, navGroups } from "./nav";
import type { NavCenter } from "./nav";
import {
  LayoutDashboard, TrendingUp, Users, Wrench, Package,
  BarChart3, Zap, Activity, DollarSign, FolderKanban,
  Shield, CheckSquare, LogOut, Building2, Bot,
  FileText, ChevronDown, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Home,
} from "lucide-react";

// ── Icon map ──────────────────────────────────────────────────────
const ICONS: Record<string, any> = {
  workspace:        Home,
  executive:        TrendingUp,
  customers:        Users,
  commercial:       DollarSign,
  operations:       Activity,
  "supply-chain":   Package,
  "financial":       DollarSign,
  "assets":          Activity,
  "portals":         Users,
  "reports":         FileText,
  engineering:      Wrench,
  maintenance:      Wrench,
  ai:               Zap,
  analytics:        BarChart3,
  "projects-center":FolderKanban,
  administration:   Shield,
  approvals:        CheckSquare,
  agents:           Bot,
  reports:          FileText,
  hotels:           Building2,
};

// ── Color map ─────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  workspace:        "text-slate-300",
  executive:        "text-emerald-400",
  customers:        "text-blue-400",
  commercial:       "text-amber-400",
  operations:       "text-orange-400",
  "supply-chain":   "text-yellow-400",
  "financial":       "text-emerald-400",
  "assets":          "text-cyan-400",
  "portals":         "text-indigo-400",
  "reports":         "text-blue-400",
  engineering:      "text-purple-400",
  maintenance:      "text-red-400",
  ai:               "text-amber-300",
  analytics:        "text-cyan-400",
  "projects-center":"text-indigo-400",
  administration:   "text-tertiary",
  approvals:        "text-emerald-400",
  agents:           "text-amber-300",
  reports:          "text-tertiary",
};

// ── Badge styles ──────────────────────────────────────────────────
function badgeClass(badge: string): string {
  if (badge === "AI")    return "bg-amber-700/40 text-amber-300";
  if (badge === "New")   return "bg-blue-700/40 text-blue-300";
  if (badge === "Live")  return "bg-emerald-700/40 text-emerald-300";
  if (badge === "Inbox") return "bg-purple-700/40 text-purple-300";
  if (badge === "OPS")   return "bg-orange-700/40 text-orange-300";
  if (badge === "CRM")   return "bg-amber-700/40 text-amber-300";
  if (badge === "SCM")   return "bg-yellow-700/40 text-yellow-300";
  if (badge === "MNT")   return "bg-red-700/40 text-red-300";
  if (badge === "ENG")   return "bg-purple-700/40 text-purple-300";
  return "bg-slate-700 text-slate-300";
}

// ── Single nav item (no children) ────────────────────────────────
function NavItem({
  center, collapsed, isActive, tooltip, setTooltip,
}: {
  center:     NavCenter;
  collapsed:  boolean;
  isActive:   boolean;
  tooltip:    string | null;
  setTooltip: (k: string | null) => void;
}) {
  const Icon  = ICONS[center.key]  || LayoutDashboard;
  const color = COLORS[center.key] || "text-tertiary";

  return (
    <div
      className="relative"
      onMouseEnter={() => collapsed && setTooltip(center.key)}
      onMouseLeave={() => setTooltip(null)}
    >
      <Link
        href={center.href}
        className={[
          "flex items-center gap-3 text-sm font-medium transition-all group relative",
          collapsed ? "px-0 py-2.5 justify-center rounded-xl" : "px-3 py-2 rounded-xl",
          isActive
            ? "bg-slate-800/80 text-white"
            : "text-tertiary hover:text-white hover:bg-slate-800/60",
        ].join(" ")}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-700 rounded-r-full" />
        )}
        <Icon className={[
          "w-4 h-4 flex-shrink-0",
          isActive ? "text-amber-400" : color + " group-hover:text-white",
        ].join(" ")} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{center.shortLabel || center.label}</span>
            {center.badge && (
              <span className={"text-[10px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 " + badgeClass(center.badge)}>
                {center.badge}
              </span>
            )}
            {isActive && <ChevronRight className="w-3 h-3 text-amber-500 flex-shrink-0" />}
          </>
        )}
        {collapsed && center.badge && isActive && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-700 rounded-full" />
        )}
      </Link>

      {/* Tooltip when collapsed */}
      {collapsed && tooltip === center.key && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none">
          {center.label}
          {center.badge && <span className="ml-1.5 text-amber-400">{center.badge}</span>}
        </div>
      )}
    </div>
  );
}

// ── Accordion nav item (has children) ────────────────────────────
function NavAccordion({
  center, collapsed, isActive, isChildActive, tooltip, setTooltip,
}: {
  center:        NavCenter;
  collapsed:     boolean;
  isActive:      boolean;
  isChildActive: boolean;
  tooltip:       string | null;
  setTooltip:    (k: string | null) => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(isActive || isChildActive);
  const Icon   = ICONS[center.key]  || LayoutDashboard;
  const color  = COLORS[center.key] || "text-tertiary";
  const anyActive = isActive || isChildActive;

  // Auto-open when navigating to a child
  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (collapsed) {
    // Collapsed: show icon only, click goes to center href
    return (
      <div
        className="relative"
        onMouseEnter={() => setTooltip(center.key)}
        onMouseLeave={() => setTooltip(null)}
      >
        <Link
          href={center.href}
          className={[
            "flex items-center justify-center px-0 py-2.5 rounded-xl text-sm font-medium transition-all",
            anyActive ? "bg-slate-800/80 text-white" : "text-tertiary hover:text-white hover:bg-slate-800/60",
          ].join(" ")}
        >
          <Icon className={["w-4 h-4", anyActive ? "text-amber-400" : color].join(" ")} />
          {center.badge && anyActive && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-700 rounded-full" />
          )}
        </Link>
        {tooltip === center.key && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none">
            {center.label}
            {center.badge && <span className="ml-1.5 text-amber-400">{center.badge}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Accordion header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative",
          anyActive ? "text-white" : "text-tertiary hover:text-white hover:bg-slate-800/60",
        ].join(" ")}
      >
        {anyActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-700 rounded-r-full" />
        )}
        <Icon className={["w-4 h-4 flex-shrink-0", anyActive ? "text-amber-400" : color + " group-hover:text-white"].join(" ")} />
        <span className="flex-1 text-left truncate">{center.shortLabel || center.label}</span>
        {center.badge && (
          <span className={"text-[10px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 " + badgeClass(center.badge)}>
            {center.badge}
          </span>
        )}
        {open
          ? <ChevronDown className="w-3 h-3 text-tertiary flex-shrink-0 ml-0.5" />
          : <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0 ml-0.5" />
        }
      </button>

      {/* Sub-items */}
      {open && center.children && (
        <div className="ml-4 mt-0.5 mb-1 pl-3 border-l border-slate-800/60 space-y-0.5">
          {center.children.map(child => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className={[
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all",
                  childActive
                    ? "text-amber-400 bg-amber-700/10 font-semibold"
                    : "text-tertiary hover:text-white hover:bg-slate-800/40",
                ].join(" ")}
              >
                <span className={"w-1 h-1 rounded-full flex-shrink-0 " + (childActive ? "bg-amber-400" : "bg-slate-600")} />
                <span className="flex-1 truncate">{child.label}</span>
                {child.badge && (
                  <span className={"text-[9px] px-1 py-0.5 rounded font-bold " + badgeClass(child.badge)}>
                    {child.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────
export function EnterpriseSidebar() {
  const pathname                = usePathname();
  const { user, logout }        = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip,   setTooltip]   = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tb_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("tb_sidebar_collapsed", String(next));
  }

  const isActive      = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isChildActive = (center: NavCenter) =>
    center.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "TB";

  const centerMap = Object.fromEntries(enterpriseCenters.map(c => [c.key, c]));

  return (
    <aside className={[
      "shrink-0 flex flex-col bg-slate-950 border-r border-slate-800/60 transition-all",
      collapsed ? "w-16" : "w-60",
    ].join(" ")}>

      {/* Header / Logo */}
      <div className="h-14 flex items-center border-b border-slate-800/60 flex-shrink-0 px-3 gap-2.5">
        <Link href="/workspace" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">TB</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-bold text-sm leading-none truncate">Triangle Black</div>
              <div className="text-tertiary text-[10px] mt-0.5">Enterprise OS</div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg text-tertiary hover:text-white hover:bg-slate-800/60 transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-slate-800/60">
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-tertiary hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
        {navGroups.map((group, gi) => {
          const centers = group.keys.map(k => centerMap[k]).filter(Boolean);
          if (centers.length === 0) return null;

          return (
            <div key={group.label} className={gi > 0 ? "pt-3" : "pt-1"}>
              {/* Group label */}
              {!collapsed && (
                <div className="pb-1 px-3">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    {group.label}
                  </span>
                </div>
              )}
              {collapsed && gi > 0 && (
                <div className="border-t border-slate-800/60/60 mx-2 mb-2" />
              )}

              {/* Center items */}
              <div className="space-y-0.5">
                {centers.map(center => {
                  const active      = isActive(center.href);
                  const childActive = isChildActive(center);

                  if (center.children && center.children.length > 0) {
                    return (
                      <NavAccordion
                        key={center.key}
                        center={center}
                        collapsed={collapsed}
                        isActive={active}
                        isChildActive={childActive}
                        tooltip={tooltip}
                        setTooltip={setTooltip}
                      />
                    );
                  }

                  return (
                    <NavItem
                      key={center.key}
                      center={center}
                      collapsed={collapsed}
                      isActive={active}
                      tooltip={tooltip}
                      setTooltip={setTooltip}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800/60 flex-shrink-0 p-2">
        {!collapsed ? (
          <div className="px-2 py-2">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-black">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user?.name || "User"}</div>
                <div className="text-tertiary text-[10px] capitalize truncate">{user?.role || "admin"}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        ) : (
          <div
            className="relative flex justify-center"
            onMouseEnter={() => setTooltip("user")}
            onMouseLeave={() => setTooltip(null)}
          >
            <button
              onClick={logout}
              className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Sign out"
            >
              <span className="text-white text-xs font-black">{initials}</span>
            </button>
            {tooltip === "user" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none">
                {user?.name || "User"} · Sign out
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
