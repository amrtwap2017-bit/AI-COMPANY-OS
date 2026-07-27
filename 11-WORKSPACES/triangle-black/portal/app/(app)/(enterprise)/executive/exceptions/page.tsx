"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutiveExceptions() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["ex-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: srRaw } = useQuery(["ex-srs"], () => authFetch("/api/v1/service-requests/").then(r => r.json()));
  const { data: pmRaw } = useQuery(["ex-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: notifRaw } = useQuery(["ex-notifs"], () => authFetch("/api/v1/notifications/").then(r => r.json()));

  const wos = toArr(woRaw);
  const srs = toArr(srRaw);
  const pms = toArr(pmRaw);
  const notifs = toArr(notifRaw);
  const now = new Date();

  const exceptions = [
    ...wos.filter((w: any) => w.priority === "critical" && w.status !== "completed")
      .map((w: any) => ({ ...w, _cat: "Critical WO", _severity: "critical", _msg: w.title, _path: `/operations/work-orders/${w.id}` })),
    ...wos.filter((w: any) => w.due_date && new Date(w.due_date) < now && w.status !== "completed")
      .map((w: any) => ({ ...w, _cat: "Overdue WO", _severity: "high", _msg: w.title, _path: `/operations/work-orders/${w.id}` })),
    ...pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < now)
      .map((p: any) => ({ ...p, _cat: "Overdue PM", _severity: "high", _msg: p.title, _path: "/maintenance/pm-plans" })),
    ...srs.filter((s: any) => s.status === "open" || s.status === "new")
      .slice(0, 5)
      .map((s: any) => ({ ...s, _cat: "Open SR", _severity: "medium", _msg: s.title, _path: "/operations/service-requests" })),
  ];

  const severityOrder: any = { critical: 0, high: 1, medium: 2, low: 3 };
  exceptions.sort((a: any, b: any) => (severityOrder[a._severity] ?? 3) - (severityOrder[b._severity] ?? 3));

  const unread = notifs.filter((n: any) => !n.is_read);

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Exception Management</div>
        <h1 className="text-3xl font-black text-primary">Platform Exceptions</h1>
        <p className="text-secondary mt-1">All items requiring immediate attention</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Exceptions", value: exceptions.length, color: "red" },
          { label: "Critical", value: exceptions.filter((e: any) => e._severity === "critical").length, color: "red" },
          { label: "High Priority", value: exceptions.filter((e: any) => e._severity === "high").length, color: "orange" },
          { label: "Unread Alerts", value: unread.length, color: "amber" },
        ].map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-secondary mb-1">{k.label}</div>
            <div className={`text-4xl font-black text-${k.color}-500`}>{k.value}</div>
          </div>
        ))}
      </div>

      {exceptions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 p-16 text-center">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-2xl font-bold text-emerald-600">Zero Exceptions</div>
          <div className="text-secondary mt-2">Platform is operating normally</div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-bold text-primary">{exceptions.length} exceptions requiring action</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {exceptions.map((ex: any, i: number) => {
              const sev = ex._severity;
              const colors: any = { critical: "red", high: "orange", medium: "amber", low: "blue" };
              const c = colors[sev] || "slate";
              return (
                <button key={i} onClick={() => router.push(ex._path)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-base-alt transition-colors text-left">
                  <span className={`w-2.5 h-2.5 rounded-full bg-${c}-500 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-primary truncate">{ex._msg}</div>
                    <div className="text-xs text-secondary mt-0.5">{ex._cat}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-${c}-100 text-${c}-700 flex-shrink-0`}>{sev.toUpperCase()}</span>
                  <span className="text-xs text-tertiary flex-shrink-0">→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
