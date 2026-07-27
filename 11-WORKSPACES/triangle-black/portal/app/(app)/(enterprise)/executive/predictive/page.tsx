"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function ExecutivePredictive() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["ep2-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: pmRaw } = useQuery(["ep2-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: assetRaw } = useQuery(["ep2-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["ep2-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: contractRaw } = useQuery(["ep2-cont"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const wos=toArr(woRaw); const pms=toArr(pmRaw); const assets=toArr(assetRaw);
  const invoices=toArr(invRaw); const contracts=toArr(contractRaw);
  const now=new Date(); const in30=new Date(now.getTime()+30*86400000); const in90=new Date(now.getTime()+90*86400000);
  const predictions = [
    {category:"Maintenance",prediction:`${pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<=in30).length} PM plans due in 30 days`,risk:pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now).length>3?"high":"medium",action:"Schedule maintenance now to avoid overdue",path:"/maintenance/pm-plans"},
    {category:"Revenue",prediction:`${contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)<=in90).length} contracts expiring in 90 days`,risk:contracts.filter(c=>c.status==="active"&&c.end_date&&new Date(c.end_date)<=in30).length>0?"high":"low",action:"Initiate renewal discussions early",path:"/customers/renewals"},
    {category:"Finance",prediction:`${invoices.filter(i=>i.status==="pending").length} pending invoices to collect`,risk:invoices.filter(i=>i.status==="overdue").length>2?"high":"medium",action:"Follow up on pending payments",path:"/invoices"},
    {category:"Operations",prediction:`${wos.filter(w=>w.status==="open").length} open work orders in queue`,risk:wos.filter(w=>w.priority==="critical"&&w.status!=="completed").length>0?"high":"low",action:"Assign technicians to critical WOs",path:"/operations/work-orders"},
    {category:"Assets",prediction:`${assets.filter(a=>a.criticality==="critical").length} critical assets need monthly maintenance`,risk:"medium",action:"Review maintenance schedule for critical assets",path:"/maintenance/assets"},
  ];
  const riskColors = {high:"red",medium:"amber",low:"emerald"};
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Predictive Intelligence</div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Predictive Insights</h1>
      <p className="text-slate-500 mt-1">Forward-looking analysis based on current platform data</p></div>
      <div className="space-y-4">
        {predictions.map((p,i)=>{const rc=riskColors[p.risk];return(
          <div key={i} className={`bg-${rc}-50 dark:bg-${rc}-900/20 border border-${rc}-200 rounded-2xl p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg bg-${rc}-500 text-white`}>{p.risk.toUpperCase()} RISK</span>
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{p.category}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-lg mb-1">{p.prediction}</div>
                <div className="text-sm text-slate-600">→ {p.action}</div>
              </div>
              <button onClick={()=>router.push(p.path)}
                className="ml-4 px-4 py-2 bg-white dark:bg-slate-800 border rounded-xl text-sm font-bold hover:border-amber-400 transition-colors">
                View →
              </button>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}