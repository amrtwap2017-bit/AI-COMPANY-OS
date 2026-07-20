import os, json, datetime
LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/w4.log'
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

log('W4 START — Route Unification')

# /work-orders → keep existing upgraded page (it's good)
# /technicians  → keep existing upgraded page
# /assets       → keep existing upgraded page
# enterprise pages → stay at their routes but now accessible via sidebar

# Create unified /notifications page
notifications_page = '''// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface Notification {
  id:      string;
  type:    "success" | "warning" | "info" | "error";
  title:   string;
  message: string;
  time:    string;
  read:    boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id:"1", type:"warning", title:"SLA Breach Risk",       message:"Work Order WO-2026-042 approaching SLA deadline", time:"5m ago",  read:false },
  { id:"2", type:"success", title:"Work Order Completed",  message:"WO-2026-039 Pool Circulation Pump Leak resolved",  time:"2h ago",  read:false },
  { id:"3", type:"info",    title:"New Lead Assigned",     message:"Marriott Cairo lead assigned to your team",        time:"4h ago",  read:true  },
  { id:"4", type:"warning", title:"Low Stock Alert",       message:"HVAC filters below minimum stock level",           time:"1d ago",  read:true  },
  { id:"5", type:"info",    title:"Technician Dispatched", message:"Mohamed Ali dispatched to Grand Cairo Hotel",      time:"1d ago",  read:true  },
];

export default function NotificationsPage() {
  const [notes, setNotes] = useState(MOCK_NOTIFICATIONS);
  const unread = notes.filter(n => !n.read).length;
  const icons = { success:CheckCircle, warning:AlertTriangle, info:Info, error:AlertTriangle };
  const colors = {
    success: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    info:    "text-blue-600 bg-blue-50",
    error:   "text-red-600 bg-red-50",
  };

  function markRead(id: string) {
    setNotes(ns => ns.map(n => n.id===id ? {...n, read:true} : n));
  }
  function markAllRead() {
    setNotes(ns => ns.map(n => ({...n, read:true})));
  }
  function dismiss(id: string) {
    setNotes(ns => ns.filter(n => n.id !== id));
  }

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Notifications" subtitle={`${unread} unread notifications`} badge="NOTIF"
        actions={unread>0&&(
          <button onClick={markAllRead}
            className="text-xs text-amber-600 hover:underline">Mark all read</button>
        )}/>
      <div className="space-y-2">
        {notes.length===0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
            <p className="text-slate-500">No notifications</p>
          </div>
        ) : notes.map(note => {
          const Icon = icons[note.type];
          return (
            <div key={note.id}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all ${
                note.read ? "border-slate-100 opacity-70" : "border-slate-200 shadow-sm"
              }`}
              onClick={() => markRead(note.id)}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[note.type]}`}>
                <Icon className="w-4 h-4"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${note.read?"text-slate-500":"text-slate-900"}`}>{note.title}</p>
                  {!note.read && <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"/>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{note.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{note.time}</p>
              </div>
              <button onClick={e=>{e.stopPropagation();dismiss(note.id);}}
                className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                <X className="w-4 h-4"/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
'''
write(PORTAL+'/app/(app)/notifications/page.tsx', notifications_page, 'notifications/page.tsx')

# Create settings page
settings_page = '''// @ts-nocheck
"use client";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { User, Shield, Bell, Globe, Database, Cpu, ArrowRight } from "lucide-react";

const SETTINGS = [
  { icon:User,     label:"Profile",         desc:"Manage your account details",           href:"/profile" },
  { icon:Bell,     label:"Notifications",    desc:"Configure alert preferences",           href:"/notifications" },
  { icon:Shield,   label:"Security",         desc:"Password and authentication settings",  href:"/profile" },
  { icon:Globe,    label:"Language & Region",desc:"Egypt · Arabic/English",                href:"/profile" },
  { icon:Database, label:"Data & Export",    desc:"Manage data and exports",               href:"/reports" },
  { icon:Cpu,      label:"AI Settings",      desc:"Configure AI assistant behavior",       href:"/engineering/ai" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Settings" subtitle="Platform configuration" badge="CFG"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS.map(s=>(
          <Link key={s.label} href={s.href}
            className="bg-white rounded-2xl border border-slate-200 p-5
              hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center
              group-hover:bg-amber-50 mb-4">
              <s.icon className="w-5 h-5 text-slate-500 group-hover:text-amber-600"/>
            </div>
            <p className="font-semibold text-sm text-slate-900">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 mt-3"/>
          </Link>
        ))}
      </div>
    </div>
  );
}
'''
write(PORTAL+'/app/(app)/settings/page.tsx', settings_page, 'settings/page.tsx')

# Fix: /customers redirect or page
customers_page = '''// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTable, StatusPill, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/hooks/usePagination";
import { useSearch } from "@/lib/hooks/useSearch";
import { customersApi } from "@/lib/api";
import { fmtDate } from "@/lib/design-tokens";

export default function CustomersPage() {
  const { data=[], isLoading, isError, error } = useQuery({
    queryKey: ["customers"],
    queryFn:  () => customersApi.list({ limit: 200 }),
    staleTime: 30_000,
  });
  const { query, setQuery, filtered } = useSearch(data, ["name","email","phone"]);
  const { page, totalPages, items, goToPage } = usePagination(filtered, 20);
  const columns = [
    { key:"name",       label:"Customer",  render:(r:any)=>(<p className="font-semibold text-sm">{r.name}</p>)},
    { key:"email",      label:"Email",     render:(r:any)=>(<span className="text-sm text-slate-600">{r.email||"—"}</span>)},
    { key:"phone",      label:"Phone",     render:(r:any)=>(<span className="text-sm">{r.phone||"—"}</span>)},
    { key:"status",     label:"Status",    render:(r:any)=>(<StatusPill status={r.status||"active"}/>)},
    { key:"created_at", label:"Since",     render:(r:any)=>(<span className="text-xs text-slate-400">{fmtDate(r.created_at)}</span>)},
  ];
  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Customers" subtitle={`${data.length} customers`} badge="CX"/>
      {isError&&<AlertBanner type="error" title={error instanceof Error?error.message:"Failed to load customers"}/>}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading?<LoadingState type="table" rows={8}/>:
         items.length===0?<EmptyState icon="👥" title="No customers" description={isError?"API unavailable":"No customers found"}/>:
         <DataTable columns={columns} data={items}/>}
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={goToPage}/>
    </div>
  );
}
'''
write(PORTAL+'/app/(app)/customers/page.tsx', customers_page, 'customers/page.tsx')

log('='*40)
log('W4 COMPLETE')
for c in results['created']: log('  OK '+c)
import json as _j
with open('/home/amr/AI-COMPANY-OS/tasks/logs/w4_result.json','w') as f:
    _j.dump(results,f,indent=2)