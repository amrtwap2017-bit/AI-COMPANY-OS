"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function MaintenanceHub() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["mh-assets"], () => authFetch("/api/v1/assets/").then(r => r.json()));
  const { data: pmRaw } = useQuery(["mh-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));
  const { data: woRaw } = useQuery(["mh-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));

  const assets = toArr(assetRaw);
  const pms = toArr(pmRaw);
  const wos = toArr(woRaw);
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86400000);
  const in30 = new Date(now.getTime() + 30 * 86400000);

  const overduePMs = pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) < now);
  const dueSoon = pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in7);
  const dueMonth = pms.filter((p: any) => p.next_due_ts && new Date(p.next_due_ts) >= now && new Date(p.next_due_ts) <= in30);
  const criticalAssets = assets.filter((a: any) => a.criticality === "critical");
  const maintenanceWOs = wos.filter((w: any) => w.type === "preventive" || w.type === "maintenance");
  const byCategory = assets.reduce((acc: any, a: any) => { acc[a.category || "Other"] = (acc[a.category || "Other"] || 0) + 1; return acc; }, {});

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Maintenance</div>
        <h1 className="text-page-title text-primary">Maintenance Hub</h1>
        <p className="text-secondary mt-1">Asset health, PM schedules, and maintenance workflow</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: assets.length, sub: `${criticalAssets.length} critical`, color: "blue", path: "/maintenance/assets" },
          { label: "Overdue PM Plans", value: overduePMs.length, sub: "require immediate action", color: overduePMs.length > 0 ? "red" : "emerald", path: "/maintenance/pm-plans" },
          { label: "Due This Week", value: dueSoon.length, sub: "PM plans", color: "amber", path: "/maintenance/pm-plans" },
          { label: "Due This Month", value: dueMonth.length, sub: "PM plans scheduled", color: "purple", path: "/schedule-review" },
        ].map((k, i) => (
          <button key={i} onClick={() => router.push(k.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue PM */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Overdue PM Plans</h2>
            <button onClick={() => router.push("/maintenance/pm-plans")} className="text-xs text-amber-500 hover:underline">All plans →</button>
          </div>
          {overduePMs.length === 0 ? (
            <div className="text-center py-8 text-tertiary text-sm">✅ No overdue PM plans</div>
          ) : overduePMs.map((p: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 mb-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-red-900 dark:text-red-300 truncate">{p.title}</div>
                <div className="text-xs text-red-500 mt-0.5">{p.frequency} · was due {fmtDate(p.next_due_ts)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Asset by category */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary">Assets by Category</h2>
            <button onClick={() => router.push("/maintenance/assets")} className="text-xs text-amber-500 hover:underline">All assets →</button>
          </div>
          <div className="space-y-3">
            {Object.entries(byCategory).sort(([,a]: any, [,b]: any) => b - a).map(([cat, count]: [string, any]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">{cat}</span>
                  <span className="font-bold text-primary">{count}</span>
                </div>
                <div className="w-full bg-base-alt rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(count / assets.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical assets */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary">Critical Assets</h2>
          <button onClick={() => router.push("/maintenance/assets")} className="text-xs text-amber-500 hover:underline">View all →</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {criticalAssets.slice(0, 6).map((a: any, i: number) => (
            <button key={i} onClick={() => router.push(`/maintenance/assets/${a.id}`)}
              className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl hover:shadow-md transition-all text-left">
              <div className="text-sm font-bold text-red-900 dark:text-red-300 truncate">{a.name}</div>
              <div className="text-xs text-red-500 mt-1">{a.category} · {a.location_description || "—"}</div>
              <div className="text-xs text-tertiary mt-1">Last service: {fmtDate(a.last_maintenance_date)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Asset Tree", icon: "🌳", path: "/maintenance/asset-tree" },
          { label: "PM Plans", icon: "📅", path: "/maintenance/pm-plans" },
          { label: "Work History", icon: "📋", path: "/maintenance/work-history" },
          { label: "QR Codes", icon: "📱", path: "/maintenance/qr-codes" },
        ].map((a, i) => (
          <button key={i} onClick={() => router.push(a.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-center hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-2xl mb-2">{a.icon}</div>
            <div className="text-sm font-bold text-primary">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
