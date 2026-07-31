"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.assets || [];

const CRIT_COLOR = {
  critical: "#A84A3D", high: "#B07A2A",
  medium: "#B07A2A", low: "#547C4D"
};

export default function AssetQRGalleryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterSite, setFilterSite] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterCrit, setFilterCrit] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["asset-qr-list"],
    queryFn: () => authFetch("/api/v1/qr/assets/list?limit=200").then(r => r.json()),
    staleTime: 60000,
  });

  const assets = toArr(raw);

  const sites = useMemo(() => ["all", ...Array.from(new Set(assets.map(a => a.site_name).filter(Boolean)))], [assets]);
  const cats = useMemo(() => ["all", ...Array.from(new Set(assets.map(a => a.category).filter(Boolean)))], [assets]);
  const crits = useMemo(() => ["all", ...Array.from(new Set(assets.map(a => a.criticality).filter(Boolean)))], [assets]);

  const filtered = useMemo(() => assets.filter(a => {
    const matchSearch = !search ||
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.location_description || "").toLowerCase().includes(search.toLowerCase());
    const matchSite = filterSite === "all" || a.site_name === filterSite;
    const matchCat = filterCat === "all" || a.category === filterCat;
    const matchCrit = filterCrit === "all" || a.criticality === filterCrit;
    return matchSearch && matchSite && matchCat && matchCrit;
  }), [assets, search, filterSite, filterCat, filterCrit]);

  const critical = assets.filter(a => a.criticality === "critical").length;
  const hasFilters = search || filterSite !== "all" || filterCat !== "all" || filterCrit !== "all";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Asset QR Codes</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Scan with phone to view asset details · Print sheets for site labeling
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                style={{
                  background: "none", border: "1px solid var(--color-border)",
                  color: "var(--color-text-2)", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600
                }}
              >
                {viewMode === "grid" ? "≡ List" : "⊞ Grid"}
              </button>
              <button
                onClick={() => router.push("/maintenance")}
                style={{
                  background: "none", border: "1px solid var(--color-border)",
                  color: "var(--color-text-2)", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600
                }}
              >
                ← Maintenance
              </button>
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{assets.length}</div>
                <div className="tb-hero-kpi-label">Total Assets</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{filtered.length}</div>
                <div className="tb-hero-kpi-label">Showing</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#A84A3D" }}>{critical}</div>
                <div className="tb-hero-kpi-label">Critical</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{sites.length - 1}</div>
                <div className="tb-hero-kpi-label">Sites</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="tb-canvas">

        {/* ── FILTER BAR ────────────────────────────────── */}
        <div className="tb-section" style={{ marginBottom: 20, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 14,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)", color: "var(--color-text-1)",
                minWidth: 200
              }}
            />
            <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {sites.map(s => <option key={s} value={s}>{s === "all" ? "All Sites" : s.split(" ").slice(0, 3).join(" ")}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {cats.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
            </select>
            <select value={filterCrit} onChange={e => setFilterCrit(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-1)" }}>
              {crits.map(c => <option key={c} value={c}>{c === "all" ? "All Criticality" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setFilterSite("all"); setFilterCat("all"); setFilterCrit("all"); }}
                style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-3)", fontWeight: 600 }}>
                ✕ Clear
              </button>
            )}
            <span style={{ fontSize: 12, color: "var(--color-text-3)", marginLeft: "auto" }}>
              {filtered.length} of {assets.length} assets
            </span>
          </div>
        </div>

        {/* ── LOADING ───────────────────────────────────── */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{ height: 280, background: "var(--color-surface-alt)", borderRadius: 14, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📱"
            title="No assets found"
            description={hasFilters ? "Try adjusting your filters" : "No assets with QR codes available"}
            action={hasFilters ? { label: "Clear Filters", onClick: () => { setSearch(""); setFilterSite("all"); setFilterCat("all"); setFilterCrit("all"); } } : undefined}
          />

        ) : viewMode === "grid" ? (
          /* ── GRID VIEW ──────────────────────────────── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
            {filtered.map((asset, i) => {
              const cc = CRIT_COLOR[asset.criticality] || "#6D5F53";
              return (
                <div key={asset.id || i}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14, overflow: "hidden",
                    transition: "box-shadow 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(185,146,76,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
                >
                  {/* QR Code Display */}
                  <div style={{ background: "#fff", padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 170, position: "relative" }}>
                    <img
                      src={`/api/v1/qr/asset/${asset.id}?size=140`}
                      alt={`QR for ${asset.name}`}
                      style={{ width: 140, height: 140, objectFit: "contain" }}
                      onError={e => { e.currentTarget.style.opacity = "0.3"; }}
                    />
                    {/* Criticality badge */}
                    {asset.criticality && asset.criticality !== "low" && (
                      <div style={{
                        position: "absolute", top: 8, right: 8,
                        padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                        background: `${cc}20`, color: cc, border: `1px solid ${cc}30`
                      }}>
                        {asset.criticality.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Asset Info */}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text-1)", marginBottom: 2 }}>
                      {(asset.name || "Asset").slice(0, 30)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)", marginBottom: 4 }}>
                      {asset.category || "—"} · {(asset.site_name || "—").split(" ").slice(0, 2).join(" ")}
                    </div>
                    {asset.location_description && (
                      <div style={{ fontSize: 11, color: "var(--color-text-3)", marginBottom: 8 }}>
                        📍 {asset.location_description.slice(0, 28)}
                      </div>
                    )}
                    {asset.status && (
                      <div style={{ marginBottom: 10 }}>
                        <StatusBadge status={asset.status} />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      <a
                        href={`/api/v1/qr/asset/${asset.id}`}
                        download={`qr-${asset.id}.png`}
                        style={{
                          textAlign: "center", padding: "7px 4px", borderRadius: 8,
                          fontSize: 11, fontWeight: 600, textDecoration: "none",
                          background: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                          color: "var(--color-text-2)"
                        }}
                      >
                        ↓ QR
                      </a>
                      <a
                        href={`/api/v1/qr/asset/${asset.id}/print-sheet`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          textAlign: "center", padding: "7px 4px", borderRadius: 8,
                          fontSize: 11, fontWeight: 600, textDecoration: "none",
                          background: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
                          color: "var(--color-text-2)"
                        }}
                      >
                        🖨 PDF
                      </a>
                      <button
                        onClick={() => router.push(`/asset/${asset.id}`)}
                        style={{
                          padding: "7px 4px", borderRadius: 8, fontSize: 11,
                          fontWeight: 700, cursor: "pointer", border: "none",
                          background: "rgba(84,124,77,0.12)", color: "#547C4D"
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          /* ── LIST VIEW ──────────────────────────────── */
          <div className="tb-section">
            <h2 className="tb-section-title">Asset QR Code List</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="tb-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="tb-table-header">
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>QR</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ASSET</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>CATEGORY</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>SITE</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>STATUS</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--color-text-3)" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset, i) => (
                    <tr key={asset.id || i} className="tb-table-row">
                      <td style={{ padding: "8px 14px" }}>
                        <img
                          src={`/api/v1/qr/asset/${asset.id}?size=60`}
                          alt="QR"
                          style={{ width: 52, height: 52, background: "#fff", borderRadius: 6, border: "1px solid var(--color-border)" }}
                        />
                      </td>
                      <td style={{ padding: "8px 14px" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{asset.name}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                          {asset.location_description?.slice(0, 40) || "—"}
                        </div>
                      </td>
                      <td style={{ padding: "8px 14px", fontSize: 13, color: "var(--color-text-2)" }}>{asset.category || "—"}</td>
                      <td style={{ padding: "8px 14px", fontSize: 13, color: "var(--color-text-2)" }}>
                        {asset.site_name?.split(" ").slice(0, 2).join(" ") || "—"}
                      </td>
                      <td style={{ padding: "8px 14px" }}>
                        <StatusBadge status={asset.status || "active"} />
                      </td>
                      <td style={{ padding: "8px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <a href={`/api/v1/qr/asset/${asset.id}`} download
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}>
                            ↓ QR
                          </a>
                          <a href={`/api/v1/qr/asset/${asset.id}/print-sheet`} target="_blank"
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-2)" }}>
                            🖨 PDF
                          </a>
                          <button onClick={() => router.push(`/asset/${asset.id}`)}
                            style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: "rgba(84,124,77,0.12)", color: "#547C4D" }}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BULK PRINT TIP ────────────────────────────── */}
        {filtered.length > 0 && (
          <div style={{
            marginTop: 20, padding: "14px 18px",
            background: "rgba(185,146,76,0.06)", border: "1px solid rgba(185,146,76,0.18)",
            borderRadius: 10, display: "flex", alignItems: "center", gap: 12
          }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-1)" }}>
                Print QR sheets for each asset
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                Click 🖨 PDF on any asset card to generate a printable A4 sheet with QR code + asset details.
                Laminate and attach to physical equipment.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
