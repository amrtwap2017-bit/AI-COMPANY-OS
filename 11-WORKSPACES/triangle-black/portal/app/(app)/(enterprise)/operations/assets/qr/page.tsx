"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.assets || [];

export default function AssetQRGalleryPage() {
  const router = useRouter();
  const [search,     setSearch]     = useState("");
  const [filterSite, setFilterSite] = useState("all");
  const [filterCat,  setFilterCat]  = useState("all");
  const [filterCrit, setFilterCrit] = useState("all");
  const [viewMode,   setViewMode]   = useState("grid");

  const { data: raw, isLoading } = useQuery({
    queryKey:["asset-qr-list"],
    queryFn:()=>authFetch("/api/v1/qr/assets/list?limit=200").then(r=>r.json()),
    staleTime:60000
  });
  const assets = toArr(raw);
  const sites  = useMemo(()=>["all",...Array.from(new Set(assets.map((a: any) =>a.site_name).filter(Boolean)))]        ,[assets]);
  const cats   = useMemo(()=>["all",...Array.from(new Set(assets.map((a: any) =>a.category).filter(Boolean)))]         ,[assets]);
  const crits  = useMemo(()=>["all",...Array.from(new Set(assets.map((a: any) =>a.criticality).filter(Boolean)))]      ,[assets]);

  const filtered = useMemo(()=>assets.filter((a: any) =>{
    const q = search.toLowerCase();
    return (!search||(a.name||"").toLowerCase().includes(q)||(a.category||"").toLowerCase().includes(q)||(a.location_description||"").toLowerCase().includes(q))
      &&(filterSite==="all"||a.site_name===filterSite)
      &&(filterCat==="all"||a.category===filterCat)
      &&(filterCrit==="all"||a.criticality===filterCrit);
  }),[assets,search,filterSite,filterCat,filterCrit]);

  const critical   = assets.filter((a: any) =>a.criticality==="critical").length;
  const hasFilters = search||filterSite!=="all"||filterCat!=="all"||filterCrit!=="all";
  const clearFilters=()=>{setSearch("");setFilterSite("all");setFilterCat("all");setFilterCrit("all");};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Operations · Assets</div>
              <h1 className="tb-hero-title">Asset QR Codes</h1>
              <p className="tb-hero-description">Scan with phone to view asset details · Print sheets for site labeling</p>
            </div>
            <div className="tb-action-bar">
              <button onClick={()=>setViewMode(viewMode==="grid"?"list":"grid")} className="tb-btn tb-btn-secondary">
                {viewMode==="grid"?"≡ List":"⊞ Grid"}
              </button>
              <button onClick={()=>router.push("/maintenance")} className="tb-btn tb-btn-secondary">← Maintenance</button>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{assets.length}</div><div className="tb-hero-kpi-label">Total Assets</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{filtered.length}</div><div className="tb-hero-kpi-label">Showing</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value text-danger">{critical}</div><div className="tb-hero-kpi-label">Critical</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{sites.length-1}</div><div className="tb-hero-kpi-label">Sites</div></div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section mb-4">
          <div className="flex gap-2.5 flex-wrap items-center">
            <input value={search} onChange={(e: any) =>setSearch(e.target.value)} placeholder="Search assets..."
              className="tb-input" style={{minWidth:"200px",width:"auto"}}/>
            <select value={filterSite} onChange={(e: any) =>setFilterSite(e.target.value)} className="tb-select" style={{width:"auto"}}>
              {sites.map((s: any) =><option key={s} value={s}>{s==="all"?"All Sites":s.split(" ").slice(0,3).join(" ")}</option>)}
            </select>
            <select value={filterCat} onChange={(e: any) =>setFilterCat(e.target.value)} className="tb-select" style={{width:"auto"}}>
              {cats.map((c: any) =><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
            </select>
            <select value={filterCrit} onChange={(e: any) =>setFilterCrit(e.target.value)} className="tb-select" style={{width:"auto"}}>
              {crits.map((c: any) =><option key={c} value={c}>{c==="all"?"All Criticality":c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            {hasFilters&&<button onClick={clearFilters} className="tb-btn tb-btn-ghost tb-btn-sm">✕ Clear</button>}
            <span className="text-xs text-tertiary ml-auto">{filtered.length} of {assets.length} assets</span>
          </div>
        </div>

        {isLoading ? (
          <div className="tb-grid-4">
            {[1,2,3,4,5,6,7,8].map((i: any) =><div key={i} className="tb-shimmer-block" style={{height:280}}/>)}
          </div>
        ) : filtered.length===0 ? (
          <EmptyState icon="📱" title="No assets found"
            description={hasFilters?"Try adjusting your filters":"No assets with QR codes available"}
            action={hasFilters?{label:"Clear Filters",onClick:clearFilters}:undefined}/>

        ) : viewMode==="grid" ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:16}}>
            {filtered.map((asset: any, i: any) =>(
              <div key={asset.id||i} className="tb-section tb-hover-lift overflow-hidden p-0">
                <div className="bg-white flex items-center justify-center relative" style={{minHeight:170,padding:16}}>
                  <img src={`/api/v1/qr/asset/${asset.id}?size=140`} alt={`QR for ${asset.name}`}
                    style={{width:140,height:140,objectFit:"contain"}}
                    onError={(e: any) =>{e.currentTarget.style.opacity="0.3";}}/>
                  {asset.criticality&&asset.criticality!=="low"&&(
                    <span className={`tb-badge tb-badge-${asset.criticality==="critical"?"danger":"warning"} absolute top-2 right-2`} style={{fontSize:"10px"}}>
                      {asset.criticality.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm text-primary mb-0.5">{(asset.name||"Asset").slice(0,30)}</div>
                  <div className="text-xs text-tertiary mb-1">{asset.category||"—"} · {(asset.site_name||"—").split(" ").slice(0,2).join(" ")}</div>
                  {asset.location_description&&<div className="text-xs text-tertiary mb-2">📍 {asset.location_description.slice(0,28)}</div>}
                  {asset.status&&<div className="mb-2"><StatusBadge status={asset.status}/></div>}
                  <div className="tb-grid-3 gap-1.5">
                    <a href={`/api/v1/qr/asset/${asset.id}`} download={`qr-${asset.id}.png`}
                      className="tb-btn tb-btn-secondary tb-btn-sm justify-center text-xs">↓ QR</a>
                    <a href={`/api/v1/qr/asset/${asset.id}/print-sheet`} target="_blank" rel="noopener noreferrer"
                      className="tb-btn tb-btn-secondary tb-btn-sm justify-center text-xs">🖨 PDF</a>
                    <button onClick={()=>router.push(`/asset/${asset.id}`)}
                      className="tb-btn tb-btn-primary tb-btn-sm justify-center text-xs">View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tb-section">
            <div className="tb-section-title">Asset QR Code List</div>
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>QR</th><th>Asset</th><th>Category</th><th>Site</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((asset: any, i: any) =>(
                    <tr key={asset.id||i}>
                      <td>
                        <img src={`/api/v1/qr/asset/${asset.id}?size=60`} alt="QR"
                          className="rounded-md border border-default bg-white" style={{width:52,height:52}}/>
                      </td>
                      <td>
                        <div className="font-semibold text-sm text-primary">{asset.name}</div>
                        <div className="text-xs text-tertiary">{asset.location_description?.slice(0,40)||"—"}</div>
                      </td>
                      <td className="text-sm text-secondary">{asset.category||"—"}</td>
                      <td className="text-sm text-secondary">{asset.site_name?.split(" ").slice(0,2).join(" ")||"—"}</td>
                      <td><StatusBadge status={asset.status||"active"}/></td>
                      <td>
                        <div className="flex gap-1.5">
                          <a href={`/api/v1/qr/asset/${asset.id}`} download className="tb-btn tb-btn-secondary tb-btn-sm">↓ QR</a>
                          <a href={`/api/v1/qr/asset/${asset.id}/print-sheet`} target="_blank" className="tb-btn tb-btn-secondary tb-btn-sm">🖨 PDF</a>
                          <button onClick={()=>router.push(`/asset/${asset.id}`)} className="tb-btn tb-btn-primary tb-btn-sm">View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length>0&&(
          <div className="tb-alert tb-alert-info">
            <span className="text-xl">💡</span>
            <div>
              <div className="font-semibold text-sm text-primary">Print QR sheets for each asset</div>
              <div className="text-xs text-tertiary mt-0.5">Click 🖨 PDF on any asset card to generate a printable A4 sheet with QR code + asset details. Laminate and attach to physical equipment.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
