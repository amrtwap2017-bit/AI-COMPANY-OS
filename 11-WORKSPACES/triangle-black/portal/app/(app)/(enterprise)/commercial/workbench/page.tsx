"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
export default function CommercialWorkbenchPage() {
  const router = useRouter();
  const { data: finDash } = useQuery(["cw-fin"], () => authFetch("/api/v1/financial/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: contracts } = useQuery(["cw-contracts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()), {staleTime:60000});
  const { data: leads } = useQuery(["cw-leads"], () => authFetch("/api/v1/leads/").then(r=>r.json()), {staleTime:60000});
  const rev = finDash?.revenue || {};
  const cl = toArr(contracts);
  const ld = toArr(leads);
  const modules = [
    {icon:"🎯",label:"Leads",desc:`${ld.length} leads`,path:"/commercial/leads"},
    {icon:"📋",label:"Contracts",desc:`${cl.length} contracts`,path:"/commercial/contracts"},
    {icon:"💰",label:"Invoices",desc:"Financial management",path:"/commercial/invoices"},
    {icon:"📊",label:"Pipeline",desc:"Deal pipeline view",path:"/commercial/pipeline"},
    {icon:"💳",label:"Payments",desc:"Payment history",path:"/commercial/payment-history"},
    {icon:"📈",label:"Analytics",desc:"Cost analysis",path:"/analytics/costs"},
  ];
  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Commercial</div>
        <h1 className="tb-hero-title">Commercial Workbench</h1>
        <p className="tb-hero-description">Leads, contracts, invoices, and revenue intelligence</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
          {[
            {label:"Total Invoiced",value:fmtEGP(rev.total_invoiced||0),color:"#B9924C"},
            {label:"Collected",value:fmtEGP(rev.total_collected||0),color:"#547C4D"},
            {label:"Active Contracts",value:cl.filter((c: any) =>c.status==="active").length,color:"#5B7C8C"},
            {label:"Open Leads",value:ld.filter((l: any) =>l.status==="new"||l.status==="contacted").length,color:"#B07A2A"},
          ].map((k: any, i: number) =>(<div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>))}
        </div>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
        {modules.map((m: any, i: number) =>(<button key={i} onClick={()=>router.push(m.path)} style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20,textAlign:"left",cursor:"pointer",transition:"all 160ms ease"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(185,146,76,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border)"}><span style={{fontSize:"1.5rem"}}>{m.icon}</span><div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)",marginTop:8}}>{m.label}</div><div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginTop:4}}>{m.desc}</div></button>))}
      </div>
    </div>
  );
}
