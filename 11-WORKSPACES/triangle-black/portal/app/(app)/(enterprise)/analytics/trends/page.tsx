"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function AnalyticsTrends() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["at-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["at-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: pmRaw } = useQuery(["at-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: dash } = useQuery(["at-dash"], () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const wos = toArr(woRaw); const invoices = toArr(invRaw); const pms = toArr(pmRaw); const d = dash||{};
  const completionRate = wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collectionRate = invoices.length>0?Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100):0;
  const pmCompliance = pms.length>0?Math.round((pms.length-pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<new Date()).length)/pms.length*100):100;
  const trends = [
    {label:"WO Completion Rate",value:completionRate,target:85,unit:"%",color:completionRate>=85?"emerald":"amber",detail:`${wos.filter(w=>w.status==="completed").length} of ${wos.length} completed`,path:"/operations/work-orders"},
    {label:"Invoice Collection Rate",value:collectionRate,target:90,unit:"%",color:collectionRate>=90?"emerald":"amber",detail:`${invoices.filter(i=>i.status==="paid").length} of ${invoices.length} paid`,path:"/invoices"},
    {label:"PM Plan Compliance",value:pmCompliance,target:95,unit:"%",color:pmCompliance>=95?"emerald":"amber",detail:`${pms.filter(p=>!p.next_due_ts||new Date(p.next_due_ts)>=new Date()).length} on schedule`,path:"/maintenance/pm-plans"},
    {label:"Asset Operational Rate",value:Math.round((d.assets?.operational||0)/(d.assets?.total||1)*100),target:95,unit:"%",color:"emerald",detail:`${d.assets?.operational||0} of ${d.assets?.total||0} operational`,path:"/maintenance/assets"},
    {label:"Contract Active Rate",value:Math.round(43/72*100),target:60,unit:"%",color:"blue",detail:"43 of 72 contracts active",path:"/commercial/contracts"},
    {label:"Tech Utilization",value:Math.min(Math.round((d.work_orders?.in_progress||0)/(d.platform?.technicians||25)*100),100),target:70,unit:"%",color:"purple",detail:`${d.work_orders?.in_progress||0} WOs active / ${d.platform?.technicians||25} techs`,path:"/operations/technicians"},
  ];
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Analytics</div>
      <h1 className="text-page-title text-primary">Performance Trends</h1>
      <p className="text-secondary mt-1">Key performance indicators and operational trends</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {trends.map((t,i)=>(
          <button key={i} onClick={()=>router.push(t.path)} className="bg-surface border border-border rounded-2xl p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="font-bold text-primary">{t.label}</div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${t.value>=t.target?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>{t.value>=t.target?"ON TARGET":"BELOW"}</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className={`text-5xl font-black text-${t.color}-500`}>{t.value}</span>
              <span className="text-xl text-tertiary mb-1">{t.unit}</span>
              <span className="text-sm text-tertiary mb-1 ml-auto">target: {t.target}{t.unit}</span>
            </div>
            <div className="w-full bg-base-alt rounded-full h-3 mb-2">
              <div className={`h-3 rounded-full bg-${t.color}-500`} style={{width:`${Math.min(t.value,100)}%`}}/>
            </div>
            <div className="text-xs text-secondary">{t.detail}</div>
          </button>
        ))}
      </div>
    </div>
  );
}