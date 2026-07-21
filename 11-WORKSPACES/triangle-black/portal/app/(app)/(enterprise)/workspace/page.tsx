"use client";
// @ts-nocheck
"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, LoadingState } from "@/components/ui";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { useEffect, useState } from "react";
import {
  TrendingUp, Wrench, Bell, CheckCircle2,
  ArrowRight, BarChart3, Package, Calendar,
} from "lucide-react";

export default function WorkspacePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(()=>{
    authFetchJSON("/api/v1/auth/me").then(d=>setUser(d)).catch(()=>{
      const t = tokenManager.getToken();
      if(t) try { setUser(JSON.parse(atob(t.split(".")[1]+"=="))); } catch {}
    });
  },[]);

  const { data: stats } = useQuery({
    queryKey: ["ws-stats"],
    queryFn:  () => authFetchJSON("/api/v1/actions/dashboard/stats"),
    staleTime: 60_000,
  });
  const { data: approvals } = useQuery({
    queryKey: ["ws-approvals"],
    queryFn:  () => authFetchJSON("/api/v1/approvals/count"),
    staleTime: 60_000,
  });

  const s = stats || {};
  const a = approvals || {};
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";

  const QUICK_LINKS = [
    { icon:TrendingUp,   label:"Leads",        href:"/leads",                    count:s.total_leads,           color:"blue"    },
    { icon:Wrench,       label:"Work Orders",  href:"/work-orders",              count:s.open_work_orders,      color:"amber"   },
    { icon:CheckCircle2, label:"Approvals",    href:"/approvals",                count:a.total,                 color:"emerald" },
    { icon:Bell,         label:"Notifications",href:"/notifications",            count:s.unread_notifications,  color:"red"     },
    { icon:Package,      label:"Inventory",    href:"/inventory",                count:null,                    color:"slate"   },
    { icon:BarChart3,    label:"Reports",      href:"/reports",                  count:null,                    color:"slate"   },
    { icon:Calendar,     label:"Operations",   href:"/operations",               count:null,                    color:"slate"   },
    { icon:TrendingUp,   label:"Pipeline",     href:"/commercial/pipeline",      count:null,                    color:"slate"   },
  ];

  const COLORS: any = {
    blue:"bg-blue-50 text-blue-600", amber:"bg-amber-50 text-amber-600",
    emerald:"bg-emerald-50 text-emerald-600", red:"bg-red-50 text-red-600",
    slate:"bg-slate-100 text-slate-500",
  };

  return (
    <PageWrapper>
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white mb-6">
        <p className="text-amber-400 text-sm font-semibold mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-bold">{user?.name || "Welcome back"}</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{user?.role||"—"} · Triangle Black Platform</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {QUICK_LINKS.map(link=>{
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all group">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 "+COLORS[link.color]}>
                <Icon className="w-5 h-5"/>
              </div>
              <p className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">{link.label}</p>
              {link.count !== null && link.count !== undefined && (
                <p className="text-2xl font-bold text-slate-700 mt-1">{link.count}</p>
              )}
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 mt-2 transition-colors"/>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {label:"New Work Order",  href:"/operations/work-orders/new"},
            {label:"New Lead",        href:"/leads/new"},
            {label:"New Quote",       href:"/quotes/new"},
            {label:"Maintenance",     href:"/maintenance"},
            {label:"Supply Chain",    href:"/supply-chain"},
            {label:"Engineering",     href:"/engineering"},
            {label:"Executive",       href:"/executive"},
            {label:"Analytics",       href:"/analytics"},
          ].map(item=>(
            <Link key={item.href} href={item.href}
              className="text-xs text-center px-3 py-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-xl border border-slate-100 text-slate-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
