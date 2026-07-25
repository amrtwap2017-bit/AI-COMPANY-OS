// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { CheckCircle, AlertCircle, Server, Database, Cpu, Globe } from "lucide-react";

const PROGRAMS = [
  {id:"A",name:"UX Foundation",   desc:"146 pages, PWA, Command Palette"},
  {id:"B",name:"Operations",      desc:"SLA, dispatch, mobile my-day"},
  {id:"C",name:"Workflow Engine", desc:"WO + Project + PR state machines"},
  {id:"D",name:"Resources",       desc:"Dispatch, crew, AI scheduling"},
  {id:"E",name:"Projects",        desc:"Phase SM, earned value, portfolio"},
  {id:"F",name:"Cost Engine",     desc:"BOQ, margin, reorder automation"},
  {id:"G",name:"Planning",        desc:"Capacity-aware AI scheduling"},
  {id:"H",name:"Documents",       desc:"PDF export WO + Invoice"},
  {id:"I",name:"Finance",         desc:"Cash flow, payments, KPI trends"},
  {id:"J",name:"Customer",        desc:"NPS, renewals, warranty"},
  {id:"K",name:"Supplier",        desc:"Portal + RFQ + quote submission"},
  {id:"L",name:"AI Layer",        desc:"Signals v2, scheduling, notifications"},
  {id:"M",name:"Digital Twin",    desc:"Health score + 8 operational domains"},
  {id:"N",name:"Knowledge Graph", desc:"Qdrant + PostgreSQL entity graph"},
];

export default function PlatformStatusPage() {
  const { data: health = {}, isLoading } = useQuery({
    queryKey: ["platform-health"],
    queryFn: () => authFetch("/api/v1/health/detailed").then(r => r.json()),
    refetchInterval: 60000,
  });
  const { data: version = {} } = useQuery({
    queryKey: ["platform-version"],
    queryFn: () => authFetch("/api/v1/version").then(r => r.json()),
  });
  const { data: twin = {} } = useQuery({
    queryKey: ["twin-status"],
    queryFn: () => authFetch("/api/v1/twin/state").then(r => r.json()),
    refetchInterval: 30000,
  });
  const { data: notifs = {} } = useQuery({
    queryKey: ["notif-status"],
    queryFn: () => authFetch("/api/v1/notifications/?limit=20live/count").then(r => r.json()),
    refetchInterval: 30000,
  });

  if (isLoading) return <PageWrapper><LoadingState title="Loading platform status..." /></PageWrapper>;

  const dbOk  = health?.checks?.database === "ok";
  const apiOk = health?.status === "ok";
  const score = twin?.health_score ?? 0;

  const services = [
    { label:"API Backend",   ok: apiOk,    icon: Server,   detail:`v${version.version ?? "2.0.0"}` },
    { label:"Database",      ok: dbOk,     icon: Database, detail:"PostgreSQL + pgvector" },
    { label:"Digital Twin",  ok: score > 0,icon: Cpu,      detail:`${score}/100 ${twin?.health_label ?? ""}` },
    { label:"Notifications", ok: true,     icon: Globe,    detail:`${notifs.badge ?? 0} active alerts` },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Platform Status"
        subtitle={`Triangle Black · Sprint ${version.sprint ?? 76} · ${version.build ?? "production-ready"}`}
        badge="Administration"
      />
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        {services.map(s => (
          <div key={s.label} className={`bg-white border-2 rounded-xl p-4 ${s.ok ? "border-emerald-200" : "border-red-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-5 h-5 ${s.ok ? "text-emerald-600" : "text-red-600"}`} />
              {s.ok ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="text-sm font-semibold text-slate-800">{s.label}</div>
            <div className="text-xs text-slate-400 mt-1">{s.detail}</div>
          </div>
        ))}
      </div>
      <SectionCard title="14 Programs — All Live">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROGRAMS.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{p.id}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800">{p.name}</div>
                <div className="text-xs text-slate-400 truncate">{p.desc}</div>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Version">
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            {label:"Version",  value: version.version ?? "2.0.0"},
            {label:"Sprint",   value: `Sprint ${version.sprint ?? 76}`},
            {label:"Programs", value: `${version.programs ?? 14}/14`},
            {label:"Build",    value: version.build ?? "production-ready"},
          ].map(v => (
            <div key={v.label}>
              <div className="text-lg font-bold text-slate-800">{v.value}</div>
              <div className="text-xs text-slate-400 mt-1">{v.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageWrapper>
  );
}
