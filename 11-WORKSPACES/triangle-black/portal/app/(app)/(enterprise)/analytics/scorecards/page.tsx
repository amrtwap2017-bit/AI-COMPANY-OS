"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from "recharts";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;

// Custom tooltip for dark theme
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
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsScorecards() {
  const router = useRouter();
  const { data: dash }    = useQuery(["sc-dash"],    () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: twin }    = useQuery(["sc-twin"],    () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: woRaw }   = useQuery(["sc-wos"],     () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw }  = useQuery(["sc-inv"],     () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: assetRaw }= useQuery(["sc-assets"],  () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: pmRaw }   = useQuery(["sc-pms"],     () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: techRaw } = useQuery(["sc-techs"],   () => authFetch("/api/v1/technicians/").then(r=>r.json()));

  const wos     = toArr(woRaw);
  const inv     = toArr(invRaw);
  const assets  = toArr(assetRaw);
  const pms     = toArr(pmRaw);
  const techs   = toArr(techRaw);
  const d       = dash || {};
  const score   = twin?.health_score ?? 0;
  const now     = new Date();

  // ── Computed KPIs ────────────────────────────────────────────
  const compRate   = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collRate   = inv.length>0?Math.round(inv.filter(i=>i.status==="paid").length/inv.length*100):0;
  const assetUp    = assets.length>0?Math.round(assets.filter(a=>a.status==="Operational").length/assets.length*100):100;
  const pmCompliance=(pms.length>0?Math.round((pms.length-pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now).length)/pms.length*100):100);
  const totalRev   = inv.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const techUtil   = techs.length>0?Math.round(wos.filter(w=>w.status==="in_progress").length/techs.length*100):0;

  // ── Chart Data ───────────────────────────────────────────────

  // WO by status - bar chart
  const woStatusData = [
    {name:"Open",       value:wos.filter(w=>w.status==="open").length,        fill:"#5B7C8C"},
    {name:"In Progress",value:wos.filter(w=>w.status==="in_progress").length,  fill:"#B07A2A"},
    {name:"Completed",  value:wos.filter(w=>w.status==="completed").length,    fill:"#547C4D"},
    {name:"Cancelled",  value:wos.filter(w=>w.status==="cancelled").length,    fill:"var(--color-text-3)"},
  ];

  // WO by priority - bar chart
  const woPriorityData = [
    {name:"Critical",value:wos.filter(w=>w.priority==="critical").length, fill:"#A84A3D"},
    {name:"High",    value:wos.filter(w=>w.priority==="high").length,     fill:"#B07A2A"},
    {name:"Medium",  value:wos.filter(w=>w.priority==="medium").length,   fill:"#B07A2A"},
    {name:"Low",     value:wos.filter(w=>w.priority==="low").length,      fill:"var(--color-text-3)"},
  ];

  // Invoice status - pie chart
  const invoiceData = [
    {name:"Paid",      value:inv.filter(i=>i.status==="paid").length,      fill:"#547C4D"},
    {name:"Pending",   value:inv.filter(i=>i.status==="pending").length,   fill:"#B07A2A"},
    {name:"Overdue",   value:inv.filter(i=>i.status==="overdue").length,   fill:"#A84A3D"},
    {name:"Cancelled", value:inv.filter(i=>i.status==="cancelled").length, fill:"var(--color-text-3)"},
  ].filter(d=>d.value>0);

  // Asset by category - bar chart
  const assetCategoryMap: any = {};
  assets.forEach(a => {
    const cat = a.category || "Other";
    assetCategoryMap[cat] = (assetCategoryMap[cat]||0)+1;
  });
  const assetCategoryData = Object.entries(assetCategoryMap)
    .map(([name,value])=>({name,value}))
    .sort((a:any,b:any)=>b.value-a.value)
    .slice(0,6);

  // KPI scorecard data for radial chart
  const kpiData = [
    {name:"WO Completion",   value:compRate,   fill:"#547C4D"},
    {name:"Invoice Collect", value:collRate,   fill:"#B07A2A"},
    {name:"Asset Uptime",    value:assetUp,    fill:"#5B7C8C"},
    {name:"PM Compliance",   value:pmCompliance,fill:"#8D7443"},
    {name:"Twin Score",      value:score,      fill:"#B07A2A"},
  ];

  const CHART_STYLE = {background:"transparent"};
  const AXIS_STYLE  = {fontSize:11,fill:"#64748B"};
  const GRID_COLOR  = "rgba(255,255,255,0.06)";

  return (
    <div className="min-h-screen bg-base">
      {/* HERO */}
      <div className="tb-hero" style={{background:"linear-gradient(135deg, #221D1A 0%, #0E1B30 100%)"}}>
        <div className="tb-hero-inner">
          <div className="tb-flex-between gap-6">
            <div>
              <div className="text-label-upper text-cyan-400 mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">Performance Scorecards</h1>
              <p className="tb-hero-description">KPI performance across all operational domains with live charts</p>
            </div>
            <div className={`tb-score-badge ${score>=95?"tb-score-badge--success":"tb-score-badge--warning"}`}>
              <div className="tb-score-value" style={{color:score>=95?"#547C4D":"#B07A2A"}}>{score}</div>
              <div className="tb-score-label">Platform Twin</div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="tb-grid-6 mt-6">
            {[
              {label:"WO Completion",value:`${compRate}%`,  color:compRate>=85?"#547C4D":"#B07A2A"},
              {label:"Collection",   value:`${collRate}%`,  color:collRate>=90?"#547C4D":"#B07A2A"},
              {label:"Asset Uptime", value:`${assetUp}%`,   color:assetUp>=95?"#547C4D":"#B07A2A"},
              {label:"PM Compliance",value:`${pmCompliance}%`,color:pmCompliance>=90?"#547C4D":"#B07A2A"},
              {label:"Revenue",      value:fmtEGP(totalRev),color:"#8D7443"},
              {label:"Twin Score",   value:`${score}/100`,  color:score>=95?"#547C4D":"#B07A2A"},
            ].map((k,i)=>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">

        {/* Row 1: KPI Scorecard + WO Status */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Radial KPI Chart */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>KPI vs Target</div>
              <button onClick={()=>router.push("/analytics")} className="tb-section-link">Hub →</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={kpiData}>
                <RadialBar minAngle={15} label={{position:"insideStart",fill:"#fff",fontSize:10}} background clockWise dataKey="value" max={100}/>
                <Legend iconSize={10} formatter={(value)=><span style={{color:"var(--color-text-3)",fontSize:"0.75rem"}}>{value}</span>}/>
                <Tooltip content={<WarmTooltip/>}/>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* WO by Status */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Work Orders by Status</div>
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-section-link">View →</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={woStatusData} style={CHART_STYLE}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
                <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {woStatusData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: WO Priority + Invoice Status */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* WO by Priority */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Work Orders by Priority</div>
              <button onClick={()=>router.push("/operations/work-orders")} className="tb-section-link">View →</button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={woPriorityData} layout="vertical" style={CHART_STYLE}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false}/>
                <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={70}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="value" radius={[0,6,6,0]}>
                  {woPriorityData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice Distribution */}
          <div className="tb-section">
            <div className="tb-section-header">
              <div className="tb-section-title" style={{marginBottom:0}}>Invoice Status Distribution</div>
              <button onClick={()=>router.push("/invoices")} className="tb-section-link">View →</button>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={invoiceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {invoiceData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
                  </Pie>
                  <Tooltip content={<WarmTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {invoiceData.map((d,i)=>(
                  <div key={i} className="flex items-center gap-2">
                    <div style={{width:10,height:10,borderRadius:"50%",background:d.fill,flexShrink:0}}/>
                    <div>
                      <div className="text-sm font-bold text-primary">{d.value}</div>
                      <div className="text-xs text-tertiary">{d.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Asset by Category */}
        <div className="tb-section">
          <div className="tb-section-header">
            <div className="tb-section-title" style={{marginBottom:0}}>Assets by Category</div>
            <button onClick={()=>router.push("/maintenance/assets")} className="tb-section-link">View All →</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assetCategoryData} style={CHART_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false}/>
              <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
              <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false}/>
              <Tooltip content={<WarmTooltip/>}/>
              <Bar dataKey="value" fill="#B07A2A" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 4: Platform health summary */}
        <div className="tb-grid-3">
          {kpiData.map((kpi,i)=>{
            const pct = Math.min(kpi.value, 100);
            const isGood = pct >= 80;
            return (
              <div key={i} className="tb-section">
                <div className="text-xs text-tertiary mb-2">{kpi.name}</div>
                <div className="text-3xl font-black mb-3" style={{color:kpi.fill}}>{pct}%</div>
                <div className="tb-progress tb-progress--md">
                  <div className="tb-progress-bar" style={{background:kpi.fill,width:`${pct}%`}}/>
                </div>
                <div className="text-xs mt-2" style={{color:isGood?"#547C4D":"#B07A2A"}}>
                  {isGood?"✓ On target":"↓ Needs attention"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">More Analytics</div>
          <div className="tb-grid-4">
            {[
              {label:"SLA Reports",    icon:"⏱️", path:"/analytics/sla"},
              {label:"Trends",         icon:"📈", path:"/analytics/trends"},
              {label:"Cost Analysis",  icon:"💵", path:"/analytics/costs"},
              {label:"Executive Hub",  icon:"📊", path:"/analytics"},
            ].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item justify-center py-4 flex-col gap-1.5 text-center">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium text-secondary">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
