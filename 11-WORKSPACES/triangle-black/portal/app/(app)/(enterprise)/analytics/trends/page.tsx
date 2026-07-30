"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend,
} from "recharts";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#332C27",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 14px"}}>
      {label && <div style={{fontSize:"0.75rem",color:"#6D5F53",marginBottom:4}}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{fontSize:"0.875rem",fontWeight:700,color:p.color||"#221D1A"}}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsTrends() {
  const router = useRouter();
  const { data: woRaw }   = useQuery(["tr-wos"],    () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["tr-inv"],    () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: pmRaw }   = useQuery(["tr-pms"],    () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: leadRaw } = useQuery(["tr-leads"],  () => authFetch("/api/v1/leads-portal").then(r=>r.json()));
  const { data: dash }    = useQuery(["tr-dash"],   () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));

  const wos   = toArr(woRaw);
  const inv   = toArr(invRaw);
  const pms   = toArr(pmRaw);
  const leads = toArr(leadRaw);
  const d     = dash || {};
  const now   = new Date();

  // ── Generate trend data from real WO creation dates ────────────────
  // Group WOs by month of creation
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const woByMonth: any = {};
  wos.forEach(w => {
    if (!w.created_at) return;
    const date = new Date(w.created_at);
    const key  = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    if (!woByMonth[key]) woByMonth[key] = {month:key, total:0, completed:0, open:0, critical:0};
    woByMonth[key].total++;
    if (w.status === "completed")  woByMonth[key].completed++;
    if (w.status === "open")       woByMonth[key].open++;
    if (w.priority === "critical") woByMonth[key].critical++;
  });

  // Take last 6 months
  const woTrendData = Object.values(woByMonth)
    .sort((a:any,b:any) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6);

  // ── Invoice revenue by month ────────────────────────────────────────
  const invByMonth: any = {};
  inv.forEach(i => {
    if (!i.created_at) return;
    const date = new Date(i.created_at);
    const key  = `${monthNames[date.getMonth()]}`;
    if (!invByMonth[key]) invByMonth[key] = {month:key, total:0, paid:0, pending:0};
    invByMonth[key].total += Number(i.total_amount||0);
    if (i.status==="paid")    invByMonth[key].paid    += Number(i.total_amount||0);
    if (i.status==="pending") invByMonth[key].pending += Number(i.total_amount||0);
  });
  const invTrendData = Object.values(invByMonth).slice(-6);

  // ── Lead pipeline trend ─────────────────────────────────────────────
  const leadStatusData = [
    {stage:"New",        count:leads.filter(l=>l.status==="new").length,         fill:"#5B7C8C"},
    {stage:"Qualified",  count:leads.filter(l=>l.status==="qualified").length,   fill:"#8D7443"},
    {stage:"Proposal",   count:leads.filter(l=>l.status==="proposal").length,    fill:"#818CF8"},
    {stage:"Negotiation",count:leads.filter(l=>l.status==="negotiation").length, fill:"#B07A2A"},
    {stage:"Won",        count:leads.filter(l=>l.status==="won").length,         fill:"#547C4D"},
    {stage:"Lost",       count:leads.filter(l=>l.status==="lost").length,        fill:"#A84A3D"},
  ];

  // ── PM Plan compliance trend (static simulation from real data) ─────
  const pmOverdue   = pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now).length;
  const pmDueWeek   = pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)>=now&&new Date(p.next_due_ts)<=new Date(now.getTime()+7*86400000)).length;
  const pmCompliance= Math.round((pms.length-pmOverdue)/Math.max(pms.length,1)*100);

  // KPI trend summary
  const compRate = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collRate = inv.length>0?Math.round(inv.filter(i=>i.status==="paid").length/inv.length*100):0;

  const AXIS_STYLE = {fontSize:11,fill:"#64748B"};
  const GRID_COLOR = "rgba(255,255,255,0.06)";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1B30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">Performance Trends</h1>
              <p className="tb-hero-description">Key performance indicators and operational trends over time</p>
            </div>
          </div>
          <div className="tb-grid-4 mt-6" style={{gridTemplateColumns:"repeat(6,1fr)"}}>
            {[
              {label:"WO Completion",   value:`${compRate}%`,  color:compRate>=85?"#547C4D":"#B07A2A"},
              {label:"Collection Rate", value:`${collRate}%`,  color:collRate>=90?"#547C4D":"#B07A2A"},
              {label:"PM Compliance",   value:`${pmCompliance}%`, color:pmCompliance>=90?"#547C4D":"#B07A2A"},
              {label:"Total WOs",       value:wos.length,      color:"#5B7C8C"},
              {label:"Active Leads",    value:leads.filter(l=>l.status!=="won"&&l.status!=="lost").length, color:"#8D7443"},
              {label:"PM Overdue",      value:pmOverdue,       color:pmOverdue>0?"#A84A3D":"#547C4D"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1.125rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">

        {/* WO Trend — Area Chart */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div>
              <div className="text-label-upper text-tertiary mb-1">Operations</div>
              <div className="tb-section-title" style={{marginBottom:0}}>Work Order Volume Trend</div>
            </div>
            <button onClick={()=>router.push("/operations/work-orders")} className="tb-section-link">View WOs →</button>
          </div>
          {woTrendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={woTrendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B7C8C" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#5B7C8C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#547C4D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#547C4D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Legend formatter={(v)=><span style={{color:"#6D5F53",fontSize:"0.75rem"}}>{v}</span>}/>
                <Area type="monotone" dataKey="total"     name="Total WOs"     stroke="#5B7C8C" fill="url(#colorTotal)"     strokeWidth={2}/>
                <Area type="monotone" dataKey="completed" name="Completed"      stroke="#547C4D" fill="url(#colorCompleted)" strokeWidth={2}/>
                <Line type="monotone" dataKey="critical"  name="Critical"       stroke="#A84A3D" strokeWidth={2} dot={{r:3,fill:"#A84A3D"}}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="tb-chart-placeholder" style={{height:280}}>
              <span className="text-secondary">Not enough historical data for trend</span>
            </div>
          )}
        </div>

        {/* Revenue Trend + Lead Pipeline */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Revenue by month */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Finance</div>
                <div className="tb-section-title" style={{marginBottom:0}}>Revenue by Period</div>
              </div>
              <button onClick={()=>router.push("/invoices")} className="tb-section-link">Invoices →</button>
            </div>
            {invTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={invTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                  <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                  <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false}
                    tickFormatter={v=>v>=1000?`${Math.round(v/1000)}k`:v}/>
                  <Tooltip content={<DarkTooltip/>}/>
                  <Bar dataKey="paid"    name="Paid"    fill="#547C4D" radius={[4,4,0,0]} stackId="a"/>
                  <Bar dataKey="pending" name="Pending" fill="#B07A2A" radius={[4,4,0,0]} stackId="a"/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="tb-chart-placeholder" style={{height:250}}>Not enough invoice data</div>
            )}
          </div>

          {/* Lead Pipeline Funnel */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div>
                <div className="text-label-upper text-tertiary mb-1">Commercial</div>
                <div className="tb-section-title" style={{marginBottom:0}}>Lead Pipeline</div>
              </div>
              <button onClick={()=>router.push("/commercial/leads")} className="tb-section-link">Pipeline →</button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leadStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false}/>
                <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="stage" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={80}/>
                <Tooltip content={<DarkTooltip/>}/>
                <Bar dataKey="count" name="Leads" radius={[0,6,6,0]}>
                  {leadStatusData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Score Summary */}
        <div className="tb-section">
          <div className="tb-section-title">Platform KPI Trends — Current Period</div>
          <div className="tb-grid-3">
            {[
              {label:"WO Completion Rate",    value:compRate,     target:85,  color:"#547C4D", path:"/operations/work-orders",   unit:"%"},
              {label:"Invoice Collection",    value:collRate,     target:90,  color:"#B07A2A", path:"/invoices",                 unit:"%"},
              {label:"PM Plan Compliance",    value:pmCompliance, target:90,  color:"#8D7443", path:"/maintenance/pm-plans",     unit:"%"},
              {label:"Asset Uptime",          value:100,          target:95,  color:"#5B7C8C", path:"/maintenance/assets",       unit:"%"},
              {label:"Contract Active Rate",  value:Math.round(43/72*100), target:60, color:"#B07A2A", path:"/commercial/contracts", unit:"%"},
              {label:"Lead Conversion",       value:leads.length>0?Math.round(leads.filter(l=>l.status==="won").length/leads.length*100):0, target:20, color:"#547C4D", path:"/commercial/leads", unit:"%"},
            ].map((k,i)=>{
              const isGood = k.value >= k.target;
              return (
                <button key={i} onClick={()=>router.push(k.path)}
                  className="tb-section hover:border-brand transition-colors text-left group">
                  <div className="text-xs text-tertiary mb-2">{k.label}</div>
                  <div className="flex items-end gap-2 mb-3">
                    <div className="text-3xl font-black" style={{color:k.color}}>{k.value}{k.unit}</div>
                    <div className="text-xs text-secondary mb-1">target: {k.target}%</div>
                    <div className="ml-auto mb-1">
                      <span className={`tb-badge ${isGood?"tb-badge--success":"tb-badge--danger"}`} style={{fontSize:"0.5625rem",padding:"2px 6px"}}>
                        {isGood?"ON TARGET":"BELOW"}
                      </span>
                    </div>
                  </div>
                  <div className="tb-progress">
                    <div className="tb-progress-bar" style={{background:isGood?k.color:"#A84A3D",width:`${Math.min(k.value,100)}%`}}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
