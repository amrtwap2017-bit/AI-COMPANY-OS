// @ts-nocheck
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PageWrapper } from "@/components/ui";
import { dashboardApi } from "@/lib/dashboard-api";
import { BarChart3, TrendingUp, Users, Wrench, Package, ArrowUp, ArrowDown } from "lucide-react";

function KpiCard({ title, value, sub, trend, icon: Icon, color="amber" }:any) {
  const colors:any = {
    amber:   "bg-amber-50 text-amber-600",
    blue:    "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red:     "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]||colors.amber}`}>
          <Icon className="w-5 h-5"/>
        </div>
        {trend && <span className={`text-xs font-bold flex items-center gap-0.5 ${trend>0?"text-emerald-600":"text-red-500"}`}>
          {trend>0?<ArrowUp className="w-3 h-3"/>:<ArrowDown className="w-3 h-3"/>}
          {Math.abs(trend)}%
        </span>}
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-1">{title}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 60_000,
  });

  return (
    <PageWrapper>
      <PageHeader title="Reports" subtitle="Business intelligence and KPIs" badge="RPT"/>

      {isLoading ? <LoadingState type="cards" rows={8} cols={4}/> : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Commercial Pipeline</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Total Leads" value={stats?.leads?.total||0} sub="in pipeline" icon={TrendingUp} color="blue"/>
              <KpiCard title="Qualified" value={stats?.leads?.qualified||0} sub="ready for proposal" icon={Users} color="emerald"/>
              <KpiCard title="In Negotiation" value={stats?.leads?.negotiation||0} sub="active deals" icon={TrendingUp} color="amber"/>
              <KpiCard title="Won Deals" value={stats?.leads?.won||0} sub="closed" icon={TrendingUp} color="emerald" trend={12}/>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Operations</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Open Work Orders" value={stats?.workOrders?.open||0} sub="need attention" icon={Wrench} color="amber"/>
              <KpiCard title="In Progress" value={stats?.workOrders?.inProgress||0} sub="active" icon={Wrench} color="blue"/>
              <KpiCard title="Completed" value={stats?.workOrders?.completed||0} sub="this period" icon={Wrench} color="emerald" trend={8}/>
              <KpiCard title="Critical" value={stats?.workOrders?.critical||0} sub="urgent attention" icon={Wrench} color="red"/>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Field Team</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Active Technicians" value={stats?.technicians?.active||0} sub="on roster" icon={Users} color="emerald"/>
              <KpiCard title="Total Technicians" value={stats?.technicians?.total||0} sub="registered" icon={Users} color="blue"/>
              <KpiCard title="Assets Tracked" value={stats?.assets?.total||0} sub="in system" icon={Package} color="amber"/>
              <KpiCard title="Avg Response" value="14m" sub="SLA target: 30m" icon={BarChart3} color="emerald" trend={-5}/>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-2">📊 Advanced Reports</h3>
        <p className="text-sm text-slate-500">Detailed analytics, charts and export functionality coming in the next sprint.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["Lead Conversion Report","Work Order SLA Report","Technician Performance Report"].map(name=>(
            <div key={name} className="p-3 border border-slate-200 rounded-xl text-sm text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4"/> {name}
              <span className="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded">Coming soon</span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
