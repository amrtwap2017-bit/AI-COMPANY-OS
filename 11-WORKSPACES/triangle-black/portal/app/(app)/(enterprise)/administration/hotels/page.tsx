"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function HotelsPage() {
  const router = useRouter();
  const { data: siteRaw, isLoading } = useQuery(["hotels-sites"], () => authFetch("/api/v1/sites-portal").then(r=>r.json()));
  const { data: assetRaw } = useQuery(["hotels-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const sites = toArr(siteRaw); const assets = toArr(assetRaw);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Administration</div>
          <h1 className="tb-hero-title">Hotels & Sites</h1>
          <p className="tb-hero-description">{sites.length} sites · {assets.length} assets registered</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Sites",value:sites.length,color:"#221D1A"},{label:"Assets",value:assets.length,color:"#5B7C8C"},{label:"Active",value:sites.filter(s=>s.status==="active"||!s.status).length,color:"#547C4D"},{label:"Categories",value:[...new Set(assets.map(a=>a.category).filter(Boolean))].length,color:"#8D7443"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-flex-between mb-4"><div className="text-sm text-secondary">{sites.length} sites</div><button onClick={()=>router.push("/operations/sites")} className="tb-section-link">Sites →</button></div>
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : sites.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">🏨</div><div className="tb-empty-title">No sites configured</div></div>
          : <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {sites.map((site,i)=>{
              const siteAssets = assets.filter(a=>a.site_id===site.id);
              return (
                <button key={i} onClick={()=>router.push("/administration/hotels/"+site.id)} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="flex items-center gap-3 mb-2"><span style={{fontSize:"1.5rem"}}>🏨</span><div><div className="text-sm font-bold text-primary">{site.name||"—"}</div><div className="text-xs text-tertiary">{site.location||site.city||"Egypt"}</div></div></div>
                  <div className="text-xs text-tertiary">{siteAssets.length} assets</div>
                </button>
              );
            })}
          </div>}
        </div>
      </div>
    </div>
  );
}
