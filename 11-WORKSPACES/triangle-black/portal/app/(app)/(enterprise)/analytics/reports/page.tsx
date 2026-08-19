"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.reports || [];

export default function AnalyticsReportsPage() {
  const router = useRouter();
  const { data: catalogRaw } = useQuery(["reports-catalog"], () => authFetch("/api/v1/report-engine/catalog").then(r => (r as any).data ?? r), {staleTime:60000});
  const reports = toArr(catalogRaw?.reports || catalogRaw);

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Analytics</div>
        <h1 className="tb-hero-title">Report Center</h1>
        <p className="tb-hero-description">{reports.length} report types available · CSV + PDF export</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {reports.length === 0 ? (
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:48,color:"var(--color-text-3)"}}>No reports configured</div>
          ) : reports.map((r: any, i: number) => (
            <button key={i} onClick={()=>router.push("/reports")}
              style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24,textAlign:"left",cursor:"pointer",transition:"all 160ms ease"}}
              onMouseEnter={(e: any) =>{e.currentTarget.style.borderColor="rgba(185,146,76,0.3)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={(e: any) =>{e.currentTarget.style.borderColor="var(--color-border)";e.currentTarget.style.transform="none";}}>
              <div style={{fontSize:"1.5rem",marginBottom:8}}>📊</div>
              <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)"}}>{r.name || r.type || "Report"}</div>
              <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginTop:4}}>{r.description || "Generate and export"}</div>
              <div style={{fontSize:"0.75rem",fontWeight:600,color:"#B9924C",marginTop:8}}>Generate →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
