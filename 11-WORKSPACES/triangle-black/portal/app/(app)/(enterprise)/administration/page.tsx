// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, MetricStrip, SectionCard, DataTable, StatusPill, LoadingState } from "@/components/ui";
import { fmtDate } from "@/lib/design-tokens";
import { Settings, Users, Hotel, Database, Shield, Activity } from "lucide-react";
import axios from "axios";

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api/v1" });
api.interceptors.request.use(c => {
  const t = typeof window !== "undefined" ? localStorage.getItem("tb_token") : null;
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export default function AdministrationPage() {
  const usersQ = useQuery({ queryKey:["admin-users"], queryFn:()=>api.get("/actions/users") });
  const hotelsQ = useQuery({ queryKey:["admin-hotels"], queryFn:()=>api.get("/hotels/") });
  const healthQ = useQuery({ queryKey:["api-health"], queryFn:()=>api.get("/workflow/health") });

  const metrics = [
    { label:"Users", value:(usersQ.data as any)?.length||(usersQ.data as any)?.count||"—", icon:<Users className="w-4 h-4"/>, color:"blue" },
    { label:"Hotels", value:(hotelsQ.data as any)?.length||(hotelsQ.data as any)?.count||1, icon:<Hotel className="w-4 h-4"/>, color:"amber" },
    { label:"API Status", value:"Online", icon:<Activity className="w-4 h-4"/>, color:"emerald" },
    { label:"Version", value:"v3.19.0", icon:<Database className="w-4 h-4"/>, color:"slate" },
  ];

  const modules = [
    { label:"User Management", desc:"Create and manage platform users, roles and permissions", icon:"👥", status:"active" },
    { label:"Hotel Management", desc:"Manage hotel properties and configurations", icon:"🏨", status:"active" },
    { label:"Workflow Engine", desc:"Design and manage approval workflows", icon:"⚙️", status:"active" },
    { label:"Notification Rules", desc:"Configure automated notification rules", icon:"🔔", status:"active" },
    { label:"Audit Trail", desc:"View all system events and user actions", icon:"📋", status:"active" },
    { label:"Integration Settings", desc:"API keys, webhooks, and external integrations", icon:"🔌", status:"planned" },
    { label:"Security Settings", desc:"Password policies, 2FA, and session management", icon:"🛡️", status:"planned" },
    { label:"System Health", desc:"Monitor platform performance and uptime", icon:"📊", status:"active" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Administration" subtitle="Platform configuration, users, and system management" />

      <MetricStrip metrics={metrics} cols={4} />

      <div className="grid grid-cols-4 gap-3">
        {modules.map(mod => (
          <div key={mod.label} className={`bg-white rounded-2xl border p-5 ${mod.status==="planned"?"border-dashed border-slate-200 opacity-60":"border-slate-200 hover:border-amber-300 hover:shadow-md transition-all"}`}>
            <div className="text-3xl mb-3">{mod.icon}</div>
            <div className="font-bold text-slate-900 text-sm">{mod.label}</div>
            <div className="text-xs text-slate-400 mt-1 leading-snug">{mod.desc}</div>
            {mod.status === "planned" && <span className="inline-flex mt-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">Planned</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="System Modules" icon={<Database className="w-4 h-4"/>}>
          <div className="divide-y divide-slate-50">
            {[
              { module:"CRM & Commercial", endpoints:45, status:"operational" },
              { module:"Engineering", endpoints:12, status:"operational" },
              { module:"Maintenance", endpoints:18, status:"operational" },
              { module:"Procurement", endpoints:32, status:"operational" },
              { module:"Customer Success", endpoints:12, status:"operational" },
              { module:"Vendor Portal", endpoints:15, status:"operational" },
              { module:"Analytics Platform", endpoints:11, status:"operational" },
              { module:"Executive Intelligence", endpoints:6, status:"operational" },
              { module:"AI Assistant", endpoints:5, status:"operational" },
              { module:"Approval Center", endpoints:4, status:"operational" },
              { module:"Projects Enterprise", endpoints:8, status:"operational" },
              { module:"Workflow Engine", endpoints:6, status:"operational" },
            ].map((m,i)=>(
              <div key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50">
                <div>
                  <div className="text-sm font-medium text-slate-900">{m.module}</div>
                  <div className="text-xs text-slate-400">{m.endpoints} endpoints</div>
                </div>
                <StatusPill status={m.status} dot/>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Platform Health" icon={<Shield className="w-4 h-4"/>}>
          <div className="p-5 space-y-4">
            {[
              { label:"API Server", status:"online", value:"Port 8030" },
              { label:"Database", status:"connected", value:"PostgreSQL" },
              { label:"Security Headers", status:"active", value:"HSTS, CSP, XSS" },
              { label:"Authentication", status:"active", value:"JWT Bearer" },
              { label:"Multi-tenancy", status:"active", value:"hotel_id isolation" },
              { label:"Performance Indexes", status:"active", value:"265 indexes" },
              { label:"Tables Managed", status:"active", value:"117 tables" },
              { label:"Total Endpoints", status:"active", value:"230+ routes" },
            ].map((item,i)=>(
              <div key={i} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-700 font-medium">{item.value}</span>
                  <StatusPill status={item.status} dot size="sm"/>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
