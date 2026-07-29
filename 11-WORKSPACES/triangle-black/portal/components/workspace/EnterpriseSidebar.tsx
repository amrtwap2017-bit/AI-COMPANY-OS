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
  workspace:          Home,
  executive:          TrendingUp,
  customers:          Users,
  commercial:         DollarSign,
  operations:         Activity,
  "supply-chain":     Package,
  "financial":        DollarSign,
  "assets":           Activity,
  "portals":          Users,
  "reports":          FileText,
  engineering:        Wrench,
  maintenance:        Wrench,
  ai:                 Zap,
  analytics:          BarChart3,
  "projects-center":  FolderKanban,
  administration:     Shield,
  approvals:          CheckSquare,
  agents:             Bot,
  reports:            FileText,
  hotels:             Building2,
  settings:           Shield,
};

// ── Color map ─────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  workspace:          "text-[#A89478]",
  executive:          "text-[#A89478]",
  customers:          "text-[#8C7A69]",
  commercial:         "text-[#A89478]",
  operations:         "text-[#A89478]",
  "supply-chain":     "text-[#A89478]",
  "financial":        "text-[#A89478]",
  "assets":           "text-[#8C7A69]",
  "portals":          "text-[#8C7A69]",
  "reports":          "text-[#8C7A69]",
  engineering:        "text-[#A89478]",
  maintenance:        "text-[#8C7A69]",
  ai:                 "text-[#A89478]",
  analytics:          "text-[#A89478]",
  "projects-center":  "text-[#8C7A69]",
  administration:     "text-[#8C7A69]",
  approvals:          "text-[#A89478]",
  agents:             "text-[#A89478]",
  settings:           "text-[#8C7A69]",
};

// ── Badge styles ──────────────────────────────────────────────────
function badgeClass(badge: string): string {
  if (badge === "AI")    return "bg-stone-700/40 text-stone-300";
  if (badge === "New")   return "bg-stone-700/40 text-stone-200";
  if (badge === "Live")  return "bg-stone-700/30 text-stone-200";
  if (badge === "Inbox") return "bg-stone-700/40 text-stone-300";
  if (badge === "OPS")   return "bg-stone-800/60 text-stone-300";
  if (badge === "CRM")   return "bg-stone-800/60 text-stone-300";
  if (badge === "SCM")   return "bg-stone-800/60 text-stone-300";
  if (badge === "MNT")   return "bg-stone-800/60 text-stone-300";
  if (badge === "ENG")   return "bg-stone-800/60 text-stone-300";
  return "bg-stone-800/50 text-stone-400";
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
            ? "text-white"
            : "hover:text-white hover:bg-white/5",
        ].join(" ")}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{background:"#B9924C"}} />
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
            {isActive && <ChevronRight className="w-3 h-3 text-amber-300 flex-shrink-0" />}
          </>
        )}
        {collapsed && center.badge && isActive && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-700 rounded-full" />
        )}
      </Link>

      {/* Tooltip when collapsed */}
      {collapsed && tooltip === center.key && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-white/5 text-white text-xs font-medium rounded-lg shadow-xl border border-neutral-700/40 whitespace-nowrap pointer-events-none">
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
  const color  = COLORS[center.key] || "text-[#7A6A5C]";
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
            anyActive ? "text-white" : "hover:text-white",
          ].join(" ")}
        >
          <Icon className={["w-4 h-4", anyActive ? "text-amber-400" : color].join(" ")} />
          {center.badge && anyActive && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-700 rounded-full" />
          )}
        </Link>
        {tooltip === center.key && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-white/5 text-white text-xs font-medium rounded-lg shadow-xl border border-neutral-700/40 whitespace-nowrap pointer-events-none">
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
          anyActive ? "text-white" : "hover:text-white",
        ].join(" ")}
      >
        {anyActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{background:"#B9924C"}} />
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
          : <ChevronRight className="w-3 h-3 text-[#7A6A5C] flex-shrink-0 ml-0.5" />
        }
      </button>

      {/* Sub-items */}
      {open && center.children && (
        <div className="ml-4 mt-0.5 mb-1 pl-3 border-l border-transparent space-y-0.5">
          {center.children.map(child => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
                style={childActive ? {color:"#C9A84C",background:"rgba(201,168,76,0.08)",fontWeight:600} : {}}
              >
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{background:childActive?"#C9A84C":"#475569"}} />
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
    <aside
      className={["shrink-0 flex flex-col transition-all", collapsed ? "w-16" : "w-60"].join(" ")}
      style={{
        background: "var(--color-sidebar)",
        borderRight: "1px solid rgba(201,168,76,0.08)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
      }}
    >

      {/* Header / Logo */}
      <div className="h-14 flex items-center border-b border-transparent flex-shrink-0 px-3 gap-2.5">
        <Link href="/workspace" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#A8893A,#C9A84C)"}}>
            <span style={{color:"#0D0B09"}} className="font-black text-sm">TB</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white font-bold text-sm leading-none truncate">Triangle Black</div>
              <div className="text-[10px] mt-0.5" style={{color:"#6D5F53"}}>Enterprise OS</div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg text-tertiary hover:text-white  transition-colors flex-shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-transparent">
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-tertiary hover:text-white  transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
        {navGroups.map((group, gi) => {
          const centers = group.items.map(k => centerMap[k]).filter(Boolean);
          if (centers.length === 0) return null;

          return (
            <div key={group.label} className={gi > 0 ? "pt-3" : "pt-1"}>
              {/* Group label */}
              {!collapsed && (
                <div className="pb-1 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:"#8C7A69"}}>
                    {group.label}
                  </span>
                </div>
              )}
              {collapsed && gi > 0 && (
                <div className="border-t border-transparent/60 mx-2 mb-2" />
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
      <div className="border-t border-transparent flex-shrink-0 p-2">
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
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1.5 bg-white/5 text-white text-xs font-medium rounded-lg shadow-xl border border-neutral-700/40 whitespace-nowrap pointer-events-none">
                {user?.name || "User"} · Sign out
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
