"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

export default function AssetQRGalleryPage() {
  const router = useRouter();
  const [filterSite, setFilterSite] = useState("all");
  const [filterCat, setFilterCat] = useState("all");

  const { data: assets = [], isLoading } = useQuery(
    ["asset-qr-list"],
    () => authFetch("/api/v1/qr/assets/list?limit=100").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const sites = [...new Set(assets.map(a=>a.site_name).filter(Boolean))];
  const cats = [...new Set(assets.map(a=>a.category).filter(Boolean))];
  const filtered = assets.filter(a =>
    (filterSite==="all" || a.site_name===filterSite) &&
    (filterCat==="all" || a.category===filterCat)
  );

  const CRIT_COLOR = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"#547C4D"};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg,#221D1A 0%,#221D1A 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between mb-4">
            <div>
              <div className="text-label-upper text-emerald-400 mb-1">Operations</div>
              <h1 className="tb-hero-title">Asset QR Codes</h1>
              <p className="tb-hero-description">{assets.length} assets · Scan with phone to view details</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>router.push("/operations/maintenance")} className="tb-btn-secondary" style={{fontSize:"0.75rem"}}>
                📅 Maintenance →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {label:"Total Assets",value:assets.length,color:"#221D1A"},
              {label:"Showing",value:filtered.length,color:"#5B7C8C"},
              {label:"Sites",value:sites.length,color:"#547C4D"},
              {label:"Categories",value:cats.length,color:"#8D7443"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select className="tb-input" value={filterSite} onChange={e=>setFilterSite(e.target.value)} style={{minWidth:"180px"}}>
            <option value="all">All Sites</option>
            {sites.map(s=><option key={s} value={s}>{s.split(' ').slice(0,2).join(' ')}</option>)}
          </select>
          <select className="tb-input" value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{minWidth:"150px"}}>
            <option value="all">All Categories</option>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          {(filterSite!=="all"||filterCat!=="all") && (
            <button onClick={()=>{setFilterSite("all");setFilterCat("all");}} className="tb-btn-secondary" style={{fontSize:"0.75rem",padding:"6px 12px"}}>Reset</button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i=><div key={i} className="h-64 bg-base-alt rounded-2xl animate-pulse"/>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((asset,i)=>{
              const cc = CRIT_COLOR[asset.criticality] || "#6D5F53";
              return (
                <div key={i} className="rounded-2xl border border-border overflow-hidden bg-base-alt hover:border-brand/40 transition-all">
                  {/* QR Code Display */}
                  <div className="relative p-4 flex items-center justify-center bg-white" style={{minHeight:"160px"}}>
                    <img
                      src={asset.qr_url}
                      alt={`QR for ${asset.name}`}
                      className="w-32 h-32 object-contain"
                      onError={(e)=>{ e.currentTarget.style.display="none"; }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{background:cc+"20",color:cc,fontSize:"0.5rem"}}>
                        {(asset.criticality||"").toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {/* Asset Info */}
                  <div className="p-3">
                    <div className="text-sm font-bold text-primary truncate">{asset.name}</div>
                    <div className="text-xs text-tertiary">{asset.category} · {asset.site_name?.split(' ').slice(0,2).join(' ')}</div>
                    <div className="text-xs text-tertiary mt-0.5 truncate">{asset.location_description?.slice(0,30)||"—"}</div>
                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <a href={asset.qr_url} target="_blank" download
                         className="flex-1 text-center py-2 rounded-xl text-xs font-medium border border-border hover:bg-surface transition-colors"
                         style={{textDecoration:"none",color:"#6D5F53"}}>
                        ↓ QR
                      </a>
                      <a href={`/api/v1/qr/asset/${asset.id}/print-sheet`} target="_blank"
                         className="flex-1 text-center py-2 rounded-xl text-xs font-medium border border-border hover:bg-surface transition-colors"
                         style={{textDecoration:"none",color:"#6D5F53"}}>
                        🖨️ PDF
                      </a>
                      <button onClick={()=>router.push(`/asset/${asset.id}`)}
                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                        style={{background:"#547C4D18",color:"#547C4D"}}>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
