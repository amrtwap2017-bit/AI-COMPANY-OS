"use client";
// @ts-nocheck
// Triangle Black — Vendor Scorecard Dashboard
// Sprint-031: Vendor Performance KPIs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtEGP  = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtPct  = (n: any) => `${Number(n||0).toFixed(1)}%`;
const fmtScore = (n: any) => Number(n||0).toFixed(1);

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-10 text-right">{fmtScore(value)}</span>
    </div>
  );
}

const RISK_COLOR: Record<string, string> = {
  low:    "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high:   "bg-red-100 text-red-800",
};

export default function VendorScorecardPage() {
  const router = useRouter();
  const [mounted, setMounted]     = useState(false);
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [sortBy, setSortBy]       = useState("overall_score");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/vendor-scorecards/?limit=100")
      .then(r => r.data ?? r)
      .then((d: any) => {
        const items = d.results || d.items || (Array.isArray(d) ? d : []);
        setScorecards(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = scorecards
    .filter((s: any) => !search || (s.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.vendor_code || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => (Number(b[sortBy] || 0)) - (Number(a[sortBy] || 0)));

  const avg = (key: string) => scorecards.length > 0
    ? scorecards.reduce((sum: any, s: any) => sum + Number(s[key] || 0), 0) / scorecards.length
    : 0;

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Vendor Scorecards</h1>
          <p className="text-gray-500 text-sm mt-1">
            Performance KPIs for {scorecards.length} vendors
          </p>
        </div>
        <button onClick={() => router.push("/supply-chain/vendors")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          ← All Vendors
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Overall Score", value: fmtScore(avg("overall_score")), icon: "⭐", color: "bg-blue-50" },
          { label: "Avg On-Time %",     value: fmtPct(avg("on_time_pct")),     icon: "🚚", color: "bg-green-50" },
          { label: "Avg Quality Score", value: fmtScore(avg("quality_score")), icon: "✅", color: "bg-purple-50" },
          { label: "Total Vendors",     value: scorecards.length,              icon: "🏢", color: "bg-gray-50" },
        ].map((kpi: any) => (
          <div key={kpi.label} className={`${kpi.color} border border-gray-200 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{kpi.icon}</span>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{kpi.label}</p>
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-1)]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="search" placeholder="Search vendors..."
          value={search} onChange={(e: any) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
          <option value="overall_score">Sort: Overall Score</option>
          <option value="on_time_pct">Sort: On-Time %</option>
          <option value="quality_score">Sort: Quality</option>
          <option value="price_score">Sort: Price</option>
          <option value="total_pos">Sort: Total POs</option>
          <option value="total_spend">Sort: Total Spend</option>
        </select>
      </div>

      {/* Scorecards Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          No vendor scorecards found
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Vendor","Code","Risk","Total POs","Spend","On-Time","Quality","Price","Overall"].map((h: any) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/supply-chain/vendors/${s.vendor_id}`)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-1)] truncate max-w-40">{s.company_name}</p>
                    {s.preferred_flag && <span className="text-xs text-blue-500">⭐ Preferred</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.vendor_code}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(RISK_COLOR as Record<string, any>)[s.risk_level] || "bg-gray-100 text-gray-600"}`}>
                      {s.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.total_pos}</td>
                  <td className="px-4 py-3 text-gray-700">{fmtEGP(s.total_spend)}</td>
                  <td className="px-4 py-3 w-32"><ScoreBar value={s.on_time_pct} /></td>
                  <td className="px-4 py-3 w-32"><ScoreBar value={s.quality_score} /></td>
                  <td className="px-4 py-3 w-32"><ScoreBar value={s.price_score} /></td>
                  <td className="px-4 py-3 w-32">
                    <ScoreBar value={s.overall_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
