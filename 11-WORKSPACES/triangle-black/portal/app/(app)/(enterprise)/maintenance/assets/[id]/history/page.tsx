"use client";
// @ts-nocheck
// Triangle Black — Asset Maintenance History
// Sprint-038: Asset History Portal

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtDateTime = (d: any) => { try { return new Date(d).toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" }); } catch { return "—"; } };

const STATUS_COLOR: Record<string,string> = {
  open:        "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed:   "bg-green-100 text-green-800",
  cancelled:   "bg-gray-100 text-gray-500",
};
const PRIORITY_COLOR: Record<string,string> = {
  critical:"text-red-600", high:"text-orange-500", medium:"text-yellow-500", low:"text-green-500",
};
const CRIT_BG: Record<string,string> = {
  critical:"bg-red-50 border-red-200", high:"bg-orange-50 border-orange-200",
  medium:"bg-yellow-50 border-yellow-200", low:"bg-green-50 border-green-200",
};

export default function AssetHistoryPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [asset, setAsset]       = useState<any>(null);
  const [pmPlans, setPmPlans]   = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"wos"|"pm"|"info">("info");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    Promise.all([
      tbFetch(`/api/v1/assets/${id}`).then(r => r.json()).catch(() => null),
      tbFetch(`/api/v1/maintenance/pm-plans/`).then(r => r.json()).catch(() => []),
      tbFetch(`/api/v1/work-orders/?limit=200`).then(r => r.json()).catch(() => []),
    ]).then(([a, plans, wos]) => {
      setAsset(a);
      const plist = Array.isArray(plans) ? plans : plans?.plans || [];
      const allPmPlans = plist.filter((p:any) => p.asset_node_id === id || p.asset_node_id === String(id));
      setPmPlans(allPmPlans);
      const items = Array.isArray(wos) ? wos : wos?.results || wos?.items || [];
      const assetWOs = items.filter((w:any) => w.asset_id === id || w.asset === id || w.asset_id === String(id));
      setWorkOrders(assetWOs.length > 0 ? assetWOs : items.slice(0, 10));
    }).finally(() => setLoading(false));
  }, [mounted, id]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!asset || asset.detail) return (
    <div className="p-8 text-center text-gray-500">
      <p className="text-2xl mb-2">🏭</p><p>Asset not found</p>
      <button onClick={() => router.push("/maintenance/assets")}
        className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Assets</button>
    </div>
  );

  const completedWOs = workOrders.filter((w:any) => w.status === "completed").length;
  const overdueWOs   = workOrders.filter((w:any) => w.status !== "completed" && w.due_date && new Date(w.due_date) < new Date()).length;
  const overduePMs   = pmPlans.filter((p:any) => p.next_due_ts && new Date(p.next_due_ts) < new Date() && p.status !== "completed").length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/maintenance/assets")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
            ← Assets
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{asset.category}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{asset.serial_number || "No serial"}</span>
            {asset.criticality && (
              <>
                <span className="text-gray-300">·</span>
                <span className={`text-xs font-medium ${PRIORITY_COLOR[asset.criticality] || "text-gray-500"}`}>
                  {asset.criticality} criticality
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/operations/work-orders/new`)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            + Work Order
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Status",        value:asset.status || "unknown",   color:"bg-gray-50" },
          { label:"Work Orders",   value:workOrders.length,           color:"bg-blue-50" },
          { label:"Completed WOs", value:completedWOs,                color:"bg-green-50" },
          { label:"PM Plans",      value:pmPlans.length || "—",       color:"bg-purple-50" },
        ].map(k => (
          <div key={k.label} className={`${k.color} border border-gray-200 rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1 capitalize">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Alert banners */}
      {(overdueWOs > 0 || overduePMs > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700">Attention Required</p>
            <p className="text-sm text-red-600">
              {overdueWOs > 0 && `${overdueWOs} overdue work order(s)`}
              {overdueWOs > 0 && overduePMs > 0 && " · "}
              {overduePMs > 0 && `${overduePMs} overdue PM plan(s)`}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {[
            { key:"info", label:"Asset Info" },
            { key:"wos",  label:`Work Orders (${workOrders.length})` },
            { key:"pm",   label:`PM Plans (${pmPlans.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Asset Details</h3>
            {[
              ["Name",             asset.name],
              ["Category",         asset.category],
              ["Manufacturer",     asset.manufacturer],
              ["Model",            asset.model],
              ["Serial Number",    asset.serial_number],
              ["Location",         asset.location_description],
              ["Status",           asset.status],
              ["Criticality",      asset.criticality],
              ["Installation Date",fmtDate(asset.installation_date)],
              ["Warranty Until",   fmtDate(asset.warranty_expiry)],
            ].filter(([,v])=>v).map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-50 py-1.5">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-900 text-right max-w-48 truncate capitalize">{value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Maintenance Schedule</h3>
            {[
              ["Last Maintenance",  fmtDate(asset.last_maintenance_date)],
              ["Next Maintenance",  fmtDate(asset.next_maintenance_date)],
              ["Service Frequency", asset.service_frequency],
            ].filter(([,v])=>v && v !== "—").map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-50 py-1.5">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
            {asset.notes && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{asset.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Work Orders */}
      {tab === "wos" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {workOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No work orders found for this asset</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Title","Priority","Status","Due Date","Created"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workOrders.map((wo:any) => (
                  <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/operations/work-orders/${wo.id}`)}>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-48 truncate">
                      {wo.title || wo.description || `WO-${wo.id?.slice(0,8)}`}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${PRIORITY_COLOR[wo.priority] || "text-gray-500"}`}>
                      {wo.priority || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[wo.status] || "bg-gray-100 text-gray-600"}`}>
                        {wo.status?.replace("_"," ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(wo.due_date)}</td>
                    <td className="px-4 py-3 text-gray-400">{fmtDate(wo.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: PM Plans */}
      {tab === "pm" && (
        <div className="space-y-3">
          {pmPlans.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
              No PM plans linked to this asset node
            </div>
          ) : (
            pmPlans.map((plan:any) => {
              const isOverdue = plan.next_due_ts && new Date(plan.next_due_ts) < new Date() && plan.status !== "completed";
              return (
                <div key={plan.id}
                  onClick={() => router.push(`/maintenance/pm-plans/${plan.id}`)}
                  className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all ${isOverdue ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{plan.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.plan_type} · {plan.frequency} · {plan.owner}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                        {fmtDate(plan.next_due_ts)}
                      </p>
                      <span className={`text-xs ${plan.status === "completed" ? "text-green-600" : isOverdue ? "text-red-600" : "text-gray-500"}`}>
                        {isOverdue ? "⚠️ Overdue" : plan.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
