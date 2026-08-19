"use client";
// @ts-nocheck
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtK = (n: any) => Number(n||0)>=1000?`EGP ${(Number(n)/1000).toFixed(0)}K`:fmtEGP(n);
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const WARM_COLORS = ["#B9924C","#547C4D","#A84A3D","#B07A2A","#5B7C8C","#8D7443"];

const WarmTooltip = ({active,payload,label}: any) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="tb-section shadow-lg" style={{padding:"10px 14px"}}>
      {label&&<div className="text-xs text-tertiary mb-1 font-semibold">{label}</div>}
      {payload.map((p: any, i: number) =>(
        <div key={i} className="text-sm font-bold" style={{color:p.color||"var(--color-text-1)"}}>
          {p.name}: {typeof p.value==="number"?fmtEGP(p.value):p.value}
        </div>
      ))}
    </div>
  );
};

const DATE_PRESETS = [{key:"30d",label:"Last 30 Days"},{key:"90d",label:"Last 90 Days"},{key:"ytd",label:"Year to Date"},{key:"all",label:"All Time"}];

function getPresetRange(preset: any) {
  const now = new Date();
  if (preset==="30d") return {from:new Date(now.getTime()-30*86400000),to:now};
  if (preset==="90d") return {from:new Date(now.getTime()-90*86400000),to:now};
  if (preset==="ytd") return {from:new Date(now.getFullYear(),0,1),to:now};
  return {from:null,to:now};
}

export default function AnalyticsCostsPage() {
  const router = useRouter();
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { data: finDash } = useQuery({queryKey:["costs-fin"],queryFn:()=>authFetch("/api/v1/financial/dashboard").then(r => r.json()),staleTime:60000});
  const { data: timeDash } = useQuery({queryKey:["costs-time"],queryFn:()=>authFetch("/api/v1/time-entries/summary").then(r => r.json()),staleTime:60000});
  const { data: procDash } = useQuery({queryKey:["costs-proc"],queryFn:()=>authFetch("/api/v1/procurement/dashboard").then(r => r.json()),staleTime:60000});
  const { data: invRaw }   = useQuery({queryKey:["costs-inv"],queryFn:()=>authFetch("/api/v1/supplier-invoices/").then(r => r.json()),staleTime:60000});

  const allInvoices = toArr(invRaw);

  const filteredInvoices = useMemo(()=>{
    let from: Date|null=null, to: Date=new Date();
    if (datePreset==="custom"&&customFrom) { from=new Date(customFrom); if(customTo) to=new Date(customTo); }
    else { const range=getPresetRange(datePreset); from=range.from; to=range.to; }
    if (!from) return allInvoices;
    return allInvoices.filter((inv: any) =>{const d=new Date(inv.created_at||inv.updated_at||0);return d>=from&&d<=to;});
  },[allInvoices,datePreset,customFrom,customTo]);

  const rev = finDash?.revenue||{};
  const costs = finDash?.costs||{};
  const time = timeDash?.totals||{};
  const filteredPaid = filteredInvoices.filter((i: any) =>i.status==="paid").reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const filteredTotal = filteredInvoices.reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const filteredOutstanding = filteredInvoices.filter((i: any) =>!["paid"].includes(i.status)).reduce((s: any, i: any) =>s+Number(i.total_amount||0),0);
  const isFiltered = datePreset!=="all";

  const costBreakdown = [{name:"Labor",value:Number(costs.total_labor||0)},{name:"Materials",value:Number(costs.total_materials||0)},{name:"Overhead",value:Number(costs.total_overhead_profit||0)},{name:"PO Spend",value:Number(procDash?.pos?.total_value||0)}].filter((d: any) =>d.value>0);
  const revenueData = [{name:"Invoiced",value:Number(rev.total_invoiced||0),fill:"#B9924C"},{name:"Collected",value:Number(rev.total_collected||0),fill:"#547C4D"},{name:"Outstanding",value:Number(rev.total_outstanding||0),fill:"#A84A3D"},{name:"Labor Cost",value:Number(time.total_labor_cost||0),fill:"#B07A2A"},{name:"PO Spend",value:Number(procDash?.pos?.total_value||0),fill:"#5B7C8C"}];
  const invoiceByStatus = Object.entries(filteredInvoices.reduce((acc: any, inv: any) =>{const s=inv.status||"unknown";acc[s]=(acc[s]||0)+Number(inv.total_amount||0);return acc;},{})).map(([name,value])=>({name,value}));
  const AXIS_STYLE = {fontSize:11,fill:"var(--color-text-3)"};

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Analytics</div>
              <h1 className="tb-hero-title">Cost Analytics</h1>
              <p className="tb-hero-description">Financial performance · Labor costs · Procurement spend</p>
            </div>
            <button onClick={()=>router.push("/analytics")} className="tb-btn tb-btn-secondary">← Analytics</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {[
              {label:isFiltered?"Period Total":"Total Invoiced",value:fmtK(isFiltered?filteredTotal:rev.total_invoiced||0)},
              {label:isFiltered?"Period Paid":"Collected",value:fmtK(isFiltered?filteredPaid:rev.total_collected||0),good:true},
              {label:"Outstanding",value:fmtK(isFiltered?filteredOutstanding:rev.total_outstanding||0),warn:true},
              {label:"Labor Cost",value:fmtK(time.total_labor_cost||0)},
            ].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value text-brand" style={{fontSize:"15px",color:k.good?"var(--color-success)":k.warn?"var(--color-warning)":"var(--color-text-inv)"}}>{k.value}</div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section" style={{padding:"16px 20px"}}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-secondary">Period:</span>
            <div className="tb-tabs border-0 mb-0">
              {DATE_PRESETS.map((p: any) =>(
                <button key={p.key} onClick={()=>setDatePreset(p.key)} className={`tb-tab ${datePreset===p.key?"active":""}`}>{p.label}</button>
              ))}
              <button onClick={()=>setDatePreset("custom")} className={`tb-tab ${datePreset==="custom"?"active":""}`}>Custom</button>
            </div>
            {datePreset==="custom" && (
              <div className="flex gap-2 items-center">
                <input type="date" value={customFrom} onChange={(e: any) =>setCustomFrom(e.target.value)} className="tb-input" style={{padding:"6px 10px",fontSize:"13px"}} />
                <span className="text-tertiary">→</span>
                <input type="date" value={customTo} onChange={(e: any) =>setCustomTo(e.target.value)} className="tb-input" style={{padding:"6px 10px",fontSize:"13px"}} />
              </div>
            )}
            {isFiltered && <span className="text-xs text-brand font-semibold">{filteredInvoices.length} of {allInvoices.length} invoices</span>}
          </div>
        </div>

        <div className="tb-grid-2 mb-4">
          <div className="tb-section">
            <div className="tb-section-title">Financial Overview (All Time)</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData} margin={{top:10,right:10,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={fmtK} width={70} />
                <Tooltip content={<WarmTooltip />} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {revenueData.map((entry: any, i: any) =><Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tb-section">
            <div className="tb-section-title">Cost Breakdown</div>
            {costBreakdown.length>0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={costBreakdown} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {costBreakdown.map((_: any, i: any) =><Cell key={i} fill={WARM_COLORS[i%WARM_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<WarmTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11,color:"var(--color-text-3)"}} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center" style={{height:260}}><span className="text-sm text-tertiary">No cost data available</span></div>}
          </div>
        </div>

        <div className="tb-grid-2">
          <div className="tb-section">
            <div className="tb-section-title">
              Invoice Status
              {isFiltered&&<span className="ml-1.5 text-xs text-brand font-normal">({DATE_PRESETS.find((p: any) =>p.key===datePreset)?.label||"Custom"})</span>}
            </div>
            {invoiceByStatus.length>0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={invoiceByStatus} layout="vertical" margin={{top:0,right:20,left:60,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <YAxis type="category" dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                  <Tooltip content={<WarmTooltip />} />
                  <Bar dataKey="value" radius={[0,6,6,0]}>
                    {invoiceByStatus.map((_: any, i: any) =><Cell key={i} fill={WARM_COLORS[i%WARM_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center" style={{height:200}}><span className="text-sm text-tertiary">No invoices in this period</span></div>}
          </div>

          <div className="tb-section">
            <div className="tb-section-title">
              Period Summary
              {isFiltered&&<span className="ml-1.5 text-xs text-brand font-normal">({DATE_PRESETS.find((p: any) =>p.key===datePreset)?.label||"Custom"})</span>}
            </div>
            {[{label:"Invoices in Period",value:filteredInvoices.length},{label:"Total Value",value:fmtEGP(filteredTotal),color:"var(--color-brand)"},{label:"Paid",value:fmtEGP(filteredPaid),color:"var(--color-success)"},{label:"Outstanding",value:fmtEGP(filteredOutstanding),color:"var(--color-danger)"},{label:"Collection Rate",value:filteredTotal>0?`${Math.round(filteredPaid/filteredTotal*100)}%`:"—",color:"var(--color-warning)"},{label:"Hours Logged",value:`${Math.round(time.total_hours||0)}h`},{label:"Labor Cost",value:fmtEGP(time.total_labor_cost||0)},{label:"PO Spend",value:fmtEGP(procDash?.pos?.total_value||0)}].map(({label,value,color},i)=>(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{label}</span>
                <span className="tb-detail-value font-bold" style={{color:color||"var(--color-text-1)"}}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
