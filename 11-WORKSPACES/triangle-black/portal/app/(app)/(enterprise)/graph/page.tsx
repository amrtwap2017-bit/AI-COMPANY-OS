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

const CRIT_COLOR: Record<string,string> = { critical:"var(--color-danger)", high:"var(--color-warning)", medium:"var(--color-warning)", low:"var(--color-success)" };
const STATUS_COLOR: Record<string,string> = { operational:"var(--color-success)", "In Fault":"var(--color-danger)", maintenance:"var(--color-warning)", offline:"var(--color-text-3)", open:"var(--color-info)", in_progress:"var(--color-warning)", completed:"var(--color-success)", cancelled:"var(--color-text-3)" };

export default function DigitalTwinGraphPage() {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedWO, setSelectedWO] = useState<string | null>(null);

  const { data: rawSites, isLoading: loadSites } = useQuery({ queryKey: ["dt-sites"], queryFn: () => authFetch("/api/v1/sites-portal").then(r => r.json()), staleTime: 60000 });
  const { data: rawAssets, isLoading: loadAssets } = useQuery({ queryKey: ["dt-assets"], queryFn: () => authFetch("/api/v1/assets-portal").then(r => r.json()), staleTime: 60000 });
  const { data: rawWOs, isLoading: loadWOs } = useQuery({ queryKey: ["dt-wos"], queryFn: () => authFetch("/api/v1/work-orders/?limit=200").then(r => r.json()), staleTime: 60000 });
  const { data: rawTechs, isLoading: loadTechs } = useQuery({ queryKey: ["dt-techs"], queryFn: () => authFetch("/api/v1/technicians/").then(r => r.json()), staleTime: 60000 });
  const { data: signals } = useQuery({ queryKey: ["dt-signals"], queryFn: () => authFetch("/api/v1/ai/signals/summary").then(r => r.json()), staleTime: 30000 });

  const sites = toArr(rawSites);
  const allAssets = toArr(rawAssets).filter((a: any) => !a.deleted_at);
  const allWOs = toArr(rawWOs).filter((w: any) => !w.deleted_at);
  const allTechs = toArr(rawTechs).filter((t: any) => t.is_active);

  const assetsForSite = useMemo(() =>
    selectedSite ? allAssets.filter((a: any) => a.site_id === selectedSite) : allAssets,
    [allAssets, selectedSite]);

  const woForAsset = useMemo(() =>
    selectedAsset ? allWOs.filter((w: any) => w.asset_id === selectedAsset)
    : selectedSite ? allWOs.filter((w: any) => assetsForSite.some((a: any) => a.id === w.asset_id))
    : allWOs.slice(0, 30),
    [allWOs, selectedAsset, selectedSite, assetsForSite]);

  const techsForWO = useMemo(() => {
    const relevantWOs = selectedWO ? allWOs.filter((w: any) => w.id === selectedWO) : woForAsset;
    const techIds = new Set(relevantWOs.map((w: any) => w.technician_id).filter(Boolean));
    return allTechs.filter((t: any) => techIds.has(t.id));
  }, [allWOs, selectedWO, woForAsset, allTechs]);

  const faultAssets = allAssets.filter((a: any) => a.status === "In Fault" || a.criticality === "critical").length;
  const openWOs = allWOs.filter((w: any) => ["open","in_progress"].includes(w.status)).length;
  const faultRate = allAssets.length > 0 ? Math.round(faultAssets / allAssets.length * 100) : 0;
  const isLoading = loadSites || loadAssets || loadWOs || loadTechs;

  const clearFilter = () => { setSelectedSite(null); setSelectedAsset(null); setSelectedWO(null); };

  return (
    <div className="min-h-screen bg-base">

      {/* HERO */}
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Digital Twin</div>
              <h1 className="tb-hero-title">Operations Graph</h1>
              <p className="tb-hero-description">Sites → Assets → Work Orders → Technicians · Live cascade view</p>
            </div>
            <div className="tb-action-bar">
              {signals?.critical > 0 && (
                <div className="tb-badge tb-badge-danger">🚨 {signals.critical} Critical Signals</div>
              )}
              {(selectedSite || selectedAsset || selectedWO) && (
                <button onClick={clearFilter} className="tb-btn tb-btn-secondary tb-btn-sm">
                  ✕ Clear Filter
                </button>
              )}
            </div>
          </div>

          <div className="tb-grid-5 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{sites.length}</div><div className="tb-hero-kpi-label">Hotel Sites</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{allAssets.length}</div><div className="tb-hero-kpi-label">Assets</div></div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color: faultRate > 10 ? "var(--color-danger)" : "var(--color-success)"}}>{faultRate}%</div>
                <div className="tb-hero-kpi-label">Fault Rate</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color: openWOs > 0 ? "var(--color-warning)" : "var(--color-success)"}}>{openWOs}</div>
                <div className="tb-hero-kpi-label">Open WOs</div>
              </div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)"}}>{allTechs.length}</div><div className="tb-hero-kpi-label">Active Techs</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">

        {/* Filter breadcrumb */}
        {(selectedSite || selectedAsset || selectedWO) && (
          <div className="flex items-center gap-2 flex-wrap p-3 bg-brand/5 border border-brand/20 rounded-lg">
            <span className="text-xs text-tertiary">Filtering:</span>
            {selectedSite && <span className="text-xs font-bold text-brand">Site: {sites.find((s: any) => s.id === selectedSite)?.name || selectedSite.slice(0,12)}</span>}
            {selectedAsset && <><span className="text-tertiary">→</span><span className="text-xs font-bold text-brand">Asset: {allAssets.find((a: any) => a.id === selectedAsset)?.name?.slice(0,20) || selectedAsset.slice(0,12)}</span></>}
            {selectedWO && <><span className="text-tertiary">→</span><span className="text-xs font-bold text-brand">WO: {allWOs.find((w: any) => w.id === selectedWO)?.title?.slice(0,20) || selectedWO.slice(0,8)}</span></>}
          </div>
        )}

        {/* 4-Column Cascade */}
        <div className="flex gap-0 items-start overflow-x-auto">

          {/* COL 1: SITES */}
          <div className="tb-section flex-1 min-w-[180px] max-w-[280px] overflow-hidden flex flex-col p-0">
            <div className="tb-section-title px-3.5 py-3 border-b border-default bg-surface-alt rounded-none" style={{borderRadius:0}}>🏨 Sites ({sites.length})</div>
            <div className="overflow-y-auto" style={{maxHeight:600}}>
              {sites.map((site: any) => {
                const siteAssets = allAssets.filter((a: any) => a.site_id === site.id);
                const faultCount = siteAssets.filter((a: any) => a.status === "In Fault").length;
                const isSelected = selectedSite === site.id;
                return (
                  <div key={site.id} onClick={() => { setSelectedSite(isSelected ? null : site.id); setSelectedAsset(null); setSelectedWO(null); }}
                    className={`tb-interactive p-3 border-b border-default cursor-pointer ${isSelected ? "bg-brand/8 border-l-2 border-l-brand" : "border-l-2 border-l-transparent"}`}>
                    <div className="font-semibold text-sm text-primary">{site.name}</div>
                    <div className="text-xs text-tertiary mt-0.5">{site.city || "Cairo"}</div>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      <span className="tb-badge tb-badge-info" style={{fontSize:"10px"}}>{siteAssets.length} assets</span>
                      {faultCount > 0 && <span className="tb-badge tb-badge-danger" style={{fontSize:"10px"}}>{faultCount} fault</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center w-8 flex-shrink-0 pt-14 text-lg" style={{color: selectedSite ? "var(--color-brand)" : "var(--color-border)"}}>→</div>

          {/* COL 2: ASSETS */}
          <div className="tb-section flex-1 min-w-[180px] max-w-[280px] overflow-hidden flex flex-col p-0">
            <div className="tb-section-title px-3.5 py-3 border-b border-default bg-surface-alt" style={{borderRadius:0}}>⚙️ Assets ({assetsForSite.length})</div>
            <div className="overflow-y-auto" style={{maxHeight:600}}>
              {assetsForSite.length === 0 ? (
                <div className="p-5 text-sm text-tertiary text-center">Select a site</div>
              ) : assetsForSite.map((asset: any) => {
                const assetWOs = allWOs.filter((w: any) => w.asset_id === asset.id);
                const openCount = assetWOs.filter((w: any) => ["open","in_progress"].includes(w.status)).length;
                const isSelected = selectedAsset === asset.id;
                return (
                  <div key={asset.id} onClick={() => { setSelectedAsset(isSelected ? null : asset.id); setSelectedWO(null); }}
                    className={`tb-interactive p-3 border-b border-default cursor-pointer ${isSelected ? "bg-brand/8 border-l-2 border-l-brand" : "border-l-2 border-l-transparent"}`}>
                    <div className="flex justify-between items-start gap-1">
                      <div className="font-semibold text-xs text-primary truncate flex-1">{asset.name}</div>
                      {asset.criticality && (
                        <span className={`tb-badge tb-badge-${asset.criticality === "critical" ? "danger" : asset.criticality === "high" ? "warning" : "neutral"}`} style={{fontSize:"9px"}}>
                          {asset.criticality.toUpperCase().slice(0,4)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-tertiary mt-0.5">{asset.category}</div>
                    <div className="flex gap-1 mt-1">
                      {openCount > 0 && <span className="tb-badge tb-badge-warning" style={{fontSize:"10px"}}>{openCount} WO</span>}
                      <span className={`tb-badge ${asset.status === "In Fault" ? "tb-badge-danger" : "tb-badge-success"}`} style={{fontSize:"10px"}}>
                        {asset.status || "operational"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center w-8 flex-shrink-0 pt-14 text-lg" style={{color: selectedAsset ? "var(--color-brand)" : "var(--color-border)"}}>→</div>

          {/* COL 3: WORK ORDERS */}
          <div className="tb-section flex-1 min-w-[180px] max-w-[280px] overflow-hidden flex flex-col p-0">
            <div className="tb-section-title px-3.5 py-3 border-b border-default bg-surface-alt" style={{borderRadius:0}}>🔧 Work Orders ({woForAsset.length})</div>
            <div className="overflow-y-auto" style={{maxHeight:600}}>
              {woForAsset.length === 0 ? (
                <div className="p-5 text-sm text-tertiary text-center">{selectedAsset ? "No WOs for this asset" : "Select an asset"}</div>
              ) : woForAsset.map((wo: any) => {
                const isSelected = selectedWO === wo.id;
                return (
                  <div key={wo.id} onClick={() => setSelectedWO(isSelected ? null : wo.id)}
                    className={`tb-interactive p-3 border-b border-default cursor-pointer ${isSelected ? "bg-brand/8 border-l-2 border-l-brand" : "border-l-2 border-l-transparent"}`}>
                    <div className="font-semibold text-xs text-primary truncate">{wo.title || "Untitled"}</div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      <span className={`tb-badge ${wo.status === "completed" ? "tb-badge-success" : wo.status === "in_progress" ? "tb-badge-warning" : "tb-badge-info"}`} style={{fontSize:"10px"}}>
                        {wo.status?.replace(/_/g," ")}
                      </span>
                      <span className={`tb-badge ${wo.priority === "critical" ? "tb-badge-danger" : wo.priority === "high" ? "tb-badge-warning" : "tb-badge-neutral"}`} style={{fontSize:"10px"}}>
                        {wo.priority}
                      </span>
                    </div>
                    <div className="text-xs text-tertiary mt-1">Due: {fmtDate(wo.due_date)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center w-8 flex-shrink-0 pt-14 text-lg" style={{color: selectedWO ? "var(--color-brand)" : "var(--color-border)"}}>→</div>

          {/* COL 4: TECHNICIANS */}
          <div className="tb-section flex-1 min-w-[180px] max-w-[280px] overflow-hidden flex flex-col p-0">
            <div className="tb-section-title px-3.5 py-3 border-b border-default bg-surface-alt" style={{borderRadius:0}}>👷 Technicians ({techsForWO.length})</div>
            <div className="overflow-y-auto" style={{maxHeight:600}}>
              {techsForWO.length === 0 ? (
                <div className="p-5 text-sm text-tertiary text-center">{selectedWO ? "No technician assigned" : "Select a WO"}</div>
              ) : techsForWO.map((tech: any) => {
                const techWOs = allWOs.filter((w: any) => w.technician_id === tech.id);
                const activeCount = techWOs.filter((w: any) => ["open","in_progress"].includes(w.status)).length;
                const load = tech.current_work_orders || 0;
                const max = tech.max_work_orders || 10;
                const pct = Math.min(100, Math.round(load / max * 100));
                return (
                  <div key={tech.id} onClick={() => router.push(`/operations/technicians/${tech.id}`)}
                    className="tb-interactive p-3 border-b border-default cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-xs font-black text-sidebar flex-shrink-0">
                        {(tech.name || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-primary truncate">{tech.name}</div>
                        <div className="text-xs text-tertiary">{Array.isArray(tech.specializations) ? tech.specializations[0] : "—"}</div>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-tertiary">Load</span>
                        <span className={`text-xs font-bold ${pct >= 90 ? "text-danger" : "text-success"}`}>{load}/{max}</span>
                      </div>
                      <div className="tb-progress">
                        <div className="tb-progress-bar" style={{width:`${pct}%`, background: pct >= 90 ? "var(--color-danger)" : pct >= 70 ? "var(--color-warning)" : "var(--color-success)"}} />
                      </div>
                    </div>
                    {activeCount > 0 && (
                      <span className="tb-badge tb-badge-warning mt-1" style={{fontSize:"10px"}}>{activeCount} active WO</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="tb-section flex gap-5 flex-wrap items-center">
          <span className="text-label text-tertiary">Legend:</span>
          {[{label:"Critical",cls:"tb-badge-danger"},{label:"High/Medium",cls:"tb-badge-warning"},{label:"Operational",cls:"tb-badge-success"},{label:"In Progress",cls:"tb-badge-info"},{label:"Selected",cls:"tb-badge-brand"}].map((l,i) => (
            <span key={i} className={`tb-badge ${l.cls}`}>{l.label}</span>
          ))}
          <span className="ml-auto text-xs text-tertiary">Click to cascade-filter · Click again to deselect</span>
        </div>
      </div>
    </div>
  );
}
