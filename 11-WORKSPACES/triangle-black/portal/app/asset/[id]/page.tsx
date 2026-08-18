"use client";
// @ts-nocheck
// Triangle Black — Asset QR Landing Page
// Sprint-028: Scanned by technician in field

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const STATUS_COLOR: Record<string, string> = {
  operational: "bg-green-900 text-green-300",
  maintenance: "bg-yellow-900 text-yellow-300",
  offline:     "bg-red-900 text-red-300",
  decommissioned: "bg-[var(--color-surface)] text-gray-400",
};
const CRIT_COLOR: Record<string, string> = {
  critical: "text-red-400", high: "text-orange-400",
  medium: "text-yellow-400", low: "text-green-400",
};

export default function AssetScanPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [asset, setAsset]       = useState<any>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !id) return;
    Promise.all([
      tbFetch(`/api/v1/assets/${id}`).then(r => r.json()).catch(() => null),
      tbFetch(`/api/v1/work-orders/?limit=10`).then(r => r.json()).catch(() => []),
    ]).then(([a, wos]) => {
      setAsset(a);
      const items = Array.isArray(wos) ? wos : wos?.results || wos?.items || [];
      // Filter WOs linked to this asset if possible
      const linked = items.filter((w: any) => w.asset_id === id || w.asset === id);
      setWorkOrders(linked.length > 0 ? linked : items.slice(0, 3));
    }).finally(() => setLoading(false));
  }, [mounted, id]);

  if (!mounted || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!asset || asset.detail) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-white font-bold text-xl mb-2">Asset Not Found</p>
        <p className="text-gray-400 text-sm">This QR code may be outdated or the asset was removed.</p>
        <button onClick={() => router.push("/technician-portal/dashboard")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-8">
      {/* Header */}
      <div className="bg-[var(--color-bg)] border-b border-gray-800 px-4 py-5">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🏭</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">{asset.name}</h1>
            <p className="text-xs text-gray-400">{asset.category || "Asset"} · {asset.serial_number || "No serial"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[asset.status] || "bg-[var(--color-surface)] text-gray-400"}`}>
            {asset.status || "unknown"}
          </span>
          {asset.criticality && (
            <span className={`text-xs font-medium ${CRIT_COLOR[asset.criticality] || "text-gray-400"}`}>
              {asset.criticality} priority
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 max-w-sm mx-auto">
        {/* Asset Details */}
        <div className="bg-[var(--color-bg)] border border-gray-800 rounded-xl divide-y divide-gray-800">
          {[
            ["Location",    asset.location_description],
            ["Model",       asset.model],
            ["Manufacturer",asset.manufacturer],
            ["Next Maintenance", asset.next_maintenance_date ?
              new Date(asset.next_maintenance_date).toLocaleDateString("en-GB") : "—"],
            ["Warranty Until", asset.warranty_expiry ?
              new Date(asset.warranty_expiry).toLocaleDateString("en-GB") : "—"],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="flex justify-between px-4 py-3">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs text-white font-medium text-right max-w-40 truncate">{value}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/technician-portal/work-orders`)}
            className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-medium text-center transition-colors"
          >
            🔧 My Work Orders
          </button>
          <button
            onClick={() => router.push(`/operations/work-orders/new`)}
            className="bg-[var(--color-surface)] hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium text-center transition-colors"
          >
            ➕ New Work Order
          </button>
        </div>

        {/* Notes */}
        {asset.notes && (
          <div className="bg-[var(--color-bg)] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Notes</p>
            <p className="text-sm text-gray-300">{asset.notes}</p>
          </div>
        )}

        {/* Recent WOs */}
        {workOrders.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Recent Work Orders</p>
            <div className="space-y-2">
              {workOrders.slice(0, 3).map((wo: any) => (
                <button key={wo.id}
                  onClick={() => router.push(`/technician-portal/work-orders/${wo.id}`)}
                  className="w-full bg-[var(--color-bg)] border border-gray-800 rounded-xl px-4 py-3 text-left hover:border-gray-600 transition-colors">
                  <p className="text-sm font-medium text-white truncate">
                    {wo.title || wo.description || `WO-${wo.id?.slice(0,8)}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{wo.status?.replace("_"," ")} · {wo.priority}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-600">
          Triangle Black · Asset ID: {String(id).slice(0, 12)}...
        </p>
      </div>
    </div>
  );
}
