"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };
const CRIT_COLOR = { critical: "#A84A3D", high: "#B07A2A", medium: "#B07A2A", low: "#547C4D" };

export default function Assets360Page() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterCrit, setFilterCrit] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: raw, isLoading } = useQuery({
    queryKey: ["assets-360"],
    queryFn: () => authFetch("/api/v1/assets-portal").then(r => r.json()),
    staleTime: 60000,
  });

  const assets = toArr(raw).filter(a => !a.deleted_at);
  const cats = useMemo(() => ["all", ...Array.from(new Set(assets.map(a => a.category).filter(Boolean)))], [assets]);
  const crits = useMemo(() => ["all", ...Array.from(new Set(assets.map(a => a.criticality).filter(Boolean)))], [assets]);

  const now = new Date();
  const overdueAssets = assets.filter(a => a.next_maintenance_date && new Date(a.next_maintenance_date) < now);
  const criticalCount = assets.filter(a => a.criticality === "critical").length;

  const filtered = useMemo(() => assets.filter(a => {
    const ms = !search || (a.name || "").toLowerCase().includes(search.toLowerCase()) || (a.location_description || "").toLowerCase().includes(search.toLowerCase());
    const mc = filterCat === "all" || a.category === filterCat;
    const mr = filterCrit === "all" || a.criticality === filterCrit;
    const mv = filterStatus === "all" || a.status === filterStatus;
    return ms && mc && mr && mv;
  }), [assets, search, filterCat, filterCrit, filterStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || filterCat !== "all" || filterCrit !== "all" || filterStatus !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Asset Portfolio 360°</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>Full asset registry · Maintenance status · Criticality overview</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/operations/assets/qr")}
                style={{ background: "linear-gradient(135deg,#8F6F3D,#B9924C)", color: "#181614", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                QR Codes
              </button>
              <button onClick={() => router.push("/maintenance")}
                style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                ← Maintenance
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{assets.length}</div><div className="tb-hero-kpi-label">Total Assets</div></div>
              <div className="tb-hero-kpi" onClick={() => { setFilterCrit("critical"); setPage(1); }} style={{ cursor: "pointer" }}>
                <div className="tb-hero-kpi-value" style={{ color: "#A84A3D" }}>{criticalCount}</div>
                <div className="tb-hero-kpi-label">Critical</div>
              </div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: "#B07A2A" }}>{overdueAssets.length}</div><div className="tb-hero-kpi-label">Overdue PM</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{cats.length - 1}</div><div className="tb-hero-kpi-label">Categories</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {overdueAssets.length > 0 && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(176,122,42,0.08)", border: "1px solid rgba(176,122,42,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#B07A2A" }}>{overdueAssets.length} assets overdue for preventive maintenance</span>
          </div>
        )}
        <div className="tb-section" style={{ marginBottom: 16, padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search assets..."
              style={{ padding: "8px 14px", borderRadius: 8, fontSize: 14, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)", minWidth: 200 }} />
            <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {cats.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
            </select>
            <select value={filterCrit} onChange={e => { setFilterCrit(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {crits.map(c => <option key={c} value={c}>{c === "all" ? "All Criticality" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            {["all", "operational", "maintenance", "offline"].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                className={filterStatus === s ? "tb-pill tb-pill--active" : "tb-pill"}>
                {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {hasFilters && <button onClick={() => { setSearch(""); setFilterCat("all"); setFilterCrit("all"); setFilterStatus("all"); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>✕ Clear</button>}
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-3)" }}>{filtered.length} of {assets.length}</span>
          </div>
        </div>
        <div className="tb-section">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="tb-section-title" style={{ margin: 0 }}>Asset Registry</h2>
          </div>
          {isLoading ? <TableSkeleton /> : filtered.length === 0 ? (
            <EmptyState icon="⚙️" title="No assets found" description={hasFilters ? "Try adjusting filters" : "No assets registered"} />
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="tb-table-header">
                      {["ASSET", "CATEGORY", "CRITICALITY", "STATUS", "LAST PM", "NEXT PM", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((a, i) => {
                      const cc = CRIT_COLOR[a.criticality] || "#6D5F53";
                      const isOverdue = a.next_maintenance_date && new Date(a.next_maintenance_date) < now;
                      return (
                        <tr key={a.id || i} className="tb-table-row"
                          style={{ borderLeft: isOverdue ? "3px solid rgba(176,122,42,0.4)" : a.criticality === "critical" ? "3px solid rgba(168,74,61,0.4)" : "3px solid transparent" }}>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 1 }}>{a.location_description?.slice(0, 40) || "—"}</div>
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--color-text-2)" }}>{a.category || "—"}</td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${cc}18`, color: cc, border: `1px solid ${cc}30` }}>
                              {a.criticality || "—"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}><StatusBadge status={a.status || "operational"} /></td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--color-text-3)" }}>{fmtDate(a.last_maintenance_date)}</td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: isOverdue ? "#B07A2A" : "var(--color-text-3)", fontWeight: isOverdue ? 700 : 400 }}>
                            {fmtDate(a.next_maintenance_date)}{isOverdue ? " ⚠" : ""}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <button onClick={() => router.push(`/asset/${a.id}`)}
                              style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(185,146,76,0.12)", color: "#B9924C" }}>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length > pageSize && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                  <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length}
                    pageSize={pageSize} onPageSize={(s) => { setPageSize(s); setPage(1); }} pageSizes={[10, 25, 50]} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
