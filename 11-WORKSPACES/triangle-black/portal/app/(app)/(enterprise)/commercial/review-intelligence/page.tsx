"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
export default function ReviewIntelligencePage() {
  const { data: fin } = useQuery(["ri-fin"], () => authFetch("/api/v1/financial/dashboard").then(r => (r as any).data ?? r), {staleTime:60000});
  const { data: proc } = useQuery(["ri-proc"], () => authFetch("/api/v1/procurement/dashboard").then(r => (r as any).data ?? r), {staleTime:60000});
  const rev = fin?.revenue || {};
  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Commercial</div>
        <h1 className="tb-hero-title">Review Intelligence</h1>
        <p className="tb-hero-description">AI-powered commercial insights and analysis</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Revenue Intelligence</div>
          {[["Collection Rate",`${Math.round(rev.collection_rate_pct||0)}%`],["Total Invoiced",fmtEGP(rev.total_invoiced||0)],["Collected",fmtEGP(rev.total_collected||0)],["Outstanding",fmtEGP(rev.total_outstanding||0)]].map(([l,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--color-divider)"}}><span style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>{l}</span><span style={{fontSize:"0.8125rem",fontWeight:700,color:"var(--color-text-1)"}}>{v}</span></div>))}
        </div>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Procurement Intelligence</div>
          {[["Active SOWs",proc?.sow?.total||0],["Active RFQs",proc?.rfqs?.total||0],["Purchase Orders",proc?.pos?.total||0],["Approved Vendors",proc?.vendors?.approved||0]].map(([l,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--color-divider)"}}><span style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>{l}</span><span style={{fontSize:"0.8125rem",fontWeight:700,color:"var(--color-text-1)"}}>{v}</span></div>))}
        </div>
      </div>
    </div>
  );
}
