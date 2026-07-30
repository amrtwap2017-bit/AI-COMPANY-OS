"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { TableSkeleton, KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtRel = (d) => { if (!d) return ""; try { const h=Math.floor((Date.now()-new Date(d).getTime())/3600000); return h<1?"just now":h<24?h+"h ago":Math.floor(h/24)+"d ago"; } catch { return ""; } };
const PC = {critical:"#A84A3D",high:"#B07A2A",medium:"#8D7443",normal:"#6D5F53",emergency:"#A84A3D"};
const HERO = {background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"};

export default function AlertsPage() {
  const router = useRouter();
  const { data: breaches } = useQuery(["alerts-breaches"], () => authFetch("/api/v1/sla/breaches").then(r=>r.json()), {staleTime:30000});
  const { data: notifs } = useQuery(["alerts-notifs"], () => authFetch("/api/v1/platform-notif/?limit=20").then(r=>r.json()), {staleTime:30000});
  const { data: slaDash } = useQuery(["alerts-sla"], () => authFetch("/api/v1/sla/dashboard").then(r=>r.json()), {staleTime:60000});
  const breachList = toArr(breaches);
  const notifList = notifs?.notifications || [];
  const overall = slaDash?.overall || {};

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div style={HERO}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Platform</div>
          <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>Alerts & Breaches</h1>
          <p style={{color:"rgba(210,195,175,0.60)",fontSize:"0.8125rem",marginTop:6}}>{breachList.length} active breaches · {notifList.filter(n=>!n.is_read).length} unread</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
            {[
              {label:"SLA Breaches",value:breachList.length,color:breachList.length>0?"#A84A3D":"#547C4D"},
              {label:"Total SRs",value:overall.total_requests||0,color:"#F3EFE8"},
              {label:"Resolved",value:overall.resolved||0,color:"#547C4D"},
              {label:"Avg Resolution",value:`${Math.round(overall.avg_resolution_hours||0)}h`,color:"#F3EFE8"},
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(185,146,76,0.12)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:"1.5rem",fontWeight:800,color:k.color}}>{k.value}</div>
                <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{background:"var(--color-surface)",border:"1px solid rgba(168,74,61,0.2)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"#A84A3D",marginBottom:16}}>⚠ SLA Breaches ({breachList.length})</div>
          {breachList.length===0 ? (
            <div style={{textAlign:"center",padding:"32px",color:"var(--color-text-3)"}}>
              <div style={{fontSize:"2rem",marginBottom:8,opacity:0.4}}>✅</div>
              <div style={{fontWeight:700,color:"var(--color-text-2)"}}>No active SLA breaches</div>
            </div>
          ) : breachList.map((b,i)=>{
            const pc = PC[b.urgency]||"#6D5F53";
            return (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px",background:"var(--color-bg-alt)",borderRadius:8,marginBottom:8,border:`1px solid ${pc}20`}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:pc,flexShrink:0,marginTop:5}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.title}</div>
                  <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{b.urgency} · Target: {b.sla_target_hours}h · {b.site_name||"—"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:"0.9375rem",fontWeight:800,color:"#A84A3D"}}>{Math.round(b.hours_overdue)}h</div>
                  <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>overdue</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Recent Notifications</div>
          {notifList.length===0 ? (
            <div style={{textAlign:"center",padding:"32px",color:"var(--color-text-3)"}}>No notifications</div>
          ) : notifList.map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:"1px solid var(--color-divider)"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:n.is_read?"var(--color-text-3)":"#B9924C",flexShrink:0,marginTop:5}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.8125rem",fontWeight:n.is_read?400:600,color:"var(--color-text-1)"}}>{n.title}</div>
                <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:1}}>{fmtRel(n.created_at)}</div>
              </div>
            </div>
          ))}
          <button onClick={()=>authFetch("/api/v1/platform-notif/mark-all-read",{method:"POST"}).then(()=>window.location.reload())}
            style={{width:"100%",marginTop:16,background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,padding:"8px",color:"var(--color-text-3)",fontSize:"0.8125rem",cursor:"pointer"}}>
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
}
