"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

export default function ExecutivePage() {
  const router = useRouter();
  const { data: twin }        = useQuery(["exe-twin"],   () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash }        = useQuery(["exe-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()), {refetchInterval:30000});
  const { data: woRaw }       = useQuery(["exe-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }      = useQuery(["exe-inv"],    () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: contractRaw } = useQuery(["exe-cont"],   () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: notifRaw }    = useQuery(["exe-notifs"], () => authFetch("/api/v1/notifications/").then(r=>r.json()));

  const wos = toArr(woRaw); const invoices = toArr(invRaw);
  const contracts = toArr(contractRaw); const notifs = toArr(notifRaw);
  const d = dash || {}; const now = new Date(); const score = twin?.health_score ?? 0;

  const criticalWOs = wos.filter(w => w.priority==="critical" && w.status!=="completed");
  const overdueWOs  = wos.filter(w => w.due_date && new Date(w.due_date)<now && w.status!=="completed");
  const expiring30  = contracts.filter(c => c.status==="active" && c.end_date && new Date(c.end_date)>=now && new Date(c.end_date)<=new Date(now.getTime()+30*86400000));
  const totalRevenue = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const pendingRev   = invoices.filter(i=>i.status==="pending").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const collRate     = invoices.length>0?Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100):0;
  const compRate     = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const unread       = notifs.filter(n=>!n.is_read);
  const riskScore    = criticalWOs.length*10 + overdueWOs.length*3 + expiring30.length*5 + (d.maintenance?.overdue||0)*2;
  const riskLevel    = riskScore===0?"None":riskScore<15?"Low":riskScore<30?"Medium":"High";
  const riskColor    = riskScore===0?"#34D399":riskScore<15?"#60A5FA":riskScore<30?"#FBBF24":"#F87171";

  const subPages = [
    {label:"Intelligence",  icon:"🧠", path:"/executive/intelligence"},
    {label:"Daily Review",  icon:"☀️", path:"/executive/daily-review"},
    {label:"Portfolio",     icon:"💼", path:"/executive/portfolio"},
    {label:"Risks",         icon:"⚠️", path:"/executive/risks"},
    {label:"Exceptions",    icon:"🚨", path:"/executive/exceptions"},
    {label:"Scorecard",     icon:"🏆", path:"/executive/scorecard"},
    {label:"Predictive",    icon:"🔮", path:"/executive/predictive"},
    {label:"Reports",       icon:"📊", path:"/executive/reports"},
    {label:"Command",       icon:"⚡", path:"/executive/command"},
    {label:"Workbench",     icon:"🛠️", path:"/executive/workbench"},
  ];

  return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>

      {/* ── DARK HERO ─────────────────────────────────────────── */}
      <div style={{background:"linear-gradient(135deg, #0F172A 0%, #1A2744 50%, #0F172A 100%)", borderBottom:"1px solid rgba(255,255,255,0.06)"}} className="px-8 py-8">
        <div className="max-w-content mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div style={{width:6,height:6,borderRadius:"50%",background:"#34D399"}} className="animate-pulse"/>
                <span style={{color:"rgba(148,163,184,0.7)",fontSize:"0.6875rem",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>Executive Center</span>
              </div>
              <h1 style={{fontSize:"2.25rem",fontWeight:900,color:"#F1F5F9",letterSpacing:"-0.025em",lineHeight:1.1}}>Executive Dashboard</h1>
              <p style={{color:"rgba(148,163,184,0.6)",fontSize:"0.875rem",marginTop:6}}>Real-time business intelligence and decision support</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Twin score */}
              <div style={{background:score>=95?"rgba(16,185,129,0.08)":"rgba(245,158,11,0.08)",border:`1px solid ${score>=95?"rgba(16,185,129,0.25)":"rgba(245,158,11,0.25)"}`,borderRadius:16,padding:"16px 24px",textAlign:"center",boxShadow:score>=95?"0 0 24px rgba(16,185,129,0.12)":"0 0 24px rgba(245,158,11,0.12)"}}>
                <div style={{fontSize:"2.5rem",fontWeight:900,lineHeight:1,color:score>=95?"#34D399":"#FCD34D"}}>{score}</div>
                <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Platform Health</div>
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:score>=95?"#34D399":"#FCD34D",marginTop:2}}>{twin?.health_label||"—"}</div>
              </div>
              {/* Risk score */}
              <div style={{background:`${riskColor}14`,border:`1px solid ${riskColor}40`,borderRadius:16,padding:"16px 24px",textAlign:"center"}}>
                <div style={{fontSize:"2rem",fontWeight:900,lineHeight:1,color:riskColor}}>{riskScore}</div>
                <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Risk Score</div>
                <div style={{fontSize:"0.6875rem",fontWeight:700,color:riskColor,marginTop:2}}>{riskLevel}</div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-8">
            {[
              {label:"Active Contracts", value:d.commercial?.active_contracts??0, color:"#34D399", path:"/commercial/contracts"},
              {label:"Revenue",          value:fmtEGP(totalRevenue),              color:"#FBBF24", path:"/invoices"},
              {label:"Pending",          value:fmtEGP(pendingRev),                color:"#60A5FA", path:"/invoices"},
              {label:"Critical WOs",     value:criticalWOs.length,                color:criticalWOs.length>0?"#F87171":"#34D399", path:"/executive/exceptions"},
              {label:"WO Completion",    value:`${compRate}%`,                    color:compRate>=80?"#34D399":"#FBBF24", path:"/analytics/scorecards"},
              {label:"Unread Alerts",    value:unread.length,                     color:"#A78BFA", path:"/inbox"},
            ].map((k,i)=>(
              <button key={i} onClick={()=>router.push(k.path)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 8px",textAlign:"center",cursor:"pointer",transition:"all 150ms ease"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}}>
                <div style={{fontSize:"1.25rem",fontWeight:900,color:k.color,lineHeight:1}}>{k.value}</div>
                <div style={{fontSize:"0.625rem",color:"rgba(148,163,184,0.6)",marginTop:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div className="max-w-content mx-auto px-8 py-8 space-y-6">

        {/* Executive nav */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
          <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:16}}>Executive Views</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {subPages.map((nav,i)=>(
              <button key={i} onClick={()=>router.push(nav.path)} className="flex flex-col items-center gap-1.5"
                style={{padding:"14px 8px",borderRadius:12,background:"transparent",border:"1px solid transparent",transition:"all 150ms ease",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(180,83,9,0.06)";e.currentTarget.style.borderColor="rgba(180,83,9,0.2)"}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="transparent"}}>
                <span style={{fontSize:"1.25rem"}}>{nav.icon}</span>
                <span style={{fontSize:"0.625rem",fontWeight:600,color:"var(--color-text-2)",textAlign:"center"}}>{nav.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — alerts */}
          <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
            <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Attention Required</div>
            <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Executive Alerts</div>
            {criticalWOs.length===0 && expiring30.length===0 ? (
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{fontSize:"2.5rem",marginBottom:12}}>✅</div>
                <div style={{fontSize:"0.875rem",color:"var(--color-text-2)"}}>No executive alerts</div>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalWOs.slice(0,4).map((w,i)=>(
                  <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="w-full text-left"
                    style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"12px 14px",transition:"all 150ms ease",cursor:"pointer"}}>
                    <div style={{fontSize:"0.625rem",fontWeight:700,color:"#F87171",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>Critical WO</div>
                    <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{w.title}</div>
                  </button>
                ))}
                {expiring30.slice(0,3).map((c,i)=>{
                  const days=Math.ceil((new Date(c.end_date)-Date.now())/86400000);
                  return (
                    <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)} className="w-full text-left"
                      style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"12px 14px",transition:"all 150ms ease",cursor:"pointer"}}>
                      <div style={{fontSize:"0.625rem",fontWeight:700,color:"#FBBF24",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>Contract Expiring · {days}d</div>
                      <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}} className="truncate">{c.title||c.id?.slice(0,16)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — twin domains + finance */}
          <div className="xl:col-span-2 space-y-5">
            {/* Twin domains */}
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
              <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Digital Twin</div>
              <div className="flex items-center justify-between" style={{marginBottom:20}}>
                <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)"}}>Domain Health — {score}/100</div>
                <button onClick={()=>router.push("/executive/intelligence")} style={{fontSize:"0.75rem",color:"var(--color-brand)",fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Full →</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(twin?.operational_domains??[]).map((dom,i)=>{
                  const hasIssue=(dom.overdue??0)>0||(dom.critical_open??0)>0||(dom.below_min??0)>0;
                  const c=hasIssue?"#FBBF24":"#34D399";
                  return (
                    <div key={i} style={{background:hasIssue?"rgba(245,158,11,0.06)":"rgba(16,185,129,0.06)",border:`1px solid ${hasIssue?"rgba(245,158,11,0.2)":"rgba(16,185,129,0.2)"}`,borderRadius:12,padding:14}}>
                      <div className="flex justify-between" style={{marginBottom:6}}>
                        <div style={{fontSize:"0.6875rem",fontWeight:600,color:"var(--color-text-1)"}}>{dom.domain}</div>
                        <div style={{fontSize:"0.75rem",fontWeight:900,color:c}}>{hasIssue?"⚠":"✓"}</div>
                      </div>
                      <div style={{fontSize:"1.5rem",fontWeight:900,color:c,lineHeight:1}}>{dom.total??0}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finance snapshot */}
            <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:20,padding:24}}>
              <div className="flex items-center justify-between" style={{marginBottom:20}}>
                <div>
                  <div style={{fontSize:"0.6875rem",fontWeight:700,color:"var(--color-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Finance</div>
                  <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)"}}>Revenue Snapshot</div>
                </div>
                <button onClick={()=>router.push("/invoices")} style={{fontSize:"0.75rem",color:"var(--color-brand)",fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Full report →</button>
              </div>
              <div className="grid grid-cols-4 gap-3" style={{marginBottom:16}}>
                {[
                  {label:"Paid",      count:d.finance?.paid??0,     color:"#34D399"},
                  {label:"Pending",   count:d.finance?.pending??0,   color:"#FBBF24"},
                  {label:"Overdue",   count:d.finance?.overdue??0,   color:"#F87171"},
                  {label:"Cancelled", count:d.finance?.cancelled??0, color:"rgba(148,163,184,0.5)"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"var(--color-bg-alt)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                    <div style={{fontSize:"1.5rem",fontWeight:900,color:s.color,lineHeight:1}}>{s.count}</div>
                    <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)",marginTop:4}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div style={{height:6,background:"var(--color-bg-alt)",borderRadius:99,overflow:"hidden"}}>
                <div style={{display:"flex",height:"100%"}}>
                  <div style={{background:"#34D399",height:"100%",width:`${(d.finance?.paid||0)/(d.finance?.total_invoices||1)*100}%`,transition:"width 600ms ease"}}/>
                  <div style={{background:"#FBBF24",height:"100%",width:`${(d.finance?.pending||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                  <div style={{background:"#F87171",height:"100%",width:`${(d.finance?.overdue||0)/(d.finance?.total_invoices||1)*100}%`}}/>
                </div>
              </div>
              <div className="flex gap-4 mt-3" style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>
                <span className="flex items-center gap-1.5"><span style={{width:8,height:8,borderRadius:"50%",background:"#34D399",display:"inline-block"}}/>{fmtEGP(d.finance?.paid_value||0)} Paid</span>
                <span className="flex items-center gap-1.5"><span style={{width:8,height:8,borderRadius:"50%",background:"#FBBF24",display:"inline-block"}}/>{fmtEGP(d.finance?.outstanding_value||0)} Outstanding</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
