"use client";
// @ts-nocheck
import { RoleBadge } from "@/components/ui/RoleBadge";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function ExecutivePage() {
  const router = useRouter();
  const { data: twin }        = useQuery(["exe-twin"],   ()=>authFetch("/api/v1/twin/state").then(r => (r as any).data ?? r));
  const { data: dash }        = useQuery(["exe-dash"],   ()=>authFetch("/api/v1/dashboard/summary").then(r => (r as any).data ?? r),{refetchInterval:30000});
  const { data: woRaw }       = useQuery(["exe-wos"],    ()=>authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: invRaw }      = useQuery(["exe-inv"],    ()=>authFetch("/api/v1/invoices/").then(r => (r as any).data ?? r));
  const { data: contractRaw } = useQuery(["exe-cont"],   ()=>authFetch("/api/v1/contracts/").then(r => (r as any).data ?? r));
  const { data: notifRaw }    = useQuery(["exe-notifs"], ()=>authFetch("/api/v1/notifications-portal").then(r => (r as any).data ?? r));
  const { data: autoStatus }  = useQuery(["exe-auto"],   ()=>authFetch("/api/v1/automation/status").then(r => (r as any).data ?? r));

  const wos = toArr(woRaw);
  const invoices = toArr(invRaw);
  const contracts = toArr(contractRaw);
  const notifs = toArr(notifRaw);
  const d = dash||{};
  const now = new Date();
  const in30 = new Date(now.getTime()+30*86400000);
  const score = twin?.health_score??0;

  const criticalWOs = wos.filter((w: any) =>w.priority==="critical"&&w.status!=="completed");
  const overdueWOs = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  const expiringContracts = contracts.filter((c: any) =>c.status==="active"&&c.end_date&&new Date(c.end_date)>=now&&new Date(c.end_date)<=in30);
  const totalRevenue = invoices.filter((i: any) =>i.status==="paid").reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const pendingRevenue = invoices.filter((i: any) =>i.status==="pending").reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const unreadNotifs = notifs.filter((n: any) =>!n.is_read);
  const compRate = wos.length>0?Math.round(wos.filter((w: any) =>w.status==="completed").length/wos.length*100):0;
  const riskScore = criticalWOs.length*10+overdueWOs.length*3+expiringContracts.length*5+(d.maintenance?.overdue||0)*2;
  const riskLevel = riskScore===0?"None":riskScore<15?"Low":riskScore<30?"Medium":"High";
  const riskColor = riskScore===0?"var(--color-success)":riskScore<15?"var(--color-info)":riskScore<30?"var(--color-warning)":"var(--color-danger)";

  const executiveNav = [{label:"Intelligence",icon:"🧠",path:"/executive/intelligence"},{label:"Daily Review",icon:"☀️",path:"/executive/daily-review"},{label:"Portfolio",icon:"💼",path:"/executive/portfolio"},{label:"Risks",icon:"⚠️",path:"/executive/risks"},{label:"Exceptions",icon:"🚨",path:"/executive/exceptions"},{label:"Scorecard",icon:"🏆",path:"/executive/scorecard"},{label:"Predictive",icon:"🔮",path:"/executive/predictive"},{label:"Reports",icon:"📊",path:"/executive/reports"},{label:"Command",icon:"⚡",path:"/executive/command"},{label:"Workbench",icon:"🛠️",path:"/executive/workbench"}];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Executive Center</div>
              <h1 className="tb-hero-title">Executive Dashboard</h1>
              <div className="mt-1.5"><RoleBadge size="md"/></div>
              <p className="tb-hero-description mt-2">Real-time business intelligence and decision support</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`tb-section text-center flex-shrink-0 ${score>=95?"border-success/30":"border-warning/30"}`} style={{minWidth:"80px"}}>
                <div className={`text-2xl font-black ${score>=95?"text-success":"text-warning"}`}>{score}</div>
                <div className="text-xs text-tertiary mt-0.5">Platform Health</div>
                <div className="text-xs font-semibold mt-0.5" style={{color:score>=95?"var(--color-success)":"var(--color-warning)"}}>{twin?.health_label||"—"}</div>
              </div>
              <div className="tb-section text-center flex-shrink-0" style={{minWidth:"80px",borderColor:`${riskColor}40`}}>
                <div className="text-2xl font-black" style={{color:riskColor}}>{riskScore}</div>
                <div className="text-xs text-tertiary mt-0.5">Risk Score</div>
                <div className="text-xs font-semibold mt-0.5" style={{color:riskColor}}>{riskLevel}</div>
              </div>
            </div>
          </div>

          <div className="grid mt-6" style={{gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
            {[{label:"Active Contracts",value:d.commercial?.active_contracts??0,path:"/commercial/contracts"},{label:"Revenue",value:fmtEGP(totalRevenue),path:"/invoices"},{label:"Pending",value:fmtEGP(pendingRevenue),path:"/invoices"},{label:"Critical WOs",value:criticalWOs.length,danger:criticalWOs.length>0,path:"/executive/exceptions"},{label:"WO Completion",value:`${compRate}%`,good:compRate>=80,path:"/analytics/scorecards"},{label:"Unread Alerts",value:unreadNotifs.length,path:"/inbox"}].map((k: any, i: number) =>(
              <button key={i} onClick={()=>router.push(k.path)} className="tb-hero-kpi text-left cursor-pointer">
                <div className="tb-hero-kpi-value" style={{color:k.danger?"var(--color-danger)":k.good?"var(--color-success)":"var(--color-text-inv)",fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Executive Views</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {executiveNav.map((nav: any, i: any) =>(
              <button key={i} onClick={()=>router.push(nav.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{nav.icon}</span>
                <span className="text-xs font-medium text-secondary">{nav.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6" style={{gridTemplateColumns:"1fr 2fr"}}>
          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="flex justify-between items-center mb-3">
                <div className="tb-section-title" style={{margin:0}}>Executive Alerts</div>
                <button onClick={()=>router.push("/executive/exceptions")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">All →</button>
              </div>
              {criticalWOs.length===0&&expiringContracts.length===0 ? (
                <div className="tb-empty" style={{padding:"24px 0"}}>
                  <div className="tb-empty-icon text-4xl opacity-40">✅</div>
                  <div className="tb-empty-desc">No executive alerts</div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {criticalWOs.slice(0,3).map((w: any, i: number) =>(
                    <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="tb-section text-left border-danger/30 bg-danger/5 cursor-pointer">
                      <div className="text-xs font-bold text-danger mb-1">Critical WO</div>
                      <div className="text-sm font-semibold text-primary truncate">{w.title}</div>
                    </button>
                  ))}
                  {expiringContracts.slice(0,2).map((c: any, i: number) =>{
                    const days=Math.ceil((new Date(c.end_date)-Date.now())/86400000);
                    return (
                      <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)} className="tb-section text-left border-warning/30 bg-warning/5 cursor-pointer">
                        <div className="text-xs font-bold text-warning mb-1">Contract · {days}d left</div>
                        <div className="text-sm font-semibold text-primary truncate">{c.title||c.id?.slice(0,16)}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Business Summary</div>
              {[["WO Total",wos.length],["PM Plans",d.maintenance?.pm_plans??0],["Open Leads",d.commercial?.open_leads??0],["Purchase Reqs",d.procurement?.purchase_requests??0],["Technicians",d.platform?.technicians??0],["Projects",d.platform?.projects??0]].map(([l,v],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{l}</span>
                  <span className="tb-detail-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Digital Twin</div>
                  <div className="tb-section-title" style={{margin:0}}>Domain Health — {score}/100</div>
                </div>
                <button onClick={()=>router.push("/executive/intelligence")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">Intelligence →</button>
              </div>
              <div className="tb-grid-4">
                {(twin?.operational_domains??[]).map((dom: any, i: any) =>{
                  const hasIssue=(dom.overdue??0)>0||(dom.critical_open??0)>0||(dom.below_min??0)>0;
                  return (
                    <div key={i} className={`tb-section cursor-pointer ${hasIssue?"border-warning/30 bg-warning/5":"border-success/20 bg-success/5"}`}>
                      <div className="flex justify-between mb-1">
                        <div className="text-xs font-semibold text-primary">{dom.domain}</div>
                        <div className="text-xs font-black" style={{color:hasIssue?"var(--color-warning)":"var(--color-success)"}}>{hasIssue?"⚠":"✓"}</div>
                      </div>
                      <div className="text-2xl font-black" style={{color:hasIssue?"var(--color-warning)":"var(--color-success)"}}>{dom.total??0}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tb-section">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-label-upper text-tertiary mb-1">Finance</div>
                  <div className="tb-section-title" style={{margin:0}}>Revenue Snapshot</div>
                </div>
                <button onClick={()=>router.push("/invoices")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">Full report →</button>
              </div>
              <div className="tb-grid-4 mb-4">
                {[{label:"Paid",count:d.finance?.paid??0,color:"var(--color-success)"},{label:"Pending",count:d.finance?.pending??0,color:"var(--color-warning)"},{label:"Overdue",count:d.finance?.overdue??0,color:"var(--color-danger)"},{label:"Cancelled",count:d.finance?.cancelled??0}].map((s: any, i: number) =>(
                  <div key={i} className="bg-surface-alt rounded-xl p-3 text-center">
                    <div className="text-2xl font-black" style={{color:s.color||"var(--color-text-1)"}}>{s.count}</div>
                    <div className="text-xs text-tertiary mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="tb-progress" style={{height:8}}>
                <div style={{display:"flex",height:"100%"}}>
                  <div className="tb-progress-bar" style={{width:`${(d.finance?.paid||0)/Math.max(d.finance?.total_invoices||1,1)*100}%`,background:"var(--color-success)"}} />
                  <div className="tb-progress-bar" style={{width:`${(d.finance?.pending||0)/Math.max(d.finance?.total_invoices||1,1)*100}%`,background:"var(--color-warning)"}} />
                  <div className="tb-progress-bar" style={{width:`${(d.finance?.overdue||0)/Math.max(d.finance?.total_invoices||1,1)*100}%`,background:"var(--color-danger)"}} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
