"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend,
} from "recharts";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n: any) => `EGP ${Number(n||0).toLocaleString()}`;

const WarmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tb-section shadow-lg" style={{padding:"10px 14px"}}>
      {label && <div className="text-xs text-tertiary mb-1 font-semibold">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-sm font-bold" style={{color:p.color||"var(--color-text-1)"}}>
          {p.name}: {p.value}{p.unit||""}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsScorecards() {
  const router = useRouter();
  const { data: dash }     = useQuery(["sc-dash"],    () => authFetch("/api/v1/dashboard/summary").then(r => (r as any).data ?? r));
  const { data: twin }     = useQuery(["sc-twin"],    () => authFetch("/api/v1/twin/state").then(r => (r as any).data ?? r));
  const { data: woRaw }    = useQuery(["sc-wos"],     () => authFetch("/api/v1/work-orders/").then(r => (r as any).data ?? r));
  const { data: invRaw }   = useQuery(["sc-inv"],     () => authFetch("/api/v1/invoices/").then(r => (r as any).data ?? r));
  const { data: assetRaw } = useQuery(["sc-assets"],  () => authFetch("/api/v1/assets/").then(r => (r as any).data ?? r));
  const { data: pmRaw }    = useQuery(["sc-pms"],     () => authFetch("/api/v1/maintenance/pm-plans/").then(r => (r as any).data ?? r));
  const { data: techRaw }  = useQuery(["sc-techs"],   () => authFetch("/api/v1/technicians/").then(r => (r as any).data ?? r));

  const wos    = toArr(woRaw);
  const inv    = toArr(invRaw);
  const assets = toArr(assetRaw);
  const pms    = toArr(pmRaw);
  const techs  = toArr(techRaw);
  const score  = twin?.health_score ?? 0;
  const now    = new Date();

  const compRate    = wos.length>0?Math.round(wos.filter((w: any) =>w.status==="completed").length/wos.length*100):0;
  const collRate    = inv.length>0?Math.round(inv.filter((i: any) =>i.status==="paid").length/inv.length*100):0;
  const assetUp     = assets.length>0?Math.round(assets.filter((a: any) =>a.status==="Operational").length/assets.length*100):100;
  const pmCompliance= pms.length>0?Math.round((pms.length-pms.filter((p: any) =>p.next_due_ts&&new Date(p.next_due_ts)<now).length)/pms.length*100):100;
  const totalRev    = inv.filter((i: any) =>i.status==="paid").reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);

  const woStatusData = [
    {name:"Open",        value:wos.filter((w: any) =>w.status==="open").length,        fill:"#5B7C8C"},
    {name:"In Progress", value:wos.filter((w: any) =>w.status==="in_progress").length, fill:"#B07A2A"},
    {name:"Completed",   value:wos.filter((w: any) =>w.status==="completed").length,   fill:"#547C4D"},
    {name:"Cancelled",   value:wos.filter((w: any) =>w.status==="cancelled").length,   fill:"var(--color-text-3)"},
  ];
  const woPriorityData = [
    {name:"Critical", value:wos.filter((w: any) =>w.priority==="critical").length, fill:"#A84A3D"},
    {name:"High",     value:wos.filter((w: any) =>w.priority==="high").length,     fill:"#B07A2A"},
    {name:"Medium",   value:wos.filter((w: any) =>w.priority==="medium").length,   fill:"#B07A2A"},
    {name:"Low",      value:wos.filter((w: any) =>w.priority==="low").length,      fill:"var(--color-text-3)"},
  ];
  const invoiceData = [
    {name:"Paid",      value:inv.filter((i: any) =>i.status==="paid").length,      fill:"#547C4D"},
    {name:"Pending",   value:inv.filter((i: any) =>i.status==="pending").length,   fill:"#B07A2A"},
    {name:"Overdue",   value:inv.filter((i: any) =>i.status==="overdue").length,   fill:"#A84A3D"},
    {name:"Cancelled", value:inv.filter((i: any) =>i.status==="cancelled").length, fill:"var(--color-text-3)"},
  ].filter((d: any) =>d.value>0);
  const assetCategoryMap: Record<string, any> = {};
  assets.forEach((a: any) => { const cat=a.category||"Other"; (assetCategoryMap as Record<string, any>)[cat]=((assetCategoryMap as Record<string, any>)[cat]||0)+1; });
  const assetCategoryData = Object.entries(assetCategoryMap).map(([name,value])=>({name,value})).sort((a: any, b: any) =>b.value-a.value).slice(0,6);
  const kpiData = [
    {name:"WO Completion",   value:compRate,    fill:"#547C4D"},
    {name:"Invoice Collect", value:collRate,    fill:"#B07A2A"},
    {name:"Asset Uptime",    value:assetUp,     fill:"#5B7C8C"},
    {name:"PM Compliance",   value:pmCompliance,fill:"#8D7443"},
    {name:"Twin Score",      value:score,       fill:"#B07A2A"},
  ];
  const AXIS = {fontSize:11,fill:"var(--color-text-3)"};
  const GRID = "rgba(255,255,255,0.06)";

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">Performance Scorecards</h1>
              <p className="tb-hero-description">KPI performance across all operational domains with live charts</p>
            </div>
            <div className={`tb-section text-center flex-shrink-0 ${score>=95?"border-success/30":"border-warning/30"}`} style={{minWidth:"80px"}}>
              <div className={`text-2xl font-black ${score>=95?"text-success":"text-warning"}`}>{score}</div>
              <div className="text-xs text-tertiary mt-0.5">Platform Twin</div>
            </div>
          </div>
          <div className="tb-grid-5 mt-6">
            {[
              {label:"WO Completion",  value:`${compRate}%`,   color:compRate>=85?"var(--color-success)":"var(--color-warning)"},
              {label:"Collection",     value:`${collRate}%`,   color:collRate>=90?"var(--color-success)":"var(--color-warning)"},
              {label:"Asset Uptime",   value:`${assetUp}%`,    color:assetUp>=95?"var(--color-success)":"var(--color-warning)"},
              {label:"PM Compliance",  value:`${pmCompliance}%`,color:pmCompliance>=90?"var(--color-success)":"var(--color-warning)"},
              {label:"Revenue",        value:fmtEGP(totalRev), color:"var(--color-brand)"},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:k.color,fontSize:"1rem"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2 mb-6">
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{marginBottom:0}}>KPI vs Target</div>
              <button onClick={()=>router.push("/analytics")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">Hub →</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={kpiData}>
                {/* @ts-ignore recharts type mismatch */}

                <RadialBar minAngle={15} label={{position:"insideStart",fill:"#fff",fontSize:10}} background clockWise dataKey="value" max={100}/>
                <Legend iconSize={10} formatter={(value)=><span style={{color:"var(--color-text-3)",fontSize:"0.75rem"}}>{value}</span>}/>
                <Tooltip content={<WarmTooltip/>}/>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{marginBottom:0}}>Work Orders by Status</div>
              <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View →</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={woStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS} axisLine={false} tickLine={false}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>{woStatusData.map((e: any, i: number) =><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tb-grid-2 mb-6">
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{marginBottom:0}}>Work Orders by Priority</div>
              <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View →</button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={woPriorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false}/>
                <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={70}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="value" radius={[0,6,6,0]}>{woPriorityData.map((e: any, i: number) =><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tb-section">
            <div className="flex justify-between items-center mb-4">
              <div className="tb-section-title" style={{marginBottom:0}}>Invoice Status Distribution</div>
              <button onClick={()=>router.push("/invoices")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View →</button>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie data={invoiceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {invoiceData.map((e: any, i: number) =><Cell key={i} fill={e.fill}/>)}
                  </Pie>
                  <Tooltip content={<WarmTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {invoiceData.map((d: any, i: number) =>(
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:d.fill}}/>
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

        <div className="tb-section mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="tb-section-title" style={{marginBottom:0}}>Assets by Category</div>
            <button onClick={()=>router.push("/maintenance/assets")} className="text-xs text-brand font-semibold bg-transparent border-0 cursor-pointer">View All →</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assetCategoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
              <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false}/>
              <YAxis tick={AXIS} axisLine={false} tickLine={false}/>
              <Tooltip content={<WarmTooltip/>}/>
              <Bar dataKey="value" fill="#B07A2A" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="tb-grid-3 mb-6">
          {kpiData.map((kpi: any, i: any) =>{
            const pct = Math.min(kpi.value,100);
            const isGood = pct>=80;
            return (
              <div key={i} className="tb-section">
                <div className="text-xs text-tertiary mb-2">{kpi.name}</div>
                <div className="text-3xl font-black mb-3" style={{color:kpi.fill}}>{pct}%</div>
                <div className="tb-progress">
                  <div className="tb-progress-bar" style={{background:kpi.fill,width:`${pct}%`}}/>
                </div>
                <div className={`text-xs mt-2 ${isGood?"text-success":"text-warning"}`}>
                  {isGood?"✓ On target":"↓ Needs attention"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">More Analytics</div>
          <div className="tb-grid-4">
            {[
              {label:"SLA Reports",   icon:"⏱️", path:"/analytics/sla"},
              {label:"Trends",        icon:"📈", path:"/analytics/trends"},
              {label:"Cost Analysis", icon:"💵", path:"/analytics/costs"},
              {label:"Executive Hub", icon:"📊", path:"/analytics"},
            ].map((a: any, i: number) =>(
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
