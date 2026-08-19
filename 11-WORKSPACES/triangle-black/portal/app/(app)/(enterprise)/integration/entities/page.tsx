"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function IntegrationEntitiesPage() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["ie-assets"], () => authFetch("/api/v1/assets/").then(r => r.data ?? r));
  const { data: woRaw }    = useQuery(["ie-wos"],    () => authFetch("/api/v1/work-orders/").then(r => r.data ?? r));
  const { data: contRaw }  = useQuery(["ie-conts"],  () => authFetch("/api/v1/contracts/").then(r => r.data ?? r));
  const assets = toArr(assetRaw); const wos = toArr(woRaw); const contracts = toArr(contRaw);
  const entities = [
    {name:"Assets",       count:assets.length,     api:"/api/v1/assets/",           icon:"⚙️",  path:"/maintenance/assets"},
    {name:"Work Orders",  count:wos.length,         api:"/api/v1/work-orders/",      icon:"🔧", path:"/operations/work-orders"},
    {name:"Contracts",    count:contracts.length,   api:"/api/v1/contracts/",        icon:"📄", path:"/commercial/contracts"},
    {name:"Leads",        count:null,               api:"/api/v1/leads/",            icon:"👤", path:"/commercial/leads"},
    {name:"Technicians",  count:null,               api:"/api/v1/technicians/",      icon:"👷", path:"/operations/technicians"},
    {name:"PM Plans",     count:null,               api:"/api/v1/maintenance/pm-plans/",icon:"📅",path:"/maintenance/pm-plans"},
    {name:"Suppliers",    count:null,               api:"/api/v1/suppliers/",        icon:"🏭", path:"/supply-chain/suppliers"},
    {name:"Invoices",     count:null,               api:"/api/v1/invoices/",         icon:"💰", path:"/invoices"},
  ];
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-cyan-400 mb-1.5">Integration</div>
          <h1 className="tb-hero-title">Entity Catalog</h1>
          <p className="tb-hero-description">Platform entity registry and API documentation</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Entities",value:entities.length,color:"#221D1A"},{label:"Assets",value:assets.length,color:"#5B7C8C"},{label:"Work Orders",value:wos.length,color:"#B07A2A"},{label:"Contracts",value:contracts.length,color:"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="tb-section-title">Entity Registry</div>
          <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
            <div className="tb-table-head" style={{gridTemplateColumns:"1fr 80px 1fr"}}>
              {["Entity","Count","API Endpoint"].map((h: any, i: number) =><div key={i} className="tb-table-head-cell" style={{textAlign:i===1?"center":"left"}}>{h}</div>)}
            </div>
            {entities.map((e: any, i: number) =>(
              <button key={i} onClick={()=>router.push(e.path)} className="tb-table-row" style={{gridTemplateColumns:"1fr 80px 1fr"}}>
                <div className="flex items-center gap-2"><span>{e.icon}</span><span className="text-sm font-medium text-primary">{e.name}</span></div>
                <div className="text-center text-sm font-bold" style={{color:"#5B7C8C"}}>{e.count??"-"}</div>
                <div className="text-xs text-tertiary font-mono">{e.api}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
