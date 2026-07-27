"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const STATUS_COLOR = {
  Operational:"#34D399", "In Fault":"#F87171", "Under Maintenance":"#FBBF24", Inactive:"#94A3B8"
};
const CAT_ICON = {
  HVAC:"❄️", Electrical:"⚡", Plumbing:"🔧", Elevator:"🛗", Fire:"🔥",
  Generator:"⚡", Pump:"💧", Lighting:"💡", BMS:"🖥️"
};

export default function AssetTreePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [expandedCats, setExpandedCats] = useState({});

  const { data: assetRaw, isLoading } = useQuery(
    ["tree-assets"],
    () => authFetch("/api/v1/assets/").then(r => r.json()),
    { refetchInterval: 60000 }
  );
  const { data: woRaw } = useQuery(["tree-wos"], () => authFetch("/api/v1/work-orders/").then(r => r.json()));
  const { data: pmRaw } = useQuery(["tree-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r => r.json()));

  const assets = toArr(assetRaw);
  const wos    = toArr(woRaw);
  const pms    = toArr(pmRaw);
  const cats   = [...new Set(assets.map(a => a.category).filter(Boolean))];

  const operational    = assets.filter(a => a.status === "Operational").length;
  const faulted        = assets.filter(a => a.status === "In Fault").length;
  const underMaint     = assets.filter(a => a.status === "Under Maintenance").length;

  const enriched = assets.map(asset => {
    const activeWOs = wos.filter(w => w.asset_id === asset.id && w.status !== "completed");
    const assetPMs  = pms.filter(p => p.asset_node_id === asset.id);
    return { ...asset, active_wos: activeWOs.length, pm_count: assetPMs.length };
  });

  const filtered = enriched.filter(a => {
    const matchSearch = !search ||
      (a.name||"").toLowerCase().includes(search.toLowerCase()) ||
      (a.asset_tag||"").toLowerCase().includes(search.toLowerCase()) ||
      (a.location||"").toLowerCase().includes(search.toLowerCase()) ||
      (a.category||"").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchCat    = filterCat    === "all" || a.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  const groupedByCat = cats.reduce((acc, cat) => {
    acc[cat] = filtered.filter(a => a.category === cat);
    return acc;
  }, {});

  const toggleCat = (cat) => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1A1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Maintenance</div>
              <h1 className="tb-hero-title">Asset Tree</h1>
              <p className="tb-hero-description">{assets.length} assets · {operational} operational · {faulted} faulted · {cats.length} categories</p>
            </div>
            <button onClick={() => router.push("/maintenance/assets")} className="tb-btn-primary">
              All Assets →
            </button>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
            {[
              { label:"Total",          value:assets.length,  color:"#F1F5F9" },
              { label:"Operational",    value:operational,    color:"#34D399" },
              { label:"In Fault",       value:faulted,        color:faulted>0?"#F87171":"#34D399" },
              { label:"Under Maint",    value:underMaint,     color:"#FBBF24" },
              { label:"Categories",     value:cats.length,    color:"#A78BFA" },
            ].map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-flex-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-secondary text-sm">🔍</span>
              <input
                className="tb-search flex-1"
                placeholder="Search assets by name, tag, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all","Operational","In Fault","Under Maintenance"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`tb-pill ${filterStatus === s ? "tb-pill--active" : ""}`}>
                  {s === "all" ? "All Status" : s}
                  {s !== "all" && <span className="ml-1 opacity-60">{assets.filter(a => a.status === s).length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tree View */}
        <div className="tb-section">
          <div className="tb-flex-between mb-4">
            <div className="text-sm text-secondary">{filtered.length} assets in {Object.keys(groupedByCat).filter(c => groupedByCat[c].length > 0).length} categories</div>
            <button onClick={() => setExpandedCats(cats.reduce((a,c)=>({...a,[c]:true}),{}))} className="tb-section-link text-xs">Expand All →</button>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          ) : (
            <div className="space-y-3">
              {cats.filter(cat => (groupedByCat[cat]||[]).length > 0).map(cat => {
                const catAssets   = groupedByCat[cat] || [];
                const isExpanded  = expandedCats[cat] !== false;
                const catFaulted  = catAssets.filter(a => a.status === "In Fault").length;
                const catIcon     = CAT_ICON[cat] || "⚙️";
                return (
                  <div key={cat} className="border border-border rounded-xl overflow-hidden">
                    <button onClick={() => toggleCat(cat)}
                      className="w-full flex items-center gap-3 p-3 bg-base-alt hover:bg-surface transition-colors text-left">
                      <span style={{fontSize:"1.125rem"}}>{catIcon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-primary">{cat}</div>
                        <div className="text-xs text-tertiary">{catAssets.length} assets</div>
                      </div>
                      {catFaulted > 0 && (
                        <span className="tb-badge tb-badge--danger" style={{fontSize:"0.5625rem"}}>{catFaulted} fault</span>
                      )}
                      <span className="text-tertiary text-xs ml-2">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="divide-y divide-border">
                        {catAssets.map((asset, i) => {
                          const sc = STATUS_COLOR[asset.status] || "#94A3B8";
                          return (
                            <button key={i}
                              onClick={() => router.push(`/maintenance/assets/${asset.id}`)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-alt transition-colors text-left">
                              <div style={{width:3,height:32,borderRadius:2,background:sc,flexShrink:0}}/>
                              <div className="w-8 h-8 rounded-lg bg-base-alt flex items-center justify-center text-xs flex-shrink-0">
                                {catIcon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-primary truncate">{asset.name||"—"}</div>
                                <div className="text-xs text-tertiary truncate">{asset.location||asset.asset_tag||"—"}</div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {asset.active_wos > 0 && (
                                  <span className="tb-badge tb-badge--warning" style={{fontSize:"0.5rem"}}>{asset.active_wos} WO</span>
                                )}
                                {asset.pm_count > 0 && (
                                  <span className="tb-badge" style={{fontSize:"0.5rem",color:"#A78BFA"}}>{asset.pm_count} PM</span>
                                )}
                                <span className="tb-badge" style={{background:`${sc}18`,color:sc,border:`1px solid ${sc}30`,fontSize:"0.5625rem"}}>
                                  {asset.status||"—"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
