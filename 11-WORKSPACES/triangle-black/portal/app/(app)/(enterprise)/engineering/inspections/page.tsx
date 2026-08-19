"use client";
// @ts-nocheck
// Triangle Black — Engineering Inspections
// Sprint-045: Inspection Management
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtDT   = (d: any) => { try { return new Date(d).toLocaleString("en-GB", { dateStyle:"short", timeStyle:"short" }); } catch { return "—"; } };

const STATUS_COLOR: Record<string,string> = {
  passed:   "bg-green-100 text-green-800",
  failed:   "bg-red-100 text-red-800",
  pending:  "bg-yellow-100 text-yellow-800",
  scheduled:"bg-blue-100 text-blue-800",
  draft:    "bg-gray-100 text-gray-600",
};
const STATUS_ICON: Record<string,string> = {
  passed:"✅", failed:"❌", pending:"⏳", scheduled:"📅", draft:"📝",
};

export default function InspectionsPage() {
  const router = useRouter();
  const [mounted, setMounted]         = useState(false);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("all");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/inspections/?limit=100")
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : d?.results || d?.items || [];
        setInspections(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = inspections.filter(i => {
    const matchFilter = filter === "all" || i.status === filter;
    const matchSearch = !search ||
      (i.title || i.inspection_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.inspector || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    passed:    inspections.filter(i => i.status === "passed").length,
    failed:    inspections.filter(i => i.status === "failed").length,
    pending:   inspections.filter(i => i.status === "pending").length,
    scheduled: inspections.filter(i => i.status === "scheduled").length,
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
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Engineering Inspections</h1>
          <p className="text-gray-500 text-sm mt-1">
            {inspections.length} inspections · {counts.failed} failed · {counts.pending} pending
          </p>
        </div>
        <button onClick={() => router.push("/engineering")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
          ← Engineering
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"✅ Passed",    value:counts.passed,    color:"bg-green-50 border-green-200",  tag:"passed" },
          { label:"❌ Failed",    value:counts.failed,    color:"bg-red-50 border-red-200",      tag:"failed" },
          { label:"⏳ Pending",   value:counts.pending,   color:"bg-yellow-50 border-yellow-200",tag:"pending" },
          { label:"📅 Scheduled", value:counts.scheduled, color:"bg-blue-50 border-blue-200",   tag:"scheduled" },
        ].map(k => (
          <button key={k.label}
            onClick={() => setFilter(filter===k.tag ? "all" : k.tag)}
            className={`${k.color} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity ${filter===k.tag ? "ring-2 ring-gray-900" : ""}`}>
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className="text-3xl font-bold text-[var(--color-text-1)] mt-1">{k.value}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <input type="search" placeholder="Search by title, location, inspector..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          {inspections.length === 0 ? "No inspections recorded yet" : "No inspections match filter"}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Status","Inspection","Type","Location","Inspector","Date","Score"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((insp: any) => (
                <tr key={insp.id} className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/engineering/inspections/${insp.id}`)}>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[insp.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_ICON[insp.status] || "📋"} {insp.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text-1)] max-w-48 truncate">
                    {insp.title || insp.inspection_type || `INS-${insp.id?.slice(0,8)}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{insp.inspection_type || insp.type || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{insp.location || insp.area || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{insp.inspector || insp.inspector_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(insp.inspection_date || insp.created_at)}</td>
                  <td className="px-4 py-3">
                    {insp.score != null ? (
                      <span className={`font-semibold ${Number(insp.score) >= 80 ? "text-green-600" : Number(insp.score) >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                        {insp.score}%
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Showing {filtered.length} of {inspections.length} inspections
          </div>
        </div>
      )}
    </div>
  );
}
