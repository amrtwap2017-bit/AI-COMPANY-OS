// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import {
  PageWrapper, PageHeader, SectionCard,
  StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

const PRIORITY_COLOR = {
  critical: "bg-red-100 text-red-800 border border-red-200",
  high:     "bg-orange-100 text-orange-800 border border-orange-200",
  medium:   "bg-amber-100 text-amber-800 border border-amber-200",
  low:      "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function MyDayPage() {
  const today = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });

  const { data: woRaw = [], isLoading } = useQuery(
    ["my-day-workorders"],
    () => authFetch("/api/v1/work-orders/?limit=50").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const wos = toArr(woRaw);
  const open      = wos.filter(w => w.status === "open");
  const inProg    = wos.filter(w => w.status === "in_progress");
  const completed = wos.filter(w => w.status === "completed");
  const critical  = wos.filter(w => w.priority === "critical" && w.status !== "completed");

  const active = [...inProg, ...open]
    .sort((a,b) => { const r={critical:0,high:1,medium:2,low:3}; return (r[a.priority]||2)-(r[b.priority]||2); })
    .slice(0, 15);

  return (
    <PageWrapper>
      <PageHeader
        title="My Day"
        subtitle={today}
        breadcrumbs={[{label:"Workspace",href:"/workspace"},{label:"My Day"}]}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Open",        value: open.length,      icon: "📂", color: "text-blue-600"    },
          { label: "In Progress", value: inProg.length,    icon: "⚙️",  color: "text-indigo-600"  },
          { label: "Critical",    value: critical.length,  icon: "🚨", color: "text-red-600"     },
          { label: "Completed",   value: completed.length, icon: "✅", color: "text-emerald-600" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{isLoading ? "…" : k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <SectionCard
        title="Active Work Orders"
        action={<Link href="/operations/work-orders" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>}
      >
        {isLoading ? <LoadingState /> : active.length === 0 ? (
          <EmptyState title="No active work orders" subtitle="All work orders are completed for today" />
        ) : (
          <div className="divide-y divide-slate-100">
            {active.map((wo) => (
              <div key={wo.id} className="flex items-center justify-between py-3 px-1 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-semibold text-slate-900 truncate">{wo.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {wo.type || "maintenance"} · {fmtDate(wo.created_at)}
                    {wo.location ? ` · ${wo.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${PRIORITY_COLOR[wo.priority?.toLowerCase()] || PRIORITY_COLOR.low}`}>
                    {wo.priority || "medium"}
                  </span>
                  <StatusBadge status={wo.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
