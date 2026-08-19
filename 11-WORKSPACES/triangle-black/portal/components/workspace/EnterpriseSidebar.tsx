// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import { enterpriseCenters, navGroups } from "./nav";
import type { NavCenter } from "./nav";
import { PRIMARY_BY_ROLE, ROLE_LABELS, START_HERE_BY_ROLE } from "@/lib/role-navigation";
import {
  LayoutDashboard, TrendingUp, Users, Wrench, Package, BarChart3, Zap, Activity,
  DollarSign, FolderKanban, Shield, CheckSquare, LogOut, Building2, Bot,
  FileText, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Home, Compass
} from "lucide-react";

const ICONS: Record<string, any> = {
  workspace: Home,
  executive: TrendingUp,
  customers: Users,
  commercial: DollarSign,
  operations: Activity,
  "supply-chain": Package,
  financial: DollarSign,
  assets: Activity,
  portals: Users,
  reports: FileText,
  engineering: Wrench,
  maintenance: Wrench,
  ai: Zap,
  analytics: BarChart3,
  "projects-center": FolderKanban,
  administration: Shield,
  approvals: CheckSquare,
  agents: Bot,
  hotels: Building2,
  settings: Shield,
};

function badgeClass(badge: string): string {
  if (badge === "AI")    return "bg-sidebar-hover text-sidebar-text";
  if (badge === "Live")  return "bg-sidebar-hover text-sidebar-text";
  if (badge === "OPS")   return "bg-sidebar-hover text-sidebar-text";
  if (badge === "CRM")   return "bg-sidebar-hover text-sidebar-text";
  if (badge === "SCM")   return "bg-sidebar-hover text-sidebar-text";
  if (badge === "ENG")   return "bg-sidebar-hover text-sidebar-text";
  return "bg-sidebar/50 text-tertiary";
}

function CenterAccordion({ center, pathname, collapsed }: { center: NavCenter; pathname: string; collapsed: boolean }) {
  const [open, setOpen] = useState(pathname.startsWith(center.href));
  const Icon = (ICONS as Record<string, any>)[center.key] || LayoutDashboard;
  const anyActive = pathname === center.href || pathname.startsWith(center.href + "/");
  const childActive = center.children?.some((c: any) => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false;

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  if (collapsed) {
    return (
      <Link href={center.href}
        className="flex items-center justify-center px-0 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={{color:anyActive?"#F3EFE8":"#A89478",background:anyActive?"rgba(185,146,76,0.10)":"transparent"}}>
        <Icon className="w-4 h-4" style={{color:anyActive?"#B9924C":"#8C7A69"}} />
      </Link>
    );
  }

  return (
    <div>
      <div className="w-full flex items-center gap-0 rounded-xl text-sm font-medium transition-all group relative">
        {anyActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{background:"#B9924C"}} />
        )}
        <Link
          href={center.href}
          className="flex items-center gap-3 flex-1 px-3 py-2 rounded-l-xl transition-all min-w-0"
          style={{color:anyActive?"#F3EFE8":"#A89478",background:anyActive?"rgba(185,146,76,0.08)":"transparent"}}
        >
          <Icon className="w-4 h-4 flex-shrink-0" style={{color:anyActive?"#B9924C":"#8C7A69"}} />
          <span className="flex-1 text-left truncate">{center.shortLabel || center.label}</span>
          {center.badge && (
            <span className={"text-[10px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 " + badgeClass(center.badge)}>
              {center.badge}
            </span>
          )}
        </Link>
        {center.children?.length ? (
          <button onClick={() => setOpen(o => !o)} className="px-2 py-2 transition-colors flex-shrink-0" style={{color:"#6D5F53"}}>
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : null}
      </div>

      {open && center.children && center.children.length > 0 && (
        <div className="ml-4 mt-0.5 mb-1 pl-3 border-l border-transparent space-y-0.5">
          {center.children.map((child: any) => {
            const active = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
                style={active ? {color:"#B9924C",background:"rgba(185,146,76,0.08)",fontWeight:600} : {color:"#8C7A69"}}
              >
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{background:active?"#C9A84C":"#475569"}} />
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

export function EnterpriseSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);
  const role = (user?.role || "viewer").toLowerCase();

  useEffect(() => { setSidebarMounted(true); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("tb_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("tb_recent_pages") || "[]");
    const next = [pathname, ...recent.filter((p: string) => p !== pathname)].slice(0, 6);
    localStorage.setItem("tb_recent_pages", JSON.stringify(next));
  }, [pathname]);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("tb_sidebar_collapsed", String(next));
  }

  const centerMap = Object.fromEntries(enterpriseCenters.map((c: any) => [c.key, c]));
  const primaryKeys = (PRIMARY_BY_ROLE as Record<string, any>)[role] || PRIMARY_BY_ROLE.viewer;
  const startHere = (START_HERE_BY_ROLE as Record<string, any>)[role] || START_HERE_BY_ROLE.viewer;

  // Sprint-202: Feature flag to nav key mapping
  const { isEnabled } = useFeatureFlags();
  const NAV_TO_FLAG: Record<string, string> = {
    "operations":      "operations",
    "maintenance":     "maintenance",
    "supply-chain":    "supply_chain",
    "commercial":      "commercial",
    "analytics":       "analytics",
    "projects-center": "projects",
    "ai":              "ai_assistant",
  };

  const filteredGroups = useMemo(() => {
    return navGroups
      .map((g: any) => ({
        ...g,
        items: g.items.filter((k: any) => {
          if (!primaryKeys.includes(k)) return false;
          const flagKey = (NAV_TO_FLAG as Record<string, any>)[k];
          if (flagKey && !isEnabled(flagKey)) return false;
          return true;
        })
      }))
      .filter((g: any) => g.items.length > 0);
  }, [primaryKeys, isEnabled]);

  const recentPaths = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = JSON.parse(localStorage.getItem("tb_recent_pages") || "[]");
      return raw.filter((p: string) => p && p !== pathname).slice(0, 5);
    } catch { return []; }
  }, [pathname]);

  const findLabel = (href: string) => {
    for (const c of enterpriseCenters) {
      if (c.href === href) return c.label;
      for (const ch of c.children || []) {
        if (ch.href === href) return ch.label;
      }
    }
    return href.split("/").filter(Boolean).slice(-1)[0] || "Page";
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "TB";

  return (
    <aside
      className={["shrink-0 flex flex-col transition-all", collapsed ? "w-16" : "w-64"].join(" ")}
      style={{
        background: "var(--color-sidebar)",
        borderRight: "1px solid rgba(185,146,76,0.08)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Header */}
      <div className="h-14 flex items-center flex-shrink-0 px-3 gap-2.5" style={{borderBottom:"1px solid rgba(185,146,76,0.06)"}}>
        <Link href="/workspace" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)"}}>
            <span style={{color:"#0D0B09"}} className="font-black text-sm">TB</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div style={{color:"#F3EFE8",fontWeight:700,fontSize:"0.875rem",lineHeight:1}} className="truncate">Triangle Black</div>
              <div style={{color:"#6D5F53",fontSize:"0.625rem",marginTop:3}}>{(ROLE_LABELS as Record<string, any>)[role] || "User"}</div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button onClick={toggleCollapse} className="ml-auto w-6 h-6 flex items-center justify-center rounded-lg transition-colors flex-shrink-0" style={{color:"#6D5F53"}}>
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2" style={{borderBottom:"1px solid rgba(185,146,76,0.06)"}}>
          <button onClick={toggleCollapse} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{color:"#6D5F53"}}>
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Start Here */}
      {!collapsed && (
        <div style={{padding:"12px 12px 8px",borderBottom:"1px solid rgba(185,146,76,0.04)"}}>
          <div style={{fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#6D5F53",marginBottom:8}}>Start Here</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {startHere.map((item: any, i: number) => (
              <button key={i} onClick={() => router.push(item.href)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:8,background:"rgba(185,146,76,0.06)",border:"1px solid rgba(185,146,76,0.10)",cursor:"pointer",textAlign:"left"}}>
                <span style={{fontSize:"0.75rem",fontWeight:600,color:"#B9924C"}}>{item.label}</span>
                <span style={{fontSize:"0.75rem",color:"#B9924C"}}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {filteredGroups.map((group: any, gi: any) => {
          const centers = group.items.map((k: any) => centerMap[k]).filter(Boolean);
          if (centers.length === 0) return null;
          return (
            <div key={group.label} className={gi > 0 ? "pt-3" : "pt-1"}>
              {!collapsed && (
                <div className="pb-1 px-3">
                  <span style={{fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#6D5F53"}}>
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {centers.map((center: any) => (
                  <CenterAccordion key={center.key} center={center} pathname={pathname} collapsed={collapsed} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Recent Pages */}
        {sidebarMounted && !collapsed && recentPaths.length > 0 && (
          <div className="pt-4">
            <div className="pb-1 px-3">
              <span style={{fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#6D5F53"}}>
                Recent
              </span>
            </div>
            <div className="space-y-0.5">
              {recentPaths.map((href: any, i: any) => (
                <Link key={i} href={href}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:bg-white/5"
                  style={{color:"#8C7A69"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#475569",flexShrink:0}} />
                  <span className="truncate">{findLabel(href)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{padding:"12px",borderTop:"1px solid rgba(185,146,76,0.06)",display:"flex",flexDirection:"column",gap:8}}>
        <button
          onClick={() => router.push("/workspace/all-modules")}
          style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(185,146,76,0.08)",cursor:"pointer",textAlign:"left",width:"100%"}}
        >
          <Compass className="w-4 h-4" style={{color:"#B9924C"}} />
          {!collapsed && (
            <div style={{display:"flex",flexDirection:"column",minWidth:0}}>
              <span style={{fontSize:"0.75rem",fontWeight:600,color:"#F3EFE8"}}>All Modules</span>
              <span style={{fontSize:"0.6875rem",color:"#6D5F53"}}>Complete sitemap</span>
            </div>
          )}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#8F6F3D,#B9924C)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:"0.6875rem",fontWeight:800,color:"#0D0B09"}}>{initials}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div style={{fontSize:"0.75rem",fontWeight:600,color:"#F3EFE8"}} className="truncate">{user?.name || "User"}</div>
              <div style={{fontSize:"0.625rem",color:"#6D5F53"}} className="truncate">{(ROLE_LABELS as Record<string, any>)[role] || role}</div>
            </div>
          )}
          <button onClick={logout} style={{background:"transparent",border:"none",cursor:"pointer",padding:0}}>
            <LogOut className="w-4 h-4" style={{color:"#A84A3D"}} />
          </button>
        </div>
      </div>
    </aside>
  );
}
