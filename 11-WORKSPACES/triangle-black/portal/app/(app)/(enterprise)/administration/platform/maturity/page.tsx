"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
export default function PlatformMaturityPage() {
  const { data: twin } = useQuery(["mat-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()), {staleTime:30000});
  const { data: health } = useQuery(["mat-health"], () => authFetch("/api/v1/health").then(r => r.json()), {staleTime:30000});
  const score = twin?.health_score||0;
  const sc = score>=90?"#547C4D":score>=70?"#B07A2A":"#A84A3D";
  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Administration</div>
        <h1 className="tb-hero-title">Platform Maturity</h1>
        <p className="tb-hero-description">Digital twin health score and platform metrics</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:40,textAlign:"center",width:300}}>
          <div style={{fontSize:"4rem",fontWeight:900,color:sc,lineHeight:1}}>{score}</div>
          <div style={{fontSize:"0.875rem",color:"var(--color-text-3)",marginTop:8}}>Platform Twin Score</div>
          <div style={{width:"100%",height:8,background:"var(--color-bg-alt)",borderRadius:4,marginTop:16,overflow:"hidden"}}><div style={{height:"100%",width:`${score}%`,background:sc,borderRadius:4}}/></div>
        </div>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24,width:"100%",maxWidth:500}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>System Status</div>
          {[["Database",health?.database||"unknown"],["Version",health?.version||"—"],["Platform",health?.platform||"Triangle Black"],["Status",health?.status||"—"]].map(([l,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--color-divider)"}}><span style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>{l}</span><span style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{v}</span></div>))}
        </div>
      </div>
    </div>
  );
}
