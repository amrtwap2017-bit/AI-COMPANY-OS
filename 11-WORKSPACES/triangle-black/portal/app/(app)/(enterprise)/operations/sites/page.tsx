"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function SitesPage() {
  const router = useRouter();
  const { data: siteRaw, isLoading } = useQuery(["sites-list"], () => authFetch("/api/v1/sites-portal").then(r=>r.json()), { staleTime:60000, refetchOnWindowFocus:false });
  const { data: assetRaw } = useQuery(["sites-assets"], () => authFetch("/api/v1/assets-portal").then(r=>r.json()), { staleTime:60000, refetchOnWindowFocus:false });
  const sites = toArr(siteRaw); const assets = toArr(assetRaw);
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1820 100%)"}}>
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Operations</div>
          <h1 className="tb-hero-title">Sites</h1>
          <p className="tb-hero-description">{sites.length} sites · {assets.length} assets</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Sites",value:sites.length,color:"#F1F5F9"},{label:"Assets",value:assets.length,color:"#60A5FA"},{label:"Active",value:sites.filter(s=>s.status==="active"||!s.status).length,color:"#34D399"},{label:"Faulted",value:assets.filter(a=>a.status==="In Fault").length,color:assets.filter(a=>a.status==="In Fault").length>0?"#F87171":"#34D399"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-flex-between mb-4"><div className="text-sm text-secondary">{sites.length} sites</div><button onClick={()=>router.push("/maintenance/assets")} className="tb-section-link">Assets →</button></div>
          {isLoading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : sites.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">🏢</div><div className="tb-empty-title">No sites configured</div></div>
          : <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {sites.map((site,i)=>{
              const siteAssets=assets.filter(a=>a.site_id===site.id);
              return (
                <button key={i} onClick={()=>router.push("/operations/sites/"+site.id)} className="tb-section text-left hover:border-brand transition-colors">
                  <div className="flex items-center gap-3 mb-2"><span style={{fontSize:"1.5rem"}}>🏢</span><div><div className="text-sm font-bold text-primary">{site.name||"—"}</div><div className="text-xs text-tertiary">{site.location||site.city||"—"}</div></div></div>
                  <div className="text-xs text-tertiary">{siteAssets.length} assets</div>
                </button>
              );
            })}
          </div>}
        </div>
        <div className="tb-section">
          <div className="space-y-2">
            {[{label:"Assets",icon:"⚙️",path:"/maintenance/assets"},{label:"Asset Tree",icon:"🌳",path:"/maintenance/asset-tree"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
