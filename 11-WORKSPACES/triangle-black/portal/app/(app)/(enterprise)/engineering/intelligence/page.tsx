"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function EngineeringIntelligence() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["ei2-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["ei2-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: pmRaw } = useQuery(["ei2-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const assets=toArr(assetRaw); const wos=toArr(woRaw); const pms=toArr(pmRaw);
  const now=new Date();
  const criticalAssets=assets.filter(a=>a.criticality==="critical");
  const faultedAssets=assets.filter(a=>a.status!=="Operational");
  const criticalOpenWOs=wos.filter(w=>w.priority==="critical"&&w.status!=="completed");
  const overduePMs=pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const assetsByCategory=assets.reduce((acc,a)=>{acc[a.category||"Other"]=(acc[a.category||"Other"]||0)+1;return acc;},{});
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Engineering Intelligence</div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Engineering Intelligence</h1>
      <p className="text-slate-500 mt-1">Asset health analysis and engineering insights</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Critical Assets",value:criticalAssets.length,color:"red"},
          {label:"Faulted Assets",value:faultedAssets.length,color:faultedAssets.length>0?"red":"emerald"},
          {label:"Critical Open WOs",value:criticalOpenWOs.length,color:criticalOpenWOs.length>0?"red":"emerald"},
          {label:"Overdue PM Plans",value:overduePMs.length,color:overduePMs.length>0?"amber":"emerald"},
        ].map((k,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-xs text-slate-500 mb-1">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Assets by Category</h2>
          {Object.entries(assetsByCategory).map(([cat,count],i)=>(
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <span className="text-sm text-slate-600">{cat}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{width:`${(count/assets.length)*100}%`}}/>
                </div>
                <span className="font-bold text-slate-900 dark:text-white w-6 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Critical Assets Requiring Attention</h2>
          {criticalAssets.slice(0,8).map((a,i)=>(
            <button key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)}
              className="w-full flex items-center justify-between p-2 mb-1 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 text-left">
              <div><div className="text-sm font-medium truncate">{a.name}</div><div className="text-xs text-slate-500">{a.category}</div></div>
              <div className="text-xs text-slate-400 ml-2">{fmtDate(a.last_maintenance_date)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}