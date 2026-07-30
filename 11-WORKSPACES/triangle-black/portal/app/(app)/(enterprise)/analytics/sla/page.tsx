"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell, ReferenceLine,
} from "recharts";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const WarmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:10,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
      {label && <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,fontWeight:600}}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{fontSize:"0.875rem",fontWeight:700,color:p.color||"var(--color-text-1)"}}>
          {p.name}: {p.value}{p.unit||""}
        </div>
      ))}
    </div>
  );
};
const _OLD_DARK = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"var(--color-surface)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 14px"}}>
      {label && <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4}}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{fontSize:"0.875rem",fontWeight:700,color:p.color||"var(--color-text-1)"}}>
          {p.name}: {p.value}{p.unit||""}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsSLA() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["sla-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: slaDash } = useQuery(["sla-dash"], () => authFetch("/api/v1/sla/dashboard").then(r=>r.json()), {staleTime:60000});
  const wos = toArr(woRaw);
  const now = new Date();

  // SLA targets by priority (hours)
  const slaTargets: any = { critical:4, high:8, medium:24, low:72 };

  // SLA analysis by priority
  const slaData = (["critical","high","medium","low"] as const).map(priority => {
    const group     = wos.filter(w=>w.priority===priority);
    const completed = group.filter(w=>w.status==="completed");
    const breached  = group.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
    const withinSla = completed.filter(w=>{
      if(!w.created_at||!w.completed_at) return true;
      const hrs=(new Date(w.completed_at).getTime()-new Date(w.created_at).getTime())/3600000;
      return hrs<=slaTargets[priority];
    });
    const compliance = completed.length>0?Math.round(withinSla.length/completed.length*100):100;
    return {
      priority, label:priority.charAt(0).toUpperCase()+priority.slice(1),
      total:group.length, completed:completed.length,
      breached:breached.length, compliance,
      target:slaTargets[priority],
      color:priority==="critical"?"#A84A3D":priority==="high"?"#B07A2A":priority==="medium"?"#B07A2A":"var(--color-text-3)",
    };
  });

  const overall = Math.round(slaData.reduce((s,r)=>s+r.compliance,0)/slaData.length);

  // Breached WOs for table
  const breachedWOs = wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed")
    .sort((a,b)=>new Date(a.due_date).getTime()-new Date(b.due_date).getTime())
    .slice(0,10);

  // SLA compliance bar chart data
  const complianceChartData = slaData.map(s=>({
    name:s.label, compliance:s.compliance, target:85, color:s.color
  }));

  // WO count by priority line simulation
  const priorityCountData = slaData.map(s=>({
    name:s.label, total:s.total, completed:s.completed, breached:s.breached
  }));

  const AXIS_STYLE = {fontSize:11,fill:"#64748B"};
  const GRID_COLOR = "rgba(255,255,255,0.06)";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1B30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">SLA Performance</h1>
              <p className="tb-hero-description">Service level agreement compliance by priority — {overall}% overall compliance</p>
            </div>
            <div className={`tb-score-badge ${overall>=90?"tb-score-badge--success":"tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:overall>=90?"#547C4D":"#B07A2A"}}>{overall}%</div>
              <div className="tb-score-label">SLA Compliance</div>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {slaData.map((s,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:s.color}}>{s.compliance}%</div>
                <div className="tb-hero-kpi-label">{s.label} (≤{s.target}h)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* SLA Compliance by Priority */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>SLA Compliance Rate</div>
              <span className="text-xs text-tertiary">Target: 85%</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={complianceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={AXIS_STYLE} axisLine={false} tickLine={false}
                  tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<WarmTooltip/>}/>
                <ReferenceLine y={85} stroke="#B9924C" strokeDasharray="4 4" label={{value:"Target 85%",fill:"#B9924C",fontSize:10}}/>
                <Bar dataKey="compliance" name="Compliance" radius={[6,6,0,0]} unit="%">
                  {complianceChartData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* WO Count by Priority */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>WO Volume by Priority</div>
              <span className="text-xs text-tertiary">Total: {wos.length} WOs</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="completed" name="Completed" fill="#547C4D" radius={[4,4,0,0]} stackId="a"/>
                <Bar dataKey="breached"  name="Breached"  fill="#A84A3D" radius={[4,4,0,0]} stackId="a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SLA detail cards */}
        <div className="tb-grid-4">
          {slaData.map((s,i)=>(
            <div key={i} className="tb-section">
              <div className="text-xs text-tertiary mb-2 uppercase tracking-wider">{s.label} Priority</div>
              <div className="text-3xl font-black mb-1" style={{color:s.color}}>{s.compliance}%</div>
              <div className="text-xs text-secondary mb-3">SLA ≤ {s.target}h</div>
              <div className="tb-progress mb-3">
                <div className="tb-progress-bar" style={{background:s.color,width:`${s.compliance}%`}}/>
              </div>
              <div className="tb-grid-3 text-center">
                <div><div className="text-base font-black text-primary">{s.total}</div><div className="text-xs text-tertiary">Total</div></div>
                <div><div className="text-base font-black text-emerald-400">{s.completed}</div><div className="text-xs text-tertiary">Done</div></div>
                <div><div className="text-base font-black text-red-400">{s.breached}</div><div className="text-xs text-tertiary">Breach</div></div>
              </div>
            </div>
          ))}
        </div>

        {/* Breached WOs table */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div className="tb-section-title" style={{marginBottom:0}}>SLA Breached Work Orders ({breachedWOs.length})</div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-section-link">All WOs →</button>
          </div>
          {breachedWOs.length===0 ? (
            <div className="tb-empty" style={{padding:"32px 0"}}>
              <div className="tb-empty-icon" style={{fontSize:"2.5rem"}}>✅</div>
              <div className="tb-empty-desc">No SLA breaches — all work orders on track</div>
            </div>
          ) : (
            <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
              <div className="tb-table-head" style={{gridTemplateColumns:"1fr 90px 120px 110px"}}>
                {["Work Order","Priority","Status","Overdue By"].map((h,i)=>(
                  <div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>
                ))}
              </div>
              {breachedWOs.map((w,i)=>{
                const daysOver = Math.floor((now.getTime()-new Date(w.due_date).getTime())/86400000);
                const pc = {critical:"#A84A3D",high:"#B07A2A",medium:"#B07A2A",low:"var(--color-text-3)"}[w.priority]||"var(--color-text-3)";
                return (
                  <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                    className="tb-table-row" style={{gridTemplateColumns:"1fr 90px 120px 110px"}}>
                    <div className="flex items-center gap-3 pr-4 min-w-0">
                      <div className="tb-priority-bar" style={{background:pc}}/>
                      <div className="text-sm font-medium text-primary truncate">{w.title}</div>
                    </div>
                    <div className="text-center">
                      <span className="tb-badge" style={{background:`${pc}18`,color:pc,border:`1px solid ${pc}30`,fontSize:"0.625rem"}}>{w.priority}</span>
                    </div>
                    <div className="text-center text-xs text-secondary">{w.status}</div>
                    <div className="text-center text-sm font-black text-red-400">{daysOver}d overdue</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
