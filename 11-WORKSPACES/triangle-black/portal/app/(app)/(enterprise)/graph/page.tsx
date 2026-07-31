"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return d ? new Date(d).toLocaleDateString("en-GB") : "—"; } catch { return "—"; } };

const CRIT_COLOR: Record<string,string> = { critical:"#A84A3D", high:"#B07A2A", medium:"#B07A2A", low:"#547C4D" };
const STATUS_COLOR: Record<string,string> = { operational:"#547C4D", "In Fault":"#A84A3D", maintenance:"#B07A2A", offline:"#6D5F53", open:"#5B7C8C", in_progress:"#B07A2A", completed:"#547C4D", cancelled:"#6D5F53" };

export default function DigitalTwinGraphPage() {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedWO, setSelectedWO] = useState<string | null>(null);

  const { data: rawSites, isLoading: loadSites } = useQuery({
    queryKey: ["dt-sites"],
    queryFn: () => authFetch("/api/v1/sites-portal").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawAssets, isLoading: loadAssets } = useQuery({
    queryKey: ["dt-assets"],
    queryFn: () => authFetch("/api/v1/assets-portal").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawWOs, isLoading: loadWOs } = useQuery({
    queryKey: ["dt-wos"],
    queryFn: () => authFetch("/api/v1/work-orders/?limit=200").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: rawTechs, isLoading: loadTechs } = useQuery({
    queryKey: ["dt-techs"],
    queryFn: () => authFetch("/api/v1/technicians/").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: signals } = useQuery({
    queryKey: ["dt-signals"],
    queryFn: () => authFetch("/api/v1/ai/signals/summary").then(r => r.json()),
    staleTime: 30000,
  });

  const sites = toArr(rawSites);
  const allAssets = toArr(rawAssets).filter((a: any) => !a.deleted_at);
  const allWOs = toArr(rawWOs).filter((w: any) => !w.deleted_at);
  const allTechs = toArr(rawTechs).filter((t: any) => t.is_active);

  // ── CASCADING FILTERS ──────────────────────────────────────
  const assetsForSite = useMemo(() =>
    selectedSite ? allAssets.filter((a: any) => a.site_id === selectedSite) : allAssets,
    [allAssets, selectedSite]
  );

  const woForAsset = useMemo(() =>
    selectedAsset
      ? allWOs.filter((w: any) => w.asset_id === selectedAsset)
      : selectedSite
        ? allWOs.filter((w: any) => assetsForSite.some((a: any) => a.id === w.asset_id))
        : allWOs.slice(0, 30),
    [allWOs, selectedAsset, selectedSite, assetsForSite]
  );

  const techsForWO = useMemo(() => {
    const relevantWOs = selectedWO
      ? allWOs.filter((w: any) => w.id === selectedWO)
      : woForAsset;
    const techIds = new Set(relevantWOs.map((w: any) => w.technician_id).filter(Boolean));
    return allTechs.filter((t: any) => techIds.has(t.id));
  }, [allWOs, selectedWO, woForAsset, allTechs]);

  // ── KPIs ──────────────────────────────────────────────────
  const faultAssets = allAssets.filter((a: any) => a.status === "In Fault" || a.criticality === "critical").length;
  const openWOs = allWOs.filter((w: any) => ["open", "in_progress"].includes(w.status)).length;
  const faultRate = allAssets.length > 0 ? Math.round(faultAssets / allAssets.length * 100) : 0;
  const isLoading = loadSites || loadAssets || loadWOs || loadTechs;

  const COL_STYLE = {
    flex: 1, minWidth: 180, maxWidth: 280,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 12, overflow: "hidden",
    display: "flex", flexDirection: "column" as const
  };

  const COL_HEADER = {
    padding: "12px 14px", borderBottom: "1px solid var(--color-border)",
    background: "var(--color-surface-alt)",
    fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.08em", color: "var(--color-text-3)"
  };

  const ITEM_BASE = {
    padding: "10px 14px", cursor: "pointer",
    borderBottom: "1px solid var(--color-border)",
    transition: "background 0.1s"
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* ── HERO ────────────────────────────────────────── */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#B9924C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Digital Twin
              </div>
              <h1 className="tb-hero-title">Operations Graph</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Sites → Assets → Work Orders → Technicians · Live cascade view
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {signals?.critical > 0 && (
                <div style={{ padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "rgba(168,74,61,0.12)", color: "#A84A3D", border: "1px solid rgba(168,74,61,0.3)" }}>
                  🚨 {signals.critical} Critical Signals
                </div>
              )}
              {(selectedSite || selectedAsset || selectedWO) && (
                <button onClick={() => { setSelectedSite(null); setSelectedAsset(null); setSelectedWO(null); }}
                  style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  ✕ Clear Filter
                </button>
              )}
            </div>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{sites.length}</div>
                <div className="tb-hero-kpi-label">Hotel Sites</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{allAssets.length}</div>
                <div className="tb-hero-kpi-label">Assets</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: faultRate > 10 ? "#A84A3D" : "#547C4D" }}>
                  {faultRate}%
                </div>
                <div className="tb-hero-kpi-label">Fault Rate</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: openWOs > 0 ? "#B07A2A" : "#547C4D" }}>{openWOs}</div>
                <div className="tb-hero-kpi-label">Open WOs</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{allTechs.length}</div>
                <div className="tb-hero-kpi-label">Active Techs</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      {/* ── GRAPH CANVAS ────────────────────────────────── */}
      <div className="tb-canvas">

        {/* Filter breadcrumb */}
        {(selectedSite || selectedAsset || selectedWO) && (
          <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(185,146,76,0.06)", border: "1px solid rgba(185,146,76,0.18)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>Filtering:</span>
            {selectedSite && <span style={{ fontSize: 12, fontWeight: 700, color: "#B9924C" }}>Site: {sites.find((s: any) => s.id === selectedSite)?.name || selectedSite.slice(0, 12)}</span>}
            {selectedAsset && <><span style={{ color: "var(--color-text-3)" }}>→</span><span style={{ fontSize: 12, fontWeight: 700, color: "#B9924C" }}>Asset: {allAssets.find((a: any) => a.id === selectedAsset)?.name?.slice(0, 20) || selectedAsset.slice(0, 12)}</span></>}
            {selectedWO && <><span style={{ color: "var(--color-text-3)" }}>→</span><span style={{ fontSize: 12, fontWeight: 700, color: "#B9924C" }}>WO: {allWOs.find((w: any) => w.id === selectedWO)?.title?.slice(0, 20) || selectedWO.slice(0, 8)}</span></>}
          </div>
        )}

        {/* 4-Column Cascade */}
        <div style={{ display: "flex", gap: 0, alignItems: "flex-start", overflowX: "auto" }}>

          {/* ── COL 1: SITES ──────────────────────────── */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>
              🏨 Sites ({sites.length})
            </div>
            <div style={{ overflowY: "auto", maxHeight: 600 }}>
              {sites.map((site: any) => {
                const siteAssets = allAssets.filter((a: any) => a.site_id === site.id);
                const faultCount = siteAssets.filter((a: any) => a.status === "In Fault").length;
                const isSelected = selectedSite === site.id;
                return (
                  <div key={site.id}
                    onClick={() => { setSelectedSite(isSelected ? null : site.id); setSelectedAsset(null); setSelectedWO(null); }}
                    style={{
                      ...ITEM_BASE,
                      background: isSelected ? "rgba(185,146,76,0.08)" : undefined,
                      borderLeft: isSelected ? "3px solid #B9924C" : "3px solid transparent"
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-alt)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-1)" }}>{site.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{site.city || "Cairo"}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "rgba(91,124,140,0.12)", color: "#5B7C8C", fontWeight: 600 }}>
                        {siteAssets.length} assets
                      </span>
                      {faultCount > 0 && (
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "rgba(168,74,61,0.12)", color: "#A84A3D", fontWeight: 700 }}>
                          {faultCount} fault
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow connector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, flexShrink: 0, paddingTop: 60 }}>
            <div style={{ fontSize: 18, color: selectedSite ? "#B9924C" : "var(--color-border)" }}>→</div>
          </div>

          {/* ── COL 2: ASSETS ─────────────────────────── */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>
              ⚙️ Assets ({assetsForSite.length})
            </div>
            <div style={{ overflowY: "auto", maxHeight: 600 }}>
              {assetsForSite.length === 0 ? (
                <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--color-text-3)", textAlign: "center" }}>
                  Select a site
                </div>
              ) : assetsForSite.map((asset: any) => {
                const assetWOs = allWOs.filter((w: any) => w.asset_id === asset.id);
                const openCount = assetWOs.filter((w: any) => ["open", "in_progress"].includes(w.status)).length;
                const cc = CRIT_COLOR[asset.criticality] || "#6D5F53";
                const isSelected = selectedAsset === asset.id;
                return (
                  <div key={asset.id}
                    onClick={() => { setSelectedAsset(isSelected ? null : asset.id); setSelectedWO(null); }}
                    style={{
                      ...ITEM_BASE,
                      background: isSelected ? "rgba(185,146,76,0.08)" : undefined,
                      borderLeft: isSelected ? "3px solid #B9924C" : "3px solid transparent"
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-alt)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-text-1)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {asset.name}
                      </div>
                      {asset.criticality && (
                        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 20, background: `${cc}18`, color: cc, fontWeight: 700, flexShrink: 0, marginLeft: 4 }}>
                          {asset.criticality.toUpperCase().slice(0, 4)}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 2 }}>{asset.category}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {openCount > 0 && (
                        <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 20, background: "rgba(176,122,42,0.12)", color: "#B07A2A", fontWeight: 600 }}>
                          {openCount} WO
                        </span>
                      )}
                      <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 20, background: asset.status === "In Fault" ? "rgba(168,74,61,0.12)" : "rgba(84,124,77,0.12)", color: asset.status === "In Fault" ? "#A84A3D" : "#547C4D", fontWeight: 600 }}>
                        {asset.status || "operational"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow connector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, flexShrink: 0, paddingTop: 60 }}>
            <div style={{ fontSize: 18, color: selectedAsset ? "#B9924C" : "var(--color-border)" }}>→</div>
          </div>

          {/* ── COL 3: WORK ORDERS ────────────────────── */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>
              🔧 Work Orders ({woForAsset.length})
            </div>
            <div style={{ overflowY: "auto", maxHeight: 600 }}>
              {woForAsset.length === 0 ? (
                <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--color-text-3)", textAlign: "center" }}>
                  {selectedAsset ? "No WOs for this asset" : "Select an asset"}
                </div>
              ) : woForAsset.map((wo: any) => {
                const sc = STATUS_COLOR[wo.status] || "#6D5F53";
                const pc = CRIT_COLOR[wo.priority] || "#6D5F53";
                const isSelected = selectedWO === wo.id;
                return (
                  <div key={wo.id}
                    onClick={() => { setSelectedWO(isSelected ? null : wo.id); }}
                    style={{
                      ...ITEM_BASE,
                      background: isSelected ? "rgba(185,146,76,0.08)" : undefined,
                      borderLeft: isSelected ? "3px solid #B9924C" : `3px solid ${sc}30`
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-alt)"; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {wo.title || "Untitled"}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 20, background: `${sc}18`, color: sc, fontWeight: 600 }}>
                        {wo.status?.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 20, background: `${pc}18`, color: pc, fontWeight: 600 }}>
                        {wo.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--color-text-3)", marginTop: 3 }}>
                      Due: {fmtDate(wo.due_date)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow connector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, flexShrink: 0, paddingTop: 60 }}>
            <div style={{ fontSize: 18, color: selectedWO ? "#B9924C" : "var(--color-border)" }}>→</div>
          </div>

          {/* ── COL 4: TECHNICIANS ────────────────────── */}
          <div style={COL_STYLE}>
            <div style={COL_HEADER}>
              👷 Technicians ({techsForWO.length})
            </div>
            <div style={{ overflowY: "auto", maxHeight: 600 }}>
              {techsForWO.length === 0 ? (
                <div style={{ padding: "20px 14px", fontSize: 13, color: "var(--color-text-3)", textAlign: "center" }}>
                  {selectedWO ? "No technician assigned" : "Select a WO"}
                </div>
              ) : techsForWO.map((tech: any) => {
                const techWOs = allWOs.filter((w: any) => w.technician_id === tech.id);
                const activeCount = techWOs.filter((w: any) => ["open", "in_progress"].includes(w.status)).length;
                const load = tech.current_work_orders || 0;
                const max = tech.max_work_orders || 10;
                const pct = Math.min(100, Math.round(load / max * 100));
                return (
                  <div key={tech.id}
                    onClick={() => router.push(`/operations/technicians/${tech.id}`)}
                    style={{ ...ITEM_BASE, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--color-surface-alt)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#8F6F3D,#B9924C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#181614", flexShrink: 0 }}>
                        {(tech.name || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tech.name}</div>
                        <div style={{ fontSize: 10, color: "var(--color-text-3)" }}>{Array.isArray(tech.specializations) ? tech.specializations[0] : "—"}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "var(--color-text-3)" }}>Load</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: pct >= 90 ? "#A84A3D" : "#547C4D" }}>{load}/{max}</span>
                      </div>
                      <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? "#A84A3D" : pct >= 70 ? "#B07A2A" : "#547C4D", borderRadius: 2 }} />
                      </div>
                    </div>
                    {activeCount > 0 && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 20, background: "rgba(176,122,42,0.12)", color: "#B07A2A", fontWeight: 600, display: "inline-block", marginTop: 4 }}>
                        {activeCount} active WO
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── LEGEND ──────────────────────────────────── */}
        <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-3)" }}>Legend:</span>
          {[
            { label: "Critical", color: "#A84A3D" },
            { label: "High/Medium", color: "#B07A2A" },
            { label: "Operational", color: "#547C4D" },
            { label: "In Progress", color: "#5B7C8C" },
            { label: "Selected", color: "#B9924C" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 11, color: "var(--color-text-2)" }}>{l.label}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-3)" }}>
            Click any item to cascade-filter → Click again to deselect
          </span>
        </div>
      </div>
    </div>
  );
}
