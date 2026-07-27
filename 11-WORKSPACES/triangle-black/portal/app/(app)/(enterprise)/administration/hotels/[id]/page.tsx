"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
export default function HotelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: siteRaw, isLoading } = useQuery(["hotel-d", id], () => authFetch("/api/v1/sites/").then(r=>r.json()));
  const { data: assetRaw } = useQuery(["hotel-d-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: ctRaw } = useQuery(["hotel-d-cts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const sites = toArr(siteRaw); const assets = toArr(assetRaw); const contracts = toArr(ctRaw);
  const site = sites.find(s=>s.id===id)||sites[0];
  const siteAssets = assets.filter(a=>a.site_id===(site?.id||id));
  const faulted = siteAssets.filter(a=>a.status==="In Fault");
  if (!isLoading && !site) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty"><div className="tb-empty-icon">🏨</div><div className="tb-empty-title">Hotel not found</div>
        <button onClick={()=>router.push("/administration/hotels")} className="tb-btn-primary mt-4">Back</button></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #0F172A 0%, #0E1B2E 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Administration · Hotels</div>
              <h1 className="tb-hero-title">{site?.name||"Hotel"}</h1>
              <p className="tb-hero-description">{site?.location||"Egypt"} · {siteAssets.length} assets · {faulted.length} faults</p>
            </div>
            <button onClick={()=>router.push("/administration/hotels")} className="tb-btn-secondary">← Back</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total Assets",value:siteAssets.length,color:"#60A5FA"},{label:"Operational",value:siteAssets.filter(a=>a.status==="Operational").length,color:"#34D399"},{label:"In Fault",value:faulted.length,color:faulted.length>0?"#F87171":"#34D399"},{label:"Active Contracts",value:contracts.filter(c=>c.status==="active").length,color:"#A78BFA"}].map((k,i)=>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="tb-section">
            <div className="tb-section-title">Hotel Information</div>
            <div className="space-y-1">
              {[["Name",site?.name||"—"],["Location",site?.location||"—"],["City",site?.city||"—"],["Type",site?.type||"Hotel"],["Status",site?.status||"Active"],["Site ID",site?.id||id]].map(([l,v],i)=>(
                <div key={i} className="tb-info-row"><span className="tb-info-label">{l}</span><span className="tb-info-value">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="tb-section">
            <div className="tb-section-header"><div className="tb-section-title" style={{marginBottom:0}}>Assets</div><button onClick={()=>router.push("/maintenance/assets")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {siteAssets.slice(0,6).map((a,i)=>{
                const sc={"Operational":"#34D399","In Fault":"#F87171","Under Maintenance":"#FBBF24"}[a.status]||"#94A3B8";
                return <button key={i} onClick={()=>router.push("/maintenance/assets/"+a.id)} className="tb-action-item w-full justify-between"><div className="flex items-center gap-2 min-w-0"><span>⚙️</span><span className="text-sm text-secondary truncate">{a.name}</span></div><span className="tb-badge" style={{background:sc+"18",color:sc,fontSize:"0.5rem"}}>{a.status}</span></button>;
              })}
              {siteAssets.length===0&&<div className="text-xs text-tertiary text-center py-4">No assets registered for this site</div>}
            </div>
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate</div>
          <div className="tb-grid-4">
            {[{label:"Hotels",icon:"🏨",path:"/administration/hotels"},{label:"Administration",icon:"⚙️",path:"/administration"},{label:"Assets",icon:"🔧",path:"/maintenance/assets"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"}].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span><span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
