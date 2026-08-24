"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: siteRaw, isLoading } = useQuery(["site-d", id], () => authFetch("/api/v1/sites-portal").then(r => (r as any).data ?? r), { enabled: !!id });
  const { data: assetRaw } = useQuery(["site-d-assets"], () => authFetch("/api/v1/assets/").then(r => (r as any).data ?? r));
  const sites = toArr(siteRaw); const assets = toArr(assetRaw);
  const site = sites.find((s: any) =>s.id===id)||sites[0];
  const siteAssets = assets.filter((a: any) =>a.site_id===id||a.site_id===(site?.id));
  if (!isLoading && !site) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty"><div className="tb-empty-icon">🏢</div><div className="tb-empty-title">Site not found</div>
        <button onClick={()=>router.push("/operations/sites")} className="tb-btn-primary mt-4">Back</button></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #221D1A 100%)"}}>
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
            {[{label:"Assets",value:siteAssets.length,color:"#5B7C8C"},{label:"Operational",value:siteAssets.filter((a: any) =>a.status==="Operational").length,color:"#547C4D"},{label:"In Fault",value:siteAssets.filter((a: any) =>a.status==="In Fault").length,color:siteAssets.filter((a: any) =>a.status==="In Fault").length>0?"#A84A3D":"#547C4D"},{label:"Categories",value:[...new Set(siteAssets.map((a: any) =>a.category).filter(Boolean))].length,color:"#8D7443"}].map((k: any, i: number) =>(
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
              {siteAssets.slice(0,8).map((a: any, i: number) =>{
                const sc={"Operational":"#547C4D","In Fault":"#A84A3D","Under Maintenance":"#B07A2A"}[a.status]||"#6D5F53";
                return <button key={i} onClick={()=>router.push("/maintenance/assets/"+a.id)} className="tb-action-item w-full justify-between"><div className="flex items-center gap-2 min-w-0"><span>⚙️</span><span className="text-sm text-secondary truncate">{a.name}</span></div><span className="tb-badge" style={{background:sc+"18",color:sc,fontSize:"0.5625rem"}}>{a.status}</span></button>;
              })}
            </div>
          </div>
        )}
        <div className="tb-section">
          <div className="space-y-2">
            {[{label:"All Sites",icon:"🏢",path:"/operations/sites"},{label:"Assets",icon:"⚙️",path:"/maintenance/assets"},{label:"Work Orders",icon:"🔧",path:"/operations/work-orders"}].map((a: any, i: number) =>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item w-full justify-start"><span>{a.icon}</span><span className="text-sm text-secondary">{a.label}</span></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
