"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { customerSuccessApi } from "@/lib/customer-success-api";
import { EntityShell, MetricStrip, SectionCard, DataTable, StatusPill, LoadingState, EmptyState } from "@/components/ui";
import { fmtCurrency, fmtDate, fmtDateShort, timeAgo } from "@/lib/design-tokens";
import { TrendingUp, Users, FileText, Wrench, BarChart3, Activity, CheckCircle, AlertTriangle } from "lucide-react";

const TABS = [
  { key:"overview",     label:"Overview",       icon:"🏠" },
  { key:"timeline",     label:"Timeline",       icon:"📅" },
  { key:"contracts",    label:"Contracts",      icon:"📋" },
  { key:"invoices",     label:"Invoices",       icon:"💰" },
  { key:"meetings",     label:"Meetings",       icon:"🤝" },
  { key:"satisfaction", label:"Satisfaction",   icon:"⭐" },
  { key:"tasks",        label:"Tasks",          icon:"✅" },
  { key:"ai",           label:"AI Insights",    icon:"🤖" },
];

const healthBarColor = (n: number) =>
  n >= 75 ? "bg-emerald-500" : n >= 50 ? "bg-amber-500" : "bg-red-500";

function HealthBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-bold ${value >= 75 ? "text-emerald-600" : value >= 50 ? "text-amber-600" : "text-red-600"}`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${healthBarColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function Customer360Page() {
  const params = useParams();
  const leadId = params.id as string;
  const [tab, setTab] = useState("overview");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customer-360", leadId],
    queryFn: () => customerSuccessApi.get360(leadId),
    enabled: !!leadId,
  });

  const meetingsQ = useQuery({ queryKey:["cust-meetings",leadId], queryFn:()=>customerSuccessApi.getMeetings(leadId), enabled:tab==="meetings" });
  const satQ = useQuery({ queryKey:["cust-sat",leadId], queryFn:()=>customerSuccessApi.getSatisfaction(leadId), enabled:tab==="satisfaction" });
  const tasksQ = useQuery({ queryKey:["cust-tasks",leadId], queryFn:()=>customerSuccessApi.getTasks(leadId), enabled:tab==="tasks" });
  const timelineQ = useQuery({ queryKey:["cust-timeline",leadId], queryFn:()=>customerSuccessApi.getTimeline(leadId), enabled:tab==="timeline" });

  if (isLoading) return <div className="p-6"><LoadingState type="detail" /></div>;
  if (isError || !data) return <div className="p-6"><EmptyState icon="❌" title="Customer not found" description="This customer could not be loaded." /></div>;

  const { lead, health, contracts, invoices, quotes, activities, summary } = data;

  const heroMetrics = [
    { label:"Health Score", value:`${health?.score || 0}/100`, color: health?.score >= 65 ? "emerald" : health?.score >= 45 ? "amber" : "red" },
    { label:"Grade", value:health?.grade || "—", color: health?.grade === "A" || health?.grade === "B" ? "emerald" : health?.grade === "C" ? "amber" : "red" },
    { label:"Active Contracts", value:summary?.total_contracts || 0 },
    { label:"Total Invoiced", value:fmtCurrency(summary?.total_invoiced || 0) },
    { label:"Avg Satisfaction", value:summary?.avg_satisfaction ? `${summary.avg_satisfaction}/10` : "No data" },
  ];

  const contractColumns = [
    { key:"title", label:"Contract" },
    { key:"status", label:"Status", render:(r:any)=><StatusPill status={r.status}/> },
    { key:"total_value", label:"Value", align:"right" as const, render:(r:any)=><span className="font-semibold">{fmtCurrency(r.total_value||0)}</span> },
    { key:"monthly_value", label:"Monthly", align:"right" as const, render:(r:any)=>r.monthly_value?fmtCurrency(r.monthly_value):"—" },
    { key:"end_date", label:"Expires", render:(r:any)=>fmtDate(r.end_date) },
  ];

  const invoiceColumns = [
    { key:"invoice_number", label:"Invoice" },
    { key:"title", label:"Description" },
    { key:"status", label:"Status", render:(r:any)=><StatusPill status={r.status}/> },
    { key:"total_amount", label:"Amount", align:"right" as const, render:(r:any)=><span className="font-semibold">{fmtCurrency(r.total_amount||0)}</span> },
    { key:"issue_date", label:"Date", render:(r:any)=>fmtDate(r.issue_date) },
  ];

  return (
    <EntityShell
      backHref="/customers"
      backLabel="Customer Success"
      entityType="Customer"
      entityCode={lead.id?.slice(0,8).toUpperCase()}
      title={lead.name}
      subtitle={`${lead.company || ""}${lead.email ? ` · ${lead.email}` : ""}`}
      status={lead.status}
      heroMetrics={heroMetrics}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      onRefresh={() => refetch()}
    >
      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Health breakdown */}
          <div className="col-span-1">
            <SectionCard title="Health Breakdown" icon={<BarChart3 className="w-4 h-4"/>}>
              <div className="p-5 space-y-4">
                <HealthBar label="Contract Health" value={health?.contract_health || 0} />
                <HealthBar label="Payment Health" value={health?.payment_health || 0} />
                <HealthBar label="Maintenance" value={health?.maintenance_health || 0} />
                <HealthBar label="Satisfaction" value={health?.satisfaction_health || 0} />
                <HealthBar label="Engagement" value={health?.engagement_health || 0} />
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Renewal Risk</span>
                    <StatusPill status={health?.renewal_risk || "low"} size="sm" />
                  </div>
                  {health?.days_to_renewal != null && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-500">Days to Renewal</span>
                      <span className="font-semibold text-slate-900">{health.days_to_renewal}d</span>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Recent contracts + invoices */}
          <div className="col-span-2 space-y-5">
            <SectionCard title="Active Contracts" subtitle={`${contracts.length} contracts`} icon={<FileText className="w-4 h-4"/>}>
              <DataTable columns={contractColumns} data={contracts.slice(0,5)} empty="No contracts found" />
            </SectionCard>
            <SectionCard title="Recent Invoices" subtitle={`${invoices.length} invoices`} icon={<TrendingUp className="w-4 h-4"/>}>
              <DataTable columns={invoiceColumns} data={invoices.slice(0,5)} empty="No invoices found" />
            </SectionCard>
          </div>

          {/* Recent activity */}
          <div className="col-span-3">
            <SectionCard title="Recent Activity" subtitle={`${activities.length} events`} icon={<Activity className="w-4 h-4"/>}>
              <div className="divide-y divide-slate-50">
                {activities.slice(0,8).map((a:any) => (
                  <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-700 text-xs font-bold">{a.actor?.charAt(0) || "T"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-800 truncate">{a.description || a.action}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.actor} · {timeAgo(a.created_at)}</div>
                    </div>
                    {a.type && <span className="text-xs text-slate-400 flex-shrink-0">{a.type}</span>}
                  </div>
                ))}
                {activities.length === 0 && <EmptyState icon="📭" title="No activity yet" />}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* TIMELINE TAB */}
      {tab === "timeline" && (
        <SectionCard title="Event Timeline" subtitle="Full history of all events for this customer">
          <div className="p-4">
            {timelineQ.isLoading && <LoadingState rows={6} />}
            {!timelineQ.isLoading && (timelineQ.data?.events || []).length === 0 && (
              <EmptyState icon="📅" title="No timeline events" description="Events will appear as interactions are recorded." />
            )}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-0">
                {(timelineQ.data?.events || []).map((e:any, i:number) => {
                  const typeIcon: Record<string,string> = { activity:"💬", contract:"📋", invoice:"💰", meeting:"🤝", satisfaction:"⭐" };
                  return (
                    <div key={e.id || i} className="flex gap-4 pl-2 pb-4">
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-1 z-10 text-xs">
                        {typeIcon[e.type] || "📌"}
                      </div>
                      <div className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-slate-900">{e.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{e.type} · {fmtDate(e.date)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* CONTRACTS TAB */}
      {tab === "contracts" && (
        <SectionCard title="All Contracts" subtitle={`${contracts.length} total`}>
          <DataTable columns={contractColumns} data={contracts} empty="No contracts found for this customer" />
        </SectionCard>
      )}

      {/* INVOICES TAB */}
      {tab === "invoices" && (
        <SectionCard title="All Invoices" subtitle={`${invoices.length} total · ${fmtCurrency(summary?.total_invoiced||0)} invoiced`}>
          <DataTable columns={invoiceColumns} data={invoices} empty="No invoices found" />
        </SectionCard>
      )}

      {/* MEETINGS TAB */}
      {tab === "meetings" && (
        <SectionCard title="Meetings & Interactions">
          {meetingsQ.isLoading && <LoadingState rows={5} />}
          {!meetingsQ.isLoading && (
            <DataTable
              columns={[
                { key:"title", label:"Meeting" },
                { key:"meeting_type", label:"Type", render:(r:any)=><StatusPill status={r.meeting_type||"general"} dot={false}/> },
                { key:"status", label:"Status", render:(r:any)=><StatusPill status={r.status}/> },
                { key:"scheduled_at", label:"Date", render:(r:any)=>fmtDate(r.scheduled_at||r.held_at) },
                { key:"created_by", label:"By" },
              ]}
              data={meetingsQ.data?.items || []}
              empty="No meetings recorded"
            />
          )}
        </SectionCard>
      )}

      {/* SATISFACTION TAB */}
      {tab === "satisfaction" && (
        <div className="space-y-4">
          <SectionCard title="Satisfaction Surveys">
            {satQ.isLoading && <LoadingState rows={5} />}
            {!satQ.isLoading && (
              <DataTable
                columns={[
                  { key:"survey_type", label:"Type" },
                  { key:"overall_score", label:"Overall", align:"center" as const, render:(r:any)=>(
                    <span className={`text-lg font-bold ${r.overall_score>=8?"text-emerald-600":r.overall_score>=6?"text-amber-600":"text-red-600"}`}>{r.overall_score}/10</span>
                  )},
                  { key:"quality_score", label:"Quality", align:"center" as const, render:(r:any)=>r.quality_score?`${r.quality_score}/10`:"—" },
                  { key:"respondent_name", label:"Respondent" },
                  { key:"survey_date", label:"Date", render:(r:any)=>fmtDate(r.survey_date) },
                ]}
                data={satQ.data?.items || []}
                empty="No satisfaction surveys recorded"
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* TASKS TAB */}
      {tab === "tasks" && (
        <SectionCard title="Open Tasks">
          {tasksQ.isLoading && <LoadingState rows={5} />}
          {!tasksQ.isLoading && (
            <DataTable
              columns={[
                { key:"title", label:"Task" },
                { key:"task_type", label:"Type" },
                { key:"priority", label:"Priority", render:(r:any)=><StatusPill status={r.priority} dot={false}/> },
                { key:"status", label:"Status", render:(r:any)=><StatusPill status={r.status}/> },
                { key:"assigned_to", label:"Assigned To" },
                { key:"due_date", label:"Due", render:(r:any)=>fmtDate(r.due_date) },
              ]}
              data={tasksQ.data?.items || []}
              empty="No tasks found"
            />
          )}
        </SectionCard>
      )}

      {/* AI TAB */}
      {tab === "ai" && (
        <div className="grid grid-cols-2 gap-6">
          <SectionCard title="Health Analysis" icon={<BarChart3 className="w-4 h-4"/>}>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-amber-800 mb-2">Health Score: {health?.score}/100 (Grade {health?.grade})</div>
                <div className="text-sm text-amber-700 leading-relaxed">
                  This customer has {health?.signal === "green" ? "healthy engagement" : health?.signal === "yellow" ? "moderate risk signals" : "critical risk factors"}.
                  {health?.days_to_renewal != null ? ` Contract renewal in ${health.days_to_renewal} days.` : ""}
                  {health?.open_issues > 0 ? ` ${health.open_issues} open issue(s) require attention.` : " No open issues."}
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Indicators</div>
                {[
                  { label:"Renewal Risk", value:health?.renewal_risk, ok:health?.renewal_risk==="low" },
                  { label:"Engagement", value:health?.last_contact_days?`Last contact ${health.last_contact_days}d ago`:"Recent contact", ok:(health?.last_contact_days||0)<30 },
                  { label:"Payment Health", value:`${health?.payment_health||0}%`, ok:(health?.payment_health||0)>=70 },
                ].map((item,i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-800 font-medium">{item.value}</span>
                      {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500"/> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500"/>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="AI Recommendations" icon={<TrendingUp className="w-4 h-4"/>}>
            <div className="p-5 space-y-3">
              {health?.renewal_risk !== "low" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-amber-800 mb-1">🔔 Renewal Action Required</div>
                  <div className="text-xs text-amber-700">Initiate renewal conversation. Probability increases when started 90+ days before expiry.</div>
                </div>
              )}
              {(health?.satisfaction_health||0) < 70 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-orange-800 mb-1">📊 Satisfaction Below Target</div>
                  <div className="text-xs text-orange-700">Schedule a QBR meeting. Consider a satisfaction survey to identify improvement areas.</div>
                </div>
              )}
              {(health?.engagement_health||0) < 60 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-blue-800 mb-1">💬 Low Engagement Detected</div>
                  <div className="text-xs text-blue-700">No recent contact detected. Schedule a touchpoint call or site visit.</div>
                </div>
              )}
              {health?.score >= 75 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-emerald-800 mb-1">✅ Account in Good Health</div>
                  <div className="text-xs text-emerald-700">This account is performing well. Consider upsell opportunities for additional services.</div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </EntityShell>
  );
}
