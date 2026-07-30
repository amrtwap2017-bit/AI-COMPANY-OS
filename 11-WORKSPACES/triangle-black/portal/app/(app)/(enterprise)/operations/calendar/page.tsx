"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d) => { if (!d) return ""; try { return new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}); } catch { return ""; } };

export default function OperationsCalendarPage() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["cal-wos"], () => authFetch("/api/v1/work-orders/?limit=50").then(r=>r.json()), {staleTime:30000});
  const { data: pmRaw } = useQuery(["cal-pm"], () => authFetch("/api/v1/pm-schedule/calendar").then(r=>r.json()), {staleTime:60000});
  const wos = toArr(woRaw).filter(w => w.due_date).slice(0,20);
  const pm = toArr(pmRaw?.events || pmRaw).slice(0,10);
  const SC = {open:"#5B7C8C",in_progress:"#B07A2A",completed:"#547C4D",critical:"#A84A3D",high:"#B07A2A"};

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Operations</div>
        <h1 className="tb-hero-title">Operations Calendar</h1>
        <p className="tb-hero-description">Upcoming work orders and maintenance schedule</p>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Upcoming Work Orders</div>
          {wos.length === 0 ? (
            <div style={{textAlign:"center",padding:32,color:"var(--color-text-3)"}}>No scheduled work orders</div>
          ) : wos.map((w,i)=>{
            const c = SC[w.priority]||SC[w.status]||"#6D5F53";
            return (
              <button key={i} onClick={()=>router.push("/operations/work-orders/"+w.id)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--color-divider)",width:"100%",textAlign:"left",background:"transparent",cursor:"pointer"}}>
                <div style={{width:44,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)"}}>{fmtDate(w.due_date)}</div>
                </div>
                <div style={{width:3,height:32,background:c,borderRadius:4,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title}</div>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{w.priority} · {w.status}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Maintenance Schedule</div>
          {pm.length === 0 ? (
            <div style={{textAlign:"center",padding:32,color:"var(--color-text-3)"}}>No scheduled maintenance</div>
          ) : pm.map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--color-divider)"}}>
              <div style={{width:44,textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)"}}>{fmtDate(e.date||e.next_maintenance_date)}</div>
              </div>
              <div style={{width:3,height:32,background:"#B9924C",borderRadius:4,flexShrink:0}}/>
              <div>
                <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{e.title||e.name||"Maintenance"}</div>
                <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{e.type||e.category||"Scheduled"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
