"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();

export default function ProjectTimelinePage() {
  const router = useRouter();
  const { data: raw } = useQuery(["proj-timeline"], () => authFetch("/api/v1/projects/").then(r=>r.json()), {staleTime:30000});
  const projects = toArr(raw);
  const SC = {active:"#547C4D",planning:"#5B7C8C",completed:"#8D7443",on_hold:"#B07A2A",cancelled:"#A84A3D"};

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Projects</div>
        <h1 className="tb-hero-title">Project Timeline</h1>
        <p className="tb-hero-description">{projects.length} projects · Visual timeline view</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px"}}>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          {projects.length === 0 ? (
            <div style={{textAlign:"center",padding:48,color:"var(--color-text-3)"}}>No projects found</div>
          ) : projects.map((p,i)=>{
            const sc = SC[p.status]||"#6D5F53";
            const pct = Number(p.completion_pct || p.progress || 0);
            return (
              <button key={i} onClick={()=>router.push("/projects-center/"+p.id)}
                style={{display:"flex",alignItems:"center",gap:16,padding:"16px 0",borderBottom:"1px solid var(--color-divider)",width:"100%",textAlign:"left",background:"transparent",cursor:"pointer"}}>
                <div style={{width:4,height:48,borderRadius:4,background:sc,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.9375rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title||p.name||"Project"}</div>
                  <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{fmtDate(p.start_date)} — {fmtDate(p.end_date)} · {fmtEGP(p.budget||p.total_budget||0)}</div>
                </div>
                <div style={{width:120,flexShrink:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.6875rem",color:"var(--color-text-3)",marginBottom:4}}>
                    <span>{pct}%</span>
                    <span style={{background:`${sc}18`,color:sc,padding:"1px 8px",borderRadius:10,fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase"}}>{(p.status||"").replace(/_/g," ")}</span>
                  </div>
                  <div style={{height:4,background:"var(--color-bg-alt)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:sc,borderRadius:4,transition:"width 600ms ease"}}/>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
