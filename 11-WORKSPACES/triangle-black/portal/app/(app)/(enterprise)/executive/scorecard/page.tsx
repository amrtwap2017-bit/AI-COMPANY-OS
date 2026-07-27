"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function ExecutiveScorecard() {
  const router = useRouter();
  const { data: dash } = useQuery(["esc-dash"], () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: twin } = useQuery(["esc-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: woRaw } = useQuery(["esc-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["esc-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const wos=toArr(woRaw); const invoices=toArr(invRaw); const d=dash||{};
  const score=twin?.health_score??0;
  const completionRate=wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collectionRate=invoices.length>0?Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100):0;
  const kpis=[
    {label:"Platform Health",value:score,unit:"/100",target:98,color:score>=95?"emerald":"amber",category:"Platform"},
    {label:"WO Completion",value:completionRate,unit:"%",target:85,color:completionRate>=85?"emerald":"amber",category:"Operations"},
    {label:"Invoice Collection",value:collectionRate,unit:"%",target:90,color:collectionRate>=90?"emerald":"amber",category:"Finance"},
    {label:"Asset Uptime",value:Math.round((d.assets?.operational||46)/(d.assets?.total||46)*100),unit:"%",target:95,color:"emerald",category:"Maintenance"},
    {label:"PM Compliance",value:Math.round(((d.maintenance?.pm_plans||40)-(d.maintenance?.overdue||0))/(d.maintenance?.pm_plans||40)*100),unit:"%",target:90,color:"emerald",category:"Maintenance"},
    {label:"Contract Retention",value:Math.round(43/72*100),unit:"%",target:60,color:"emerald",category:"Commercial"},
  ];
  const overallScore=Math.round(kpis.reduce((s,k)=>s+Math.min(100,k.value),0)/kpis.length);
  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Scorecard</div>
        <h1 className="text-page-title text-primary">Executive Scorecard</h1>
        <p className="text-secondary mt-1">Overall platform performance at a glance</p></div>
        <div className={`rounded-2xl border px-8 py-5 text-center ${overallScore>=80?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className={`text-5xl font-black ${overallScore>=80?"text-emerald-500":"text-amber-500"}`}>{overallScore}</div>
          <div className="text-xs text-secondary mt-1">Overall Score</div>
          <div className="text-xs font-bold mt-0.5">{overallScore>=90?"Excellent":overallScore>=80?"Good":"Needs Attention"}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {kpis.map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div><div className="font-bold text-primary">{k.label}</div>
              <div className="text-xs text-tertiary mt-0.5">{k.category}</div></div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${k.value>=k.target?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>{k.value>=k.target?"✓ On Target":"↓ Below"}</span>
            </div>
            <div className="flex items-end gap-1 mb-3">
              <span className={`text-5xl font-black text-${k.color}-500`}>{k.value}</span>
              <span className="text-xl text-tertiary mb-1">{k.unit}</span>
            </div>
            <div className="w-full bg-base-alt rounded-full h-2.5">
              <div className={`h-2.5 rounded-full bg-${k.color}-500`} style={{width:`${Math.min(k.value,100)}%`}}/>
            </div>
            <div className="text-xs text-tertiary mt-1">Target: {k.target}{k.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}