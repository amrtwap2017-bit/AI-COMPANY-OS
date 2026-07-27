// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import Link from "next/link";
import { RoleBadge } from "@/components/ui";
import {
  PageWrapper, PageHeader, SectionCard,
  MetricStrip, StatusBadge, LoadingState, EmptyState
} from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return String(d).slice(0,10); } };

const QUICK_ACTIONS = [
  { label: "Work Orders",    href: "/operations/work-orders",  icon: "🔧", color: "bg-blue-600",    desc: "View & manage" },
  { label: "Service Req",    href: "/operations/service-requests", icon: "🎫", color: "bg-indigo-600", desc: "Open requests"  },
  { label: "Leads",          href: "/commercial/leads",        icon: "🎯", color: "bg-emerald-600", desc: "Sales pipeline" },
  { label: "Assets",         href: "/maintenance/assets",      icon: "⚙️",  color: "bg-slate-700",   desc: "Asset registry" },
  { label: "PM Plans",       href: "/maintenance/pm-plans",    icon: "📋", color: "bg-amber-600",   desc: "Preventive PM"  },
  { label: "Procurement",    href: "/supply-chain/purchase-requests", icon: "📦", color: "bg-orange-600", desc: "Purchase reqs" },
  { label: "Invoices",       href: "/commercial/invoices",     icon: "💰", color: "bg-purple-600",  desc: "Finance"       },
  { label: "Analytics",      href: "/analytics",               icon: "📊", color: "bg-teal-600",    desc: "Reports & KPIs" },
];

const PRIORITY_COLOR = {
  critical: "bg-red-100 text-red-800 border border-red-200",
  high:     "bg-orange-100 text-orange-800 border border-orange-200",
  medium:   "bg-amber-100 text-amber-800 border border-amber-200",
  low:      "bg-slate-100 text-slate-700 border border-slate-200",
};

const URGENCY_COLOR = {
  critical: "bg-red-100 text-red-800 border border-red-200",
  high:     "bg-orange-100 text-orange-800 border border-orange-200",
  medium:   "bg-amber-100 text-amber-800 border border-amber-200",
  low:      "bg-slate-100 text-slate-700 border border-slate-200",
};

function PriorityBadge({ value }) {
  const cls = PRIORITY_COLOR[value?.toLowerCase()] || PRIORITY_COLOR.low;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{value || "—"}</span>;
}

export default function WorkspacePage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  const { data: woData = [], isLoading: woLoading } = useQuery(
    ["workspace-workorders"],
    () => authFetch("/api/v1/work-orders/?limit=100").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const { data: srData = [], isLoading: srLoading } = useQuery(
    ["workspace-servicereqs"],
    () => authFetch("/api/v1/service-requests/?limit=20").then(r => r.json()),
    { refetchInterval: 60000 }
  );

  const { data: notifData = [], isLoading: notifLoading } = useQuery(
    ["workspace-notifications"],
    () => authFetch("/api/v1/notifications/?limit=8").then(r => r.json()),
    { refetchInterval: 30000 }
  );

  const { data: twinData = {}, isLoading: twinLoading } = useQuery(
    ["workspace-twin"],
    () => authFetch("/api/v1/twin/state").then(r => r.json()),
    { refetchInterval: 120000 }
  );

  const wos     = toArr(woData);
  const srs     = toArr(srData);
  const notifs  = toArr(notifData);
  const domains = twinData?.operational_domains || [];

  const openWOs     = wos.filter(w => w.status === "open").length;
  const criticalWOs = wos.filter(w => w.priority === "critical" && w.status !== "completed").length;
  const completedWOs = wos.filter(w => w.status === "completed").length;
  const twinScore   = twinData?.health_score ?? 0;

  const openSRs     = srs.filter(s => s.status === "open").length;
  const criticalSRs = srs.filter(s => s.urgency === "critical").length;

  const unreadNotifs = notifs.filter(n => !n.is_read).length;

  const recentWOs = wos
    .filter(w => w.status !== "completed")
    .sort((a,b) => {
      const rank = { critical:0, high:1, medium:2, low:3 };
      return (rank[a.priority]||2) - (rank[b.priority]||2);
    })
    .slice(0, 6);

  const openSRsList = srs.filter(s => s.status !== "resolved").slice(0, 5);

  const twinColor = twinScore >= 95 ? "text-emerald-600" : twinScore >= 80 ? "text-amber-600" : "text-red-600";
  const twinBg    = twinScore >= 95 ? "bg-emerald-50 border-emerald-200" : twinScore >= 80 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <PageWrapper>
      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting} 👋</h1>
          <RoleBadge className="mt-1" /><h1 className="hidden"</h1>
          <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
          <p className="text-sm text-slate-600 mt-1">Triangle Black Operations Platform</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${twinBg} ${twinColor}`}>
          <span className="text-lg">🔷</span>
          <div>
            <div className="text-xs font-medium opacity-70">Digital Twin</div>
            <div>{twinScore}/100 {twinData?.health_label}</div>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Open Work Orders", value: woLoading ? "…" : openWOs,      icon: "🔧", color: "bg-blue-600",    link: "/operations/work-orders"          },
          { label: "Critical Issues",  value: woLoading ? "…" : criticalWOs,  icon: "🚨", color: "bg-red-600",     link: "/operations/work-orders"          },
          { label: "Service Requests", value: srLoading ? "…" : openSRs,      icon: "🎫", color: "bg-indigo-600",  link: "/operations/service-requests"     },
          { label: "Completed WOs",    value: woLoading ? "…" : completedWOs, icon: "✅", color: "bg-emerald-600", link: "/operations/work-orders"          },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.link}>
            <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{kpi.icon}</span>
                <span className="text-xs text-slate-400 group-hover:text-blue-500">→</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── QUICK ACTIONS ───────────────────────────────── */}
      <SectionCard title="Quick Navigation">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl text-white ${action.color} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-800">{action.label}</div>
                  <div className="text-xs text-slate-400">{action.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* ── TWO COLUMN ROW ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">

        {/* Work Orders */}
        <SectionCard
          title={`Active Work Orders ${!woLoading ? `(${recentWOs.length})` : ""}`}
          action={<Link href="/operations/work-orders" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>}
        >
          {woLoading ? <LoadingState /> : recentWOs.length === 0 ? (
            <EmptyState title="No open work orders" subtitle="All work orders are completed" />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentWOs.map((wo) => (
                <div key={wo.id} className="flex items-center justify-between py-3 px-1 hover:bg-slate-50 rounded transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-slate-800 truncate">{wo.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{wo.type || "maintenance"} · {fmtDate(wo.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge value={wo.priority} />
                    <StatusBadge status={wo.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Service Requests */}
        <SectionCard
          title={`Service Requests ${!srLoading ? `(${openSRsList.length})` : ""}`}
          action={<Link href="/operations/service-requests" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>}
        >
          {srLoading ? <LoadingState /> : openSRsList.length === 0 ? (
            <EmptyState title="No open service requests" subtitle="All requests resolved" />
          ) : (
            <div className="divide-y divide-slate-100">
              {openSRsList.map((sr) => (
                <div key={sr.id} className="flex items-center justify-between py-3 px-1 hover:bg-slate-50 rounded transition-colors">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-slate-800 truncate">{sr.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sr.category || "General"} · {fmtDate(sr.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${URGENCY_COLOR[sr.urgency?.toLowerCase()] || URGENCY_COLOR.low}`}>
                      {sr.urgency || "medium"}
                    </span>
                    <StatusBadge status={sr.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">

        {/* Notifications */}
        <SectionCard
          title={`Notifications ${unreadNotifs > 0 ? `(${unreadNotifs} unread)` : ""}`}
          action={<Link href="/inbox" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>}
        >
          {notifLoading ? <LoadingState /> : notifs.length === 0 ? (
            <EmptyState title="No notifications" />
          ) : (
            <div className="divide-y divide-slate-100">
              {notifs.slice(0,6).map((n) => (
                <div key={n.id} className={`flex items-start gap-3 py-3 px-1 rounded transition-colors hover:bg-slate-50 ${!n.is_read ? "bg-blue-50/40" : ""}`}>
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? "bg-blue-600" : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{n.message}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                    n.type === "alert" ? "bg-red-100 text-red-700" :
                    n.type === "warning" ? "bg-amber-100 text-amber-700" :
                    n.type === "success" ? "bg-emerald-100 text-emerald-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{n.type || "info"}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Digital Twin Domains */}
        <SectionCard
          title="Platform Health"
          action={<Link href="/analytics" className="text-xs font-semibold text-blue-600 hover:underline">Full analytics →</Link>}
        >
          {twinLoading ? <LoadingState /> : (
            <div className="space-y-2">
              {domains.map((d) => {
                const hasIssue = (d.overdue > 0) || (d.critical_open > 0) || (d.below_min > 0);
                return (
                  <div key={d.domain} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${hasIssue ? "bg-amber-50 border border-amber-100" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${hasIssue ? "bg-amber-500" : "bg-emerald-500"}`} />
                      <span className="text-sm font-medium text-slate-700">{d.domain}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span><span className="font-semibold text-slate-700">{d.total}</span> total</span>
                      {d.overdue > 0 && <span className="text-amber-600 font-semibold">{d.overdue} overdue</span>}
                      {d.critical_open > 0 && <span className="text-red-600 font-semibold">{d.critical_open} critical</span>}
                      {d.below_min > 0 && <span className="text-orange-600 font-semibold">{d.below_min} low stock</span>}
                      {!hasIssue && <span className="text-emerald-600 font-semibold">✓ OK</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </PageWrapper>
  );
}
