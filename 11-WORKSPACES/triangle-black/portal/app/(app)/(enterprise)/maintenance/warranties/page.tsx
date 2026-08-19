"use client";
// @ts-nocheck
// Triangle Black — Warranty Tracking Dashboard
// Sprint-043: Asset Warranty Management
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

type Asset = {
  id: string; name: string; category: string; serial_number: string;
  warranty_expiry: string; status: string; manufacturer: string; model: string;
};

function getWarrantyStatus(expiry: string): "expired" | "expiring_soon" | "active" | "unknown" {
  if (!expiry) return "unknown";
  const exp = new Date(expiry);
  const now = new Date();
  if (isNaN(exp.getTime())) return "unknown";
  if (exp < now) return "expired";
  const days = (exp.getTime() - now.getTime()) / 86400000;
  if (days <= 90) return "expiring_soon";
  return "active";
}

const WARRANTY_COLOR: Record<string,string> = {
  expired:       "bg-red-100 text-red-800",
  expiring_soon: "bg-yellow-100 text-yellow-800",
  active:        "bg-green-100 text-green-800",
  unknown:       "bg-gray-100 text-gray-500",
};
const WARRANTY_LABEL: Record<string,string> = {
  expired:       "⛔ Expired",
  expiring_soon: "⚠️ Expiring Soon",
  active:        "✅ Active",
  unknown:       "❓ No Warranty",
};

function daysUntilExpiry(expiry: string): number | null {
  if (!expiry) return null;
  const exp = new Date(expiry);
  if (isNaN(exp.getTime())) return null;
  return Math.round((exp.getTime() - Date.now()) / 86400000);
}

export default function WarrantyTrackingPage() {
  const router = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [assets, setAssets]     = useState<Asset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all"|"expired"|"expiring_soon"|"active">("all");
  const [search, setSearch]     = useState("");
  const [sortBy, setSortBy]     = useState<"expiry"|"name"|"status">("expiry");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/assets/?limit=200")
      .then(r => r.json())
      .then((d: any) => {
        const items = Array.isArray(d) ? d : d?.results || d?.items || [];
        setAssets(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = assets
    .filter((a: any) => {
      const ws = getWarrantyStatus(a.warranty_expiry);
      const matchFilter = filter === "all" || ws === filter;
      const matchSearch = !search ||
        (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.serial_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.manufacturer || "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "expiry") {
        const da = a.warranty_expiry ? new Date(a.warranty_expiry).getTime() : Infinity;
        const db = b.warranty_expiry ? new Date(b.warranty_expiry).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === "name") return (a.name||"").localeCompare(b.name||"");
      return getWarrantyStatus(a.warranty_expiry).localeCompare(getWarrantyStatus(b.warranty_expiry));
    });

  const counts = {
    expired:       assets.filter((a: any) => getWarrantyStatus(a.warranty_expiry) === "expired").length,
    expiring_soon: assets.filter((a: any) => getWarrantyStatus(a.warranty_expiry) === "expiring_soon").length,
    active:        assets.filter((a: any) => getWarrantyStatus(a.warranty_expiry) === "active").length,
    unknown:       assets.filter((a: any) => getWarrantyStatus(a.warranty_expiry) === "unknown").length,
  };

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Warranty Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">
            {assets.length} assets · {counts.expired} expired · {counts.expiring_soon} expiring soon
          </p>
        </div>
        <button onClick={() => router.push("/maintenance/assets")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          🏭 All Assets
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"⛔ Expired",       value:counts.expired,       color:"bg-red-50 border-red-200",    tag:"expired" },
          { label:"⚠️ Expiring (90d)", value:counts.expiring_soon, color:"bg-yellow-50 border-yellow-200", tag:"expiring_soon" },
          { label:"✅ Active",         value:counts.active,         color:"bg-green-50 border-green-200", tag:"active" },
          { label:"❓ No Warranty",    value:counts.unknown,        color:"bg-gray-50 border-gray-200",  tag:"all" },
        ].map((k: any) => (
          <button key={k.label}
            onClick={() => setFilter(filter===k.tag ? "all" : k.tag as any)}
            className={`${k.color} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity ${filter===k.tag ? "ring-2 ring-gray-900" : ""}`}>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className="text-3xl font-bold text-[var(--color-text-1)] mt-1">{k.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input type="search" placeholder="Search assets..."
          value={search} onChange={(e: any) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
          <option value="expiry">Sort: Expiry Date</option>
          <option value="name">Sort: Asset Name</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Asset","Category","Serial No.","Manufacturer","Warranty Status","Expiry Date","Days Left"].map((h: any) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No assets found</td></tr>
            ) : filtered.map((asset: any) => {
              const ws = getWarrantyStatus(asset.warranty_expiry);
              const days = daysUntilExpiry(asset.warranty_expiry);
              return (
                <tr key={asset.id}
                  onClick={() => router.push(`/maintenance/assets/${asset.id}/history`)}
                  className={`hover:bg-gray-50 cursor-pointer ${ws==="expired" ? "bg-red-50" : ws==="expiring_soon" ? "bg-yellow-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-[var(--color-text-1)] max-w-40 truncate">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{asset.category || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.serial_number || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{asset.manufacturer || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(WARRANTY_COLOR as Record<string, any>)[ws]}`}>
                      {(WARRANTY_LABEL as Record<string, any>)[ws]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${ws==="expired" ? "text-red-600" : ws==="expiring_soon" ? "text-yellow-600" : "text-gray-700"}`}>
                    {fmtDate(asset.warranty_expiry)}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${days !== null && days < 0 ? "text-red-600" : days !== null && days <= 90 ? "text-yellow-600" : "text-green-600"}`}>
                    {days === null ? "—" : days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Showing {filtered.length} of {assets.length} assets
        </div>
      </div>
    </div>
  );
}
