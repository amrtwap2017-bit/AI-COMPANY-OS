"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
export default function CustomerSuccessPage() {
  const router = useRouter();
  const { data: slaDash } = useQuery(["cs-sla"], () => authFetch("/api/v1/sla/dashboard").then(r=>r.json()), {staleTime:60000});
  const { data: contracts } = useQuery(["cs-contracts"], () => authFetch("/api/v1/contracts/").then(r=>r.json()), {staleTime:60000});
  const siteSla = slaDash?.site_sla || [];
  const cl = toArr(contracts);
  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Customers</div>
        <h1 className="tb-hero-title">Customer Success</h1>
        <p className="tb-hero-description">Client satisfaction, SLA performance, and contract health</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>SLA by Client Site</div>
          {siteSla.map((s,i)=>{
            const gc = s.sla_grade==="A"?"#547C4D":s.sla_grade==="B"?"#5B7C8C":s.sla_grade==="C"?"#B07A2A":"#A84A3D";
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid var(--color-divider)"}}>
                <div style={{width:36,height:36,borderRadius:8,background:`${gc}15`,border:`1px solid ${gc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"0.875rem",color:gc,flexShrink:0}}>{s.sla_grade}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.site_name}</div>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{s.resolved}/{s.total_requests} resolved · Score: {s.sla_score}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Active Contracts</div>
          {cl.filter(c=>c.status==="active").map((c,i)=>(
            <button key={i} onClick={()=>router.push("/commercial/contracts/"+c.id)}
              style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--color-divider)",width:"100%",textAlign:"left",background:"transparent",cursor:"pointer"}}>
              <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)"}}>{c.title}</div>
              <span style={{fontSize:"0.75rem",fontWeight:700,color:"#547C4D"}}>Active</span>
            </button>
          ))}
          {cl.filter(c=>c.status==="active").length===0 && <div style={{textAlign:"center",padding:24,color:"var(--color-text-3)"}}>No active contracts</div>}
        </div>
      </div>
    </div>
  );
}
