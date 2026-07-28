"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: siteRaw, isLoading } = useQuery(["site-d", id], () => authFetch("/api/v1/sites-portal").then(r=>r.json()), { enabled: !!id });
  const { data: assetRaw } = useQuery(["site-d-assets"], () => authFetch("/api/v1/assets-portal").then(r=>r.json()));
  const sites = toArr(siteRaw); const assets = toArr(assetRaw);
  const site = sites.find(s=>s.id===id)||sites[0];
  const siteAssets = assets.filter(a=>a.site_id===id||a.site_id===(site?.id));
  if (!isLoading && !site) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty"><div className="tb-empty-icon">🏢</div><div className="tb-empty-title">Site not found</div>
        <button onClick={()=>router.push("/operations/sites")} className="tb-btn-primary mt-4">Back</button></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1820 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Operations · Sites</div>
              <h1 className="tb-hero-title">{site?.name||"Site"}</h1>
              <p className="tb-hero-description">{site?.location||site?.city||"—"} · {siteAssets.length} assets</p>
            </div>
            <button onClick={()=>router.push("/operations/sites")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Assets",value:siteAssets.length,color:"#60A5FA"},{label:"Operational",value:siteAssets.filter(a=>a.status==="Operational").length,color:"#34D399"},{label:"In Fault",value:siteAssets.filter(a=>a.status==="In Fault").length,color:siteAssets.filter(a=>a.status==="In Fault").length>0?"#F87171":"#34D399"},{label:"Categories",value:[...new Set(siteAssets.map(a=>a.category).filter(Boolean))].length,color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Site Details</div>
          <div className="space-y-1">
            {[["Name",site?.name||"—"],["Location",site?.location||site?.city||"—"],["Type",site?.type||site?.site_type||"Hotel"],["Status",site?.status||"Active"],["Site ID",site?.id||id]].map(([l,v],i)=>(
              <div key={i} className="tb-info-row"><span className="tb-info-label">{l}</span><span className="tb-info-value">{v}</span></div>
            ))}
          </div>
        </div>
        {siteAssets.length>0&&(
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Assets ({siteAssets.length})</div><button onClick={()=>router.push("/maintenance/assets")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {siteAssets.slice(0,8).map((a,i)=>{
                const sc={"Operational":"#34D399","In Fault":"#F87171","Under Maintenance":"#FBBF24"}[a.status]||"#94A3B8";
                return <button key={i} onClick={()=>router.push("/maintenance/assets/"+a.id)} className="tb-action-item w-full justify-between"><div className="flex items-center gap-2 min-w-0"><span>⚙️</span><span className="text-sm text-secondary truncate">{a.name}</span></div><span className="tb-badge" style={{background:sc+"18",color:sc,fontSize:"0.5625rem"}}>{a.status}</span></button>;
              })}
            </div>
          </div>
        )}
        <div className="tb-section">
          <div className="space-y-2">
            {[{label:"All Sites",icon:"🏢",path:"/operations/sites"},{label:"Assets",icon:"⚙️",path:"/maintenance/assets"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
