import os, json, datetime
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/w2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('W2 START — Unified Sidebar Navigation')

# Create the unified sidebar
sidebar = '''// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Wrench, UserCheck, Package,
  Warehouse, ClipboardList, BarChart3, Building2,
  ChevronDown, ChevronRight, Settings, LogOut,
  TrendingUp, Tool, ShoppingCart, FileText,
  Calendar, GitBranch, Shield, Activity,
  Hammer, Cpu, Star, Menu, X,
} from "lucide-react";

interface NavItem {
  label:    string;
  href?:    string;
  icon:     any;
  badge?:   string;
  children?: { label: string; href: string; badge?: string }[];
}

const NAV: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",   icon: LayoutDashboard },

  { label: "Commercial",  icon: TrendingUp, badge: "CRM", children: [
    { label: "Leads",         href: "/leads" },
    { label: "Customers",     href: "/customers" },
    { label: "Contracts",     href: "/contracts" },
    { label: "Invoices",      href: "/invoices" },
    { label: "Quotes",        href: "/quotes" },
    { label: "Pipeline",      href: "/commercial/pipeline" },
  ]},

  { label: "Operations",  icon: Wrench, badge: "OPS", children: [
    { label: "Work Orders",      href: "/work-orders" },
    { label: "New Work Order",   href: "/operations/work-orders/new" },
    { label: "Service Requests", href: "/operations/service-requests" },
    { label: "Dispatch Board",   href: "/operations/dispatch" },
    { label: "Calendar",         href: "/operations/calendar" },
    { label: "SLA Review",       href: "/operations/sla-review" },
  ]},

  { label: "Maintenance", icon: Hammer, badge: "MNT", children: [
    { label: "Assets",        href: "/assets" },
    { label: "PM Plans",      href: "/maintenance/pm-plans" },
    { label: "Schedule",      href: "/maintenance/schedule" },
    { label: "Asset Tree",    href: "/maintenance/asset-tree" },
  ]},

  { label: "Field Team",   icon: UserCheck, children: [
    { label: "Technicians", href: "/technicians" },
  ]},

  { label: "Supply Chain", icon: ShoppingCart, badge: "SCM", children: [
    { label: "Inventory",       href: "/inventory" },
    { label: "Warehouses",      href: "/warehouses" },
    { label: "Purchase Orders", href: "/supply-chain/purchase-orders" },
    { label: "Suppliers",       href: "/supply-chain/suppliers" },
    { label: "RFQs",            href: "/supply-chain/rfqs" },
  ]},

  { label: "Engineering",  icon: Cpu, badge: "ENG", children: [
    { label: "AI Assistant",    href: "/engineering/ai" },
    { label: "Intelligence",    href: "/engineering/intelligence" },
    { label: "Projects",        href: "/projects-center" },
  ]},

  { label: "Executive",    icon: Star, badge: "EXEC", children: [
    { label: "Intelligence",  href: "/executive/intelligence" },
    { label: "Reports",       href: "/reports" },
    { label: "Analytics",     href: "/analytics" },
    { label: "Portfolio",     href: "/executive/portfolio" },
  ]},

  { label: "Settings",     icon: Settings, children: [
    { label: "Profile",  href: "/profile" },
  ]},
];

function NavGroup({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some(c => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isActive || false);
  const Icon = item.icon;

  if (item.href && !item.children) {
    return (
      <Link href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          isActive ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto text-[9px] font-bold bg-slate-700 px-1.5 py-0.5 rounded">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          isActive ? "text-amber-400" : "text-slate-400 hover:text-white hover:bg-slate-800"
        }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="text-[9px] font-bold bg-slate-700 px-1.5 py-0.5 rounded">{item.badge}</span>
            )}
            {open
              ? <ChevronDown className="w-3 h-3 ml-1" />
              : <ChevronRight className="w-3 h-3 ml-1" />
            }
          </>
        )}
      </button>
      {!collapsed && open && item.children && (
        <div className="ml-7 mt-1 space-y-0.5">
          {item.children.map(child => {
            const active = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link key={child.href} href={child.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  active ? "text-amber-400 bg-amber-600/10" : "text-slate-500 hover:text-white"
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                {child.label}
                {child.badge && (
                  <span className="ml-auto text-[9px] bg-slate-700 px-1.5 rounded">{child.badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside className={`flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all ${
      collapsed ? "w-14" : "w-64"
    }`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-800 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white">Triangle Black</p>
            <p className="text-[10px] text-slate-500">Engineering Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(item => (
          <NavGroup key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-amber-600/20 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-400">TB</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Admin</p>
              <p className="text-[10px] text-slate-500 truncate">triangleblack.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
'''
write(PORTAL+'/components/Sidebar.tsx', sidebar, 'components/Sidebar.tsx')

# Update (app)/layout.tsx to use Sidebar
app_layout = '''// @ts-nocheck
"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile header */}
      <MobileNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-3
          bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-400">Triangle Black Platform v2.6.0</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
'''
with open(PORTAL+'/app/(app)/layout.tsx','w') as f: f.write(app_layout)
log('  UPDATED: app/(app)/layout.tsx with Sidebar')
results['fixed'].append('(app)/layout.tsx with full Sidebar')

log('='*40)
log('W2 COMPLETE')
for c in results['created']: log('  OK '+c)
for f in results['fixed']:   log('  FIXED '+f)
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/w2_result.json','w') as f:
    _j.dump(results,f,indent=2)