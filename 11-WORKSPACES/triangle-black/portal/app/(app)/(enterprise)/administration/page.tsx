"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function AdministrationPage() {
  const router = useRouter();
  const { data: twin } = useQuery(["adm-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));
  const { data: dash } = useQuery(["adm-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: techRaw } = useQuery(["adm-techs"], () => authFetch("/api/v1/technicians/").then(r => r.json()));
  const { data: notifRaw } = useQuery(["adm-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));
  const { data: autoStatus } = useQuery(["adm-auto"], () => authFetch("/api/v1/automation/status").then(r => r.json()));
  const { data: aiHealth } = useQuery(["adm-ai"], () => authFetch("/api/v1/ai/health").then(r => r.json()).catch(() => ({})));

  const techs = toArr(techRaw);
  const notifs = toArr(notifRaw);
  const d = dash || {};
  const score = twin?.health_score ?? 0;
  const pending = autoStatus?.pending_actions || {};
  const totalPending = Object.values(pending).reduce((s: number, v: any) => s + Number(v), 0);

  const sections = [
    { label: "Hotels & Sites", icon: "🏨", desc: "Manage properties and locations", path: "/administration/hotels", count: d.platform?.hotels ?? 0 },
    { label: "Users & Access", icon: "👥", desc: "User accounts and permissions", path: "/administration/users", count: techs.length },
    { label: "Technicians", icon: "👷", desc: "Field engineers and specialists", path: "/administration/technicians", count: techs.filter((t: any) => t.is_active).length },
    { label: "Notification Rules", icon: "🔔", desc: "Alert and notification settings", path: "/admin/notification-rules", count: notifs.length },
    { label: "Audit Trail", icon: "📋", desc: "System activity and change log", path: "/administration/audit", count: notifs.length },
    { label: "Platform Health", icon: "💊", desc: "System status and performance", path: "/administration/platform", count: null },
  ];

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Administration</div>
        <h1 className="text-3xl font-black text-primary">Platform Administration</h1>
        <p className="text-secondary mt-1">System configuration, users, and platform health</p>
      </div>

      {/* Platform health strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`col-span-1 rounded-2xl border p-5 text-center ${score >= 95 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <div className={`text-5xl font-black ${score >= 95 ? "text-emerald-500" : "text-amber-500"}`}>{score}</div>
          <div className="text-xs text-secondary mt-1">Twin Score</div>
        </div>
        {[
          { label: "Active Technicians", value: techs.filter((t: any) => t.is_active).length, color: "blue" },
          { label: "Total Notifications", value: notifs.length, color: "purple" },
          { label: "Pending Automations", value: totalPending, color: totalPending > 0 ? "amber" : "emerald" },
          { label: "AI Status", value: aiHealth?.status || "online", color: "emerald" },
        ].map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5 text-center">
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-secondary mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Admin sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sections.map((s, i) => (
          <button key={i} onClick={() => router.push(s.path)}
            className="bg-surface border border-border rounded-2xl p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{s.icon}</div>
              {s.count !== null && <span className="text-lg font-black text-tertiary">{s.count}</span>}
            </div>
            <div className="font-bold text-primary text-lg group-hover:text-amber-600 transition-colors">{s.label}</div>
            <div className="text-sm text-secondary mt-1">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Automation status */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Automation Engine Status</h2>
          <button onClick={() => router.push("/workflows/launcher")} className="text-xs text-amber-500 hover:underline">Manage →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(pending).map(([key, val]: [string, any]) => (
            <div key={key} className={`rounded-xl border p-3 text-center ${val === 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <div className={`text-2xl font-black ${val === 0 ? "text-emerald-500" : "text-amber-500"}`}>{val}</div>
              <div className="text-xs text-secondary mt-1 capitalize">{key.replace(/wf\d+_/, "").replace(/_/g, " ")}</div>
              <div className="text-xs font-bold mt-0.5">{val === 0 ? "✅ OK" : "⚠️ Pending"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Twin domains */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold text-primary mb-4">Digital Twin — All Domains</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(twin?.operational_domains ?? []).map((dom: any, i: number) => {
            const hasIssue = (dom.overdue ?? 0) > 0 || (dom.critical_open ?? 0) > 0 || (dom.below_min ?? 0) > 0;
            return (
              <div key={i} className={`rounded-xl border p-4 ${hasIssue ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                <div className="font-semibold text-sm">{dom.domain}</div>
                <div className="text-xl font-black mt-1">{dom.total ?? "—"}</div>
                <div className={`text-xs mt-1 ${hasIssue ? "text-amber-600" : "text-emerald-600"}`}>
                  {hasIssue ? "⚠️ Action needed" : "✅ Healthy"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
