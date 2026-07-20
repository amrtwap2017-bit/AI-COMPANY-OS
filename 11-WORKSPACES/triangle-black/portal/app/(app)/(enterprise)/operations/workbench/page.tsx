// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Button, SectionCard } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { fmtDate } from "@/lib/design-tokens";
import { RefreshCw, Wrench, AlertTriangle, CheckCircle, Clock, ArrowRight, FileText } from "lucide-react";

export default function OperationsWorkbenchPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["workbench-stats"],
    queryFn: () => Promise.resolve({ data: {
      metrics: [
        { label: "Open Service Requests", value: "24", trend: "+12%", trendUp: false, icon: AlertTriangle, color: "amber", link: "/operations/service-requests" },
        { label: "Active Work Orders", value: "18", trend: "+5%", trendUp: true, icon: Wrench, color: "blue", link: "/operations/work-orders" },
        { label: "Completed Today", value: "42", trend: "+8%", trendUp: true, icon: CheckCircle, color: "emerald", link: "/operations/work-orders?status=completed" },
        { label: "Avg. Response Time", value: "14m", trend: "-2m", trendUp: true, icon: Clock, color: "slate", link: "/operations/workbench" }
      ],
      critical_wos: [
        { id: "wo1", number: "WO-2026-042", title: "HVAC Chiller Unit 4B Not Cooling", site: "Grand Cairo Hotel", priority: "High", status: "In Progress", assigned: "Mohamed Ali" },
        { id: "wo2", number: "WO-2026-043", title: "Main Lobby Elevator Door Adjustment", site: "Grand Cairo Hotel", priority: "Medium", status: "Pending", assigned: "Unassigned" },
        { id: "wo3", number: "WO-2026-044", title: "Pool Circulation Pump Leak", site: "Sharm Resort", priority: "High", status: "In Progress", assigned: "Ahmed Hassan" }
      ],
      pending_approvals: [
        { id: "a1", title: "Variation Order #002: Additional Lighting Points", project: "Grand Cairo Renovation", requested_by: "Mohamed (Site Eng)", date: "2026-07-12" },
        { id: "a2", title: "Material Approval: Italian Marble Sample", project: "Grand Cairo Renovation", requested_by: "Amr (PM)", date: "2026-07-14" }
      ]
    }}),
  });

  const d: any = (data?.data as any) || { metrics: [], critical_wos: [], pending_approvals: [] };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Breadcrumb/>
      <PageHeader title="Operations Workbench" subtitle="Real-time command center for engineering operations" badge="OPS"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading?"animate-spin":""}`} />} onClick={()=>refetch()}>Refresh</Button>
            <Link href="/operations/work-orders/new">
              <Button variant="primary" size="sm" icon={<Wrench className="w-3.5 h-3.5" />}>New Work Order</Button>
            </Link>
          </div>
        } />

      {/* KPI Grid (All Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {d.metrics.map((m: any, i: number) => {
          const Icon = m.icon;
          return (
            <Link key={i} href={m.link} className="block group">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${m.color}-100 flex items-center justify-center text-${m.color}-600`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${m.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {m.trend}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{m.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{m.label}</div>
                <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  View Details <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Work Orders */}
        <SectionCard title="Critical & Active Work Orders" actions={<Link href="/operations/work-orders" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3"/></Link>}>
          <div className="space-y-3">
            {d.critical_wos.map((wo: any, i: number) => (
              <Link key={wo.id} href={`/operations/work-orders/${wo.id}`} className="block group">
                <div className="flex items-start justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-white transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-amber-700 font-semibold">{wo.number}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${wo.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{wo.priority}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">{wo.title}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{wo.site}</span> · <span>Assigned: {wo.assigned}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        {/* Pending Approvals */}
        <SectionCard title="Pending Approvals" actions={<Link href="/operations/workbench" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">Review All <ArrowRight className="w-3 h-3"/></Link>}>
          <div className="space-y-3">
            {d.pending_approvals.map((app: any, i: number) => (
              <div key={app.id} className="flex items-start justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{app.title}</div>
                    <div className="text-xs text-slate-600 mt-1">{app.project} · Requested by {app.requested_by} on {fmtDate(app.date)}</div>
                  </div>
                </div>
                <Button variant="secondary" size="xs">Review</Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
