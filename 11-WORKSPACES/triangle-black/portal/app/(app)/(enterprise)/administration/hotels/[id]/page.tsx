"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter, useParams } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
export default function HotelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: siteRaw, isLoading } = useQuery(["hotel-d", id], () => authFetch("/api/v1/sites-portal").then((r: any) =>r.json()));
  const { data: assetRaw } = useQuery(["hotel-d-assets"], () => authFetch("/api/v1/assets/").then((r: any) =>r.json()));
  const { data: ctRaw } = useQuery(["hotel-d-cts"], () => authFetch("/api/v1/contracts/").then((r: any) =>r.json()));
  const sites = toArr(siteRaw); const assets = toArr(assetRaw); const contracts = toArr(ctRaw);
  const site = sites.find((s: any)=>s.id===id)||sites[0];
  const siteAssets = assets.filter((a: any) =>a.site_id===(site?.id||id));
  const faulted = siteAssets.filter((a: any) =>a.status==="In Fault");
  if (!isLoading && !site) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="tb-empty"><div className="tb-empty-icon">🏨</div><div className="tb-empty-title">Hotel not found</div>
        <button onClick={()=>router.push("/administration/hotels")} className="tb-btn-primary mt-4">Back</button></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
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
            {[{label:"Total Assets",value:siteAssets.length,color:"#5B7C8C"},{label:"Operational",value:siteAssets.filter((a: any) =>a.status==="Operational").length,color:"#547C4D"},{label:"In Fault",value:faulted.length,color:faulted.length>0?"#A84A3D":"#547C4D"},{label:"Active Contracts",value:contracts.filter((c: any) =>c.status==="active").length,color:"#8D7443"}].map((k: any, i: number) =>(
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
            <div className="tb-section-header"><div className="tb-section-title" className="mb-0">Assets</div><button onClick={()=>router.push("/maintenance/assets")} className="tb-section-link">All →</button></div>
            <div className="space-y-2 mt-3">
              {siteAssets.slice(0,6).map((a: any, i: number)=>{
                const sc=({"Operational":"#547C4D","In Fault":"#A84A3D","Under Maintenance":"#B07A2A"} as Record<string,string>)[a.status]||"#6D5F53";
                return <button key={i} onClick={()=>router.push("/maintenance/assets/"+a.id)} className="tb-action-item w-full justify-between"><div className="flex items-center gap-2 min-w-0"><span>⚙️</span><span className="text-sm text-secondary truncate">{a.name}</span></div><span className="tb-badge" style={{background:sc+"18",color:sc,fontSize:"0.5rem"}}>{a.status}</span></button>;
              })}
              {siteAssets.length===0&&<div className="text-xs text-tertiary text-center py-4">No assets registered for this site</div>}
            </div>
          </div>
        </div>
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Navigate</div>
          <div className="tb-grid-4">
            {[{label:"Hotels",icon:"🏨",path:"/administration/hotels"},{label:"Administration",icon:"⚙️",path:"/administration"},{label:"Assets",icon:"🔧",path:"/maintenance/assets"},{label:"PM Plans",icon:"📅",path:"/maintenance/pm-plans"}].map((a: any, i: number) =>(
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
