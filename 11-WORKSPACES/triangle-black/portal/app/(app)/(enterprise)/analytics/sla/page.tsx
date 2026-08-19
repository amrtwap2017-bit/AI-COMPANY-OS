"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

const WarmTooltip = ({active,payload,label}: any) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="tb-section shadow-lg" style={{padding:"10px 14px"}}>
      {label&&<div className="text-xs text-tertiary mb-1 font-semibold">{label}</div>}
      {payload.map((p: any, i: number) =><div key={i} className="text-sm font-bold" style={{color:p.color||"var(--color-text-1)"}}>{p.name}: {p.value}{p.unit||""}</div>)}
    </div>
  );
};

export default function AnalyticsSLA() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["sla-wos"],()=>authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: slaDash } = useQuery(["sla-dash"],()=>authFetch("/api/v1/sla/dashboard").then(r=>r.json()),{staleTime:60000});
  const wos = toArr(woRaw);
  const now = new Date();
  const slaTargets = {critical:4,high:8,medium:24,low:72};

  const slaData = ["critical","high","medium","low"].map((priority: any) =>{
    const group = wos.filter((w: any) =>w.priority===priority);
    const completed = group.filter((w: any) =>w.status==="completed");
    const breached = group.filter((w: any) =>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
    const withinSla = completed.filter((w: any) =>{if(!w.created_at||!w.completed_at) return true;const hrs=(new Date(w.completed_at).getTime()-new Date(w.created_at).getTime())/3600000;return hrs<=slaTargets[priority];});
    const compliance = completed.length>0?Math.round(withinSla.length/completed.length*100):100;
    return {priority,label:priority.charAt(0).toUpperCase()+priority.slice(1),total:group.length,completed:completed.length,breached:breached.length,compliance,target:slaTargets[priority],color:priority==="critical"?"var(--color-danger)":priority==="high"?"var(--color-warning)":"var(--color-text-3)"};
  });

  const overall = Math.round(slaData.reduce((s: any, r: any) =>s+r.compliance,0)/slaData.length);
  const breachedWOs = wos.filter((w: any) =>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed").sort((a: any, b: any) =>new Date(a.due_date).getTime()-new Date(b.due_date).getTime()).slice(0,10);
  const complianceChartData = slaData.map((s: any) =>({name:s.label,compliance:s.compliance,target:85,color:s.color}));
  const priorityCountData = slaData.map((s: any) =>({name:s.label,total:s.total,completed:s.completed,breached:s.breached}));
  const AXIS = {fontSize:11,fill:"var(--color-text-3)"};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">SLA Performance</h1>
              <p className="tb-hero-description">Service level agreement compliance by priority — {overall}% overall compliance</p>
            </div>
            <div className={`tb-section text-center flex-shrink-0 ${overall>=90?"border-success/30":"border-warning/30"}`} style={{minWidth:"80px"}}>
              <div className={`text-2xl font-black ${overall>=90?"text-success":"text-warning"}`}>{overall}%</div>
              <div className="text-xs text-tertiary mt-0.5">SLA Compliance</div>
            </div>
          </div>
          <div className="tb-grid-4 mt-6">
            {slaData.map((s: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:s.color}}>{s.compliance}%</div>
                <div className="tb-hero-kpi-label">{s.label} (≤{s.target}h)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2 mb-4">
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{margin:0}}>SLA Compliance Rate</div>
              <span className="text-xs text-tertiary">Target: 85%</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={complianceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={AXIS} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<WarmTooltip/>}/>
                <ReferenceLine y={85} stroke="var(--color-brand)" strokeDasharray="4 4" label={{value:"Target 85%",fill:"var(--color-brand)",fontSize:10}}/>
                <Bar dataKey="compliance" name="Compliance" radius={[6,6,0,0]} unit="%">
                  {complianceChartData.map((e: any, i: number) =><Cell key={i} fill={e.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{margin:0}}>WO Volume by Priority</div>
              <span className="text-xs text-tertiary">Total: {wos.length} WOs</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS} axisLine={false} tickLine={false}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="completed" name="Completed" fill="var(--color-success)" radius={[4,4,0,0]} stackId="a"/>
                <Bar dataKey="breached" name="Breached" fill="var(--color-danger)" radius={[4,4,0,0]} stackId="a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tb-grid-4 mb-4">
          {slaData.map((s: any, i: number) =>(
            <div key={i} className="tb-section">
              <div className="text-xs text-tertiary mb-2 uppercase tracking-wider">{s.label} Priority</div>
              <div className="text-3xl font-black mb-1" style={{color:s.color}}>{s.compliance}%</div>
              <div className="text-xs text-secondary mb-3">SLA ≤ {s.target}h</div>
              <div className="tb-progress mb-3">
                <div className="tb-progress-bar" style={{background:s.color,width:`${s.compliance}%`}}/>
              </div>
              <div className="tb-grid-3 text-center">
                <div><div className="text-base font-black text-primary">{s.total}</div><div className="text-xs text-tertiary">Total</div></div>
                <div><div className="text-base font-black text-success">{s.completed}</div><div className="text-xs text-tertiary">Done</div></div>
                <div><div className="text-base font-black text-danger">{s.breached}</div><div className="text-xs text-tertiary">Breach</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="tb-section">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" style={{margin:0}}>SLA Breached Work Orders ({breachedWOs.length})</div>
            <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">All WOs →</button>
          </div>
          {breachedWOs.length===0 ? (
            <div className="tb-empty"><div className="tb-empty-icon text-4xl opacity-40">✅</div><div className="tb-empty-desc">No SLA breaches — all work orders on track</div></div>
          ) : (
            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead><tr><th>Work Order</th><th style={{textAlign:"center"}}>Priority</th><th style={{textAlign:"center"}}>Status</th><th style={{textAlign:"center"}}>Overdue By</th></tr></thead>
                <tbody>
                  {breachedWOs.map((w: any, i: number) =>{
                    const daysOver = Math.floor((now.getTime()-new Date(w.due_date).getTime())/86400000);
                    return (
                      <tr key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)} className="cursor-pointer">
                        <td className="font-medium text-sm text-primary truncate">{w.title}</td>
                        <td className="text-center"><span className={`tb-badge ${w.priority==="critical"?"tb-badge-danger":w.priority==="high"?"tb-badge-warning":"tb-badge-neutral"}`} style={{fontSize:"10px"}}>{w.priority}</span></td>
                        <td className="text-center text-xs text-secondary">{w.status}</td>
                        <td className="text-center text-sm font-black text-danger">{daysOver}d overdue</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
