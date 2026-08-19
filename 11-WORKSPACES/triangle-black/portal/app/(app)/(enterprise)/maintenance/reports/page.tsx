"use client";
// @ts-nocheck
// Triangle Black — Maintenance Reports Dashboard
// Sprint-047: Downtime + Cost Reports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtNum = (n: any) => Number(n||0).toLocaleString();
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function MaintenanceReportsPage() {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [downtime, setDowntime]   = useState<any>(null);
  const [costs, setCosts]         = useState<any>(null);
  const [workItems, setWorkItems] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"overview"|"downtime"|"costs"|"work-items">("overview");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    Promise.all([
      tbFetch("/api/v1/maintenance/downtime").then(r => r.data ?? r).catch(() => ({})),
      tbFetch("/api/v1/maintenance/costs").then(r => r.data ?? r).catch(() => ({})),
      tbFetch("/api/v1/maintenance/work-items").then(r => r.data ?? r).catch(() => ({})),
      tbFetch("/api/v1/maintenance/dashboard").then(r => r.data ?? r).catch(() => ({})),
    ]).then(([dt, c, wi, dash]) => {
      setDowntime(dt);
      setCosts(c);
      setWorkItems(wi);
      setDashboard(dash);
    }).finally(() => setLoading(false));
  }, [mounted]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  const dtData = downtime?.downtime_records || downtime?.records || (Array.isArray(downtime) ? downtime : []);
  const costData = costs?.cost_records || costs?.costs || (Array.isArray(costs) ? costs : []);
  const wiData = workItems?.work_items || workItems?.items || (Array.isArray(workItems) ? workItems : []);

  const totalDowntimeHours = dtData.reduce((s: number, r: any) => s + Number(r.hours || r.duration_hours || 0), 0);
  const totalCost = costData.reduce((s: number, r: any) => s + Number(r.amount || r.cost || 0), 0);
  const completedWIs = wiData.filter((w: any) => w.status === "completed").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Maintenance Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Downtime · Costs · Work Items · Performance</p>
        </div>
        <button onClick={() => router.push("/maintenance")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          ← Maintenance
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:"Total Assets",       value:fmtNum(dashboard?.total_assets||0),       icon:"🏭", color:"bg-gray-50" },
          { label:"Open Work Orders",   value:fmtNum(dashboard?.open_work_orders||0),   icon:"🔧", color:"bg-orange-50" },
          { label:"Downtime Hours",     value:totalDowntimeHours.toFixed(1)+"h",        icon:"⏱️", color:"bg-red-50" },
          { label:"Maintenance Cost",   value:fmtEGP(totalCost),                        icon:"💰", color:"bg-blue-50" },
        ].map(k => (
          <div key={k.label} className={`${k.color} border border-gray-200 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{k.icon}</span>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
            <p className="text-xl font-bold text-[var(--color-text-1)]">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {[
            { key:"overview",    label:"Overview" },
            { key:"downtime",    label:`Downtime (${dtData.length})` },
            { key:"costs",       label:`Costs (${costData.length})` },
            { key:"work-items",  label:`Work Items (${wiData.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab===t.key ? "border-gray-900 text-[var(--color-text-1)]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-[var(--color-text-1)]">Maintenance Dashboard</h3>
            {[
              ["Total Assets",       dashboard?.total_assets || 0],
              ["Open Work Orders",   dashboard?.open_work_orders || 0],
              ["In Progress",        dashboard?.in_progress || 0],
              ["Critical",          dashboard?.critical || 0],
              ["Active PM Plans",    dashboard?.active_pm_plans || 0],
              ["SLA Health",         `${dashboard?.health || 0}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-50 py-1.5">
                <span className="text-gray-500">{label}</span>
                <span className="font-semibold text-[var(--color-text-1)]">{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-[var(--color-text-1)]">Quick Navigation</h3>
            <div className="space-y-3">
              {[
                { label:"PM Schedule",      path:"/maintenance/pm-schedule",  icon:"📅" },
                { label:"Asset History",    path:"/maintenance/assets",        icon:"🏭" },
                { label:"Warranty Tracking",path:"/maintenance/warranties",    icon:"🛡️" },
                { label:"Inspections",      path:"/engineering/inspections",   icon:"🔍" },
                { label:"Field Reports",    path:"/engineering/field-reports", icon:"📋" },
              ].map(item => (
                <button key={item.label} onClick={() => router.push(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 font-medium transition-colors text-left">
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Downtime Tab */}
      {activeTab === "downtime" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {dtData.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-2xl mb-2">⏱️</p>
              <p>No downtime records found</p>
              <p className="text-xs mt-1">Downtime is tracked when work orders affect asset availability</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Asset","Reason","Hours","Start","End","Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dtData.map((r: any, i: number) => (
                  <tr key={r.id||i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-1)]">{r.asset_node_id || r.asset || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{r.reason || r.cause || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{r.hours || r.duration_hours || "—"}h</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(r.start_time || r.started_at)}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(r.end_time || r.ended_at)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Costs Tab */}
      {activeTab === "costs" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {costData.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-2xl mb-2">💰</p>
              <p>No cost records found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Title","Type","Amount","Status","Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costData.map((r: any, i: number) => (
                  <tr key={r.id||i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-1)]">{r.title || r.description || "—"}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.cost_type || r.type || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{fmtEGP(r.amount || r.cost)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.status || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Work Items Tab */}
      {activeTab === "work-items" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {wiData.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-2xl mb-2">🔧</p>
              <p>No work items found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Title","Type","Status","Priority","Due"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wiData.map((r: any, i: number) => (
                  <tr key={r.id||i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-1)] max-w-48 truncate">{r.title || r.description || "—"}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.type || r.work_type || "—"}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.status || "—"}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.priority || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(r.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
