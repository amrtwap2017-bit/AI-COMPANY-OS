# X2 — Mobile Nav + Responsive Layout Improvements
import os, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/x2.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('X2 START — Mobile Nav + Responsive')

# MobileNav component
mobile_nav = '''// @ts-nocheck
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
'''
write(PORTAL+'/components/ui/MobileNav.tsx', mobile_nav, 'MobileNav.tsx')

# Breadcrumb component
breadcrumb = '''// @ts-nocheck
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
'''
write(PORTAL+'/components/ui/Breadcrumb.tsx', breadcrumb, 'Breadcrumb.tsx')

# ConfirmDialog component
confirm_dialog = '''// @ts-nocheck
"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  title:       string;
  description: string;
  onConfirm:   () => void | Promise<void>;
  onCancel?:   () => void;
  variant?:    "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?:  string;
}

export function ConfirmDialog({
  title, description, onConfirm, onCancel,
  variant = "danger",
  confirmText = "Confirm",
  cancelText  = "Cancel",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const colors = {
    danger:  { bg: "bg-red-600",    hover: "hover:bg-red-700",   icon: "text-red-500"  },
    warning: { bg: "bg-amber-600",  hover: "hover:bg-amber-700", icon: "text-amber-500"},
    info:    { bg: "bg-blue-600",   hover: "hover:bg-blue-700",  icon: "text-blue-500" },
  }[variant];

  async function handleConfirm() {
    setLoading(true);
    try { await onConfirm(); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <button onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        <div className={`w-12 h-12 rounded-full bg-red-50 flex items-center
          justify-center mb-4 ${colors.icon}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200
              text-slate-700 text-sm font-medium hover:bg-slate-50">
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-xl text-white text-sm
              font-medium disabled:opacity-60 ${colors.bg} ${colors.hover}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy use
export function useConfirm() {
  const [config, setConfig] = useState<ConfirmDialogProps | null>(null);

  function confirm(props: ConfirmDialogProps) {
    setConfig(props);
  }

  function close() { setConfig(null); }

  return {
    confirm,
    dialog: config ? <ConfirmDialog {...config} onCancel={close} /> : null,
  };
}
'''
write(PORTAL+'/components/ui/ConfirmDialog.tsx', confirm_dialog, 'ConfirmDialog.tsx')

# Export new components
ui_idx = PORTAL + '/components/ui/index.ts'
with open(ui_idx) as f: ui = f.read()
new_exports = [
    "export { MobileNav } from './MobileNav';",
    "export { Breadcrumb } from './Breadcrumb';",
    "export { ConfirmDialog, useConfirm } from './ConfirmDialog';",
]
added = False
for exp in new_exports:
    if exp not in ui:
        ui += chr(10) + exp
        added = True
if added:
    with open(ui_idx,'w') as f: f.write(ui)
    log('  Updated: ui/index.ts')
    results['fixed'].append('ui/index.ts updated')

log('='*40)
log('X2 COMPLETE — Created: '+str(len(results['created'])))
for c in results['created']: log('  OK '+c)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/x2_result.json','w') as f:
    json.dump(results,f,indent=2)