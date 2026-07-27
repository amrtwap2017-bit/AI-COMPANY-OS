"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function MaintenanceIntelligencePage() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["mi2-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["mi2-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: pmRaw } = useQuery(["mi2-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const assets=toArr(assetRaw); const wos=toArr(woRaw); const pms=toArr(pmRaw);
  const now=new Date();
  const criticalAssets=assets.filter(a=>a.criticality==="critical");
  const assetsNeedingService=assets.filter(a=>a.next_maintenance_date&&new Date(a.next_maintenance_date)<new Date(now.getTime()+30*86400000));
  const overduePMs=pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const maintenanceWOs=wos.filter(w=>w.type==="preventive"||w.title?.startsWith("PM:"));
  const avgDaysToService=assets.filter(a=>a.last_maintenance_date).length>0?
    Math.round(assets.filter(a=>a.last_maintenance_date).reduce((s,a)=>{
      const days=(now-new Date(a.last_maintenance_date))/(86400000);return s+days;
    },0)/assets.filter(a=>a.last_maintenance_date).length):0;
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Maintenance Intelligence</div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Maintenance Intelligence</h1>
      <p className="text-slate-500 mt-1">Predictive insights and asset health analysis</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Critical Assets",value:criticalAssets.length,color:"red",sub:"requiring priority maintenance"},
          {label:"Due for Service",value:assetsNeedingService.length,color:"amber",sub:"in next 30 days"},
          {label:"Overdue PM Plans",value:overduePMs.length,color:overduePMs.length>0?"red":"emerald",sub:"require immediate action"},
          {label:"Avg Days Since Service",value:avgDaysToService,color:"blue",sub:"across all assets"},
        ].map((k,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-xs text-slate-500 mb-2">{k.label}</div>
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Assets Due for Service</h2>
            <button onClick={()=>router.push("/maintenance/assets")} className="text-xs text-amber-500">All →</button>
          </div>
          {assetsNeedingService.slice(0,6).map((a,i)=>(
            <button key={i} onClick={()=>router.push(`/maintenance/assets/${a.id}`)}
              className="w-full flex items-center justify-between p-3 mb-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 text-left">
              <div><div className="text-sm font-medium truncate">{a.name}</div><div className="text-xs text-amber-600">{a.category}</div></div>
              <div className="text-xs text-slate-400">{fmtDate(a.next_maintenance_date)}</div>
            </button>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Preventive Maintenance WOs</h2>
            <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-amber-500">All →</button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            {[
              {label:"Created",value:maintenanceWOs.length,color:"blue"},
              {label:"Completed",value:maintenanceWOs.filter(w=>w.status==="completed").length,color:"emerald"},
              {label:"Open",value:maintenanceWOs.filter(w=>w.status==="open").length,color:"amber"},
            ].map((s,i)=>(
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <div className={`text-2xl font-black text-${s.color}-500`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}