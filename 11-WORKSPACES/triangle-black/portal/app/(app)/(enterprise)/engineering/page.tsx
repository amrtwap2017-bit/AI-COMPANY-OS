"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();

export default function EngineeringHubPage() {
  const router = useRouter();
  const { data: execDash } = useQuery(["eng-exec"], () => authFetch("/api/v1/executive/dashboard").then(r => r.data ?? r), {staleTime:60000});
  const { data: timeDash } = useQuery(["eng-time"], () => authFetch("/api/v1/time-entries/summary").then(r => r.data ?? r), {staleTime:60000});
  const { data: woRaw } = useQuery(["eng-wos"], () => authFetch("/api/v1/work-orders/?limit=10").then(r => r.data ?? r), {staleTime:30000});
  const ops = execDash?.operations?.work_orders || {};
  const time = timeDash?.totals || {};
  const wos = toArr(woRaw).slice(0,5);

  const modules = [
    {icon:"🔧",label:"Work Orders",desc:"All engineering WOs",path:"/operations/work-orders"},
    {icon:"➕",label:"New Work Order",desc:"Create engineering WO",path:"/operations/work-orders/new"},
    {icon:"📅",label:"PM Plans",desc:"Preventive maintenance",path:"/engineering/pm-plans"},
    {icon:"📋",label:"Dispatch Board",desc:"Assign technicians",path:"/operations/dispatch"},
    {icon:"📜",label:"Work History",desc:"Completed WOs log",path:"/maintenance/work-history"},
    {icon:"⏱",label:"Time Tracking",desc:"Log hours worked",path:"/operations/time-tracking"},
    {icon:"📱",label:"Asset QR Scan",desc:"Scan to view/create WO",path:"/operations/assets/qr"},
    {icon:"🏭",label:"Asset Registry",desc:"All managed assets",path:"/maintenance/assets"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero"><div className="tb-hero-inner">
        <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Engineering</div>
        <h1 className="tb-hero-title">Engineering Hub</h1>
        <p className="tb-hero-description">Work orders, maintenance, assets, and field engineering</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
          {[
            {label:"Open WOs",value:ops.open_count||0,color:"#5B7C8C"},
            {label:"In Progress",value:ops.in_progress||0,color:"#B07A2A"},
            {label:"Completed",value:ops.completed||0,color:"#547C4D"},
            {label:"Hours Logged",value:`${Math.round(time.total_hours||0)}h`,color:"#B9924C"},
          ].map((k: any, i: number) =>(
            <div key={i} className="tb-hero-kpi">
              <div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div>
              <div className="tb-hero-kpi-label">{k.label}</div>
            </div>
          ))}
        </div>
      </div></div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
        {modules.map((m: any, i: number) =>(
          <button key={i} onClick={()=>router.push(m.path)}
            style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:20,textAlign:"left",cursor:"pointer",transition:"all 160ms ease"}}
            onMouseEnter={(e: any) =>e.currentTarget.style.borderColor="rgba(185,146,76,0.3)"}
            onMouseLeave={(e: any) =>e.currentTarget.style.borderColor="var(--color-border)"}>
            <span style={{fontSize:"1.5rem"}}>{m.icon}</span>
            <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)",marginTop:8}}>{m.label}</div>
            <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)",marginTop:4}}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
