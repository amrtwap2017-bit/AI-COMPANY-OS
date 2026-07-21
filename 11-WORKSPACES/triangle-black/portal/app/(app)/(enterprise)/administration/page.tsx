"use client";
// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { Users, Shield, Bell, Database, Settings, ArrowRight } from "lucide-react";

function StatusDot({ ok }: { ok: boolean }) {
  return <span className={"w-2 h-2 rounded-full flex-shrink-0 "+( ok?"bg-emerald-500":"bg-red-400")}/>;
}

export default function AdministrationPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn:  () => authFetchJSON("/api/v1/actions/dashboard/stats"),
    staleTime: 60_000,
  });
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn:  () => authFetchJSON("/api/v1/actions/users"),
    staleTime: 60_000,
  });

  const userList  = Array.isArray(users)?users:users?.users||[];
  const s = stats||{};

  const SECTIONS = [
    { icon:Users,    label:"User Management",  desc:userList.length+" registered users", href:"/administration/users", ok:userList.length>0 },
    { icon:Shield,   label:"Audit Trail",      desc:"Activity and security log",          href:"/administration/audit", ok:true },
    { icon:Bell,     label:"Notification Rules",desc:"Alert configuration",               href:"/admin/notification-rules", ok:true },
    { icon:Database, label:"Data & Export",    desc:"Backup and export tools",            href:"/reports",             ok:true },
    { icon:Settings, label:"System Settings",  desc:"Platform configuration",             href:"/settings",            ok:true },
  ];

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="Administration" subtitle="Platform management and configuration" badge="ADMIN"/>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total Leads",    val:s.total_leads||0},
          {label:"Open Quotes",    val:s.open_quotes||0},
          {label:"Notifications",  val:s.unread_notifications||0},
          {label:"Users",          val:userList.length},
        ].map(k=>(
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{k.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {SECTIONS.map(item=>(
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
              <item.icon className="w-5 h-5 text-slate-500 group-hover:text-amber-600"/>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <StatusDot ok={item.ok}/>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 ml-1"/>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}
