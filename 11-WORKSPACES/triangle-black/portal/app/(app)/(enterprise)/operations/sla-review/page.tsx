"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function SLAReview() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["slr-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const wos=toArr(woRaw); const now=new Date();
  const slaTargets={critical:4,high:8,medium:24,low:72};
  const slaData=(["critical","high","medium","low"]).map(priority=>{
    const group=wos.filter(w=>w.priority===priority);
    const completed=group.filter(w=>w.status==="completed");
    const breached=group.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
    const withinSla=completed.filter(w=>{
      if(!w.created_at||!w.completed_at)return true;
      const hrs=(new Date(w.completed_at)-new Date(w.created_at))/3600000;
      return hrs<=slaTargets[priority];
    });
    const compliance=completed.length>0?Math.round(withinSla.length/completed.length*100):100;
    return {priority,total:group.length,completed:completed.length,breached:breached.length,compliance,target:slaTargets[priority]};
  });
  const overall=Math.round(slaData.reduce((s,r)=>s+r.compliance,0)/slaData.length);
  const breachedWOs=wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed");
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-start justify-between">
        <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">SLA Management</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">SLA Review</h1>
        <p className="text-slate-500 mt-1">Service level compliance by priority</p></div>
        <div className={`rounded-2xl border px-6 py-4 text-center ${overall>=90?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className={`text-4xl font-black ${overall>=90?"text-emerald-500":"text-amber-500"}`}>{overall}%</div>
          <div className="text-xs text-slate-500 mt-1">Overall Compliance</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slaData.map((s,i)=>{const c=s.compliance>=90?"emerald":s.compliance>=75?"amber":"red";return(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className={`text-xs font-black uppercase mb-2 ${s.priority==="critical"?"text-red-500":s.priority==="high"?"text-orange-500":s.priority==="medium"?"text-amber-500":"text-slate-500"}`}>{s.priority}</div>
            <div className={`text-4xl font-black text-${c}-500`}>{s.compliance}%</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 mb-1"><div className={`h-2 rounded-full bg-${c}-500`} style={{width:`${s.compliance}%`}}/></div>
            <div className="grid grid-cols-3 gap-1 text-xs text-center mt-2">
              <div><div className="font-bold">{s.total}</div><div className="text-slate-400">Total</div></div>
              <div><div className="font-bold text-emerald-600">{s.completed}</div><div className="text-slate-400">Done</div></div>
              <div><div className="font-bold text-red-500">{s.breached}</div><div className="text-slate-400">Breach</div></div>
            </div>
          </div>
        );})}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Breached Work Orders ({breachedWOs.length})</h2>
          <button onClick={()=>router.push("/operations/work-orders")} className="text-xs text-amber-500">All WOs →</button>
        </div>
        {breachedWOs.length===0?(<div className="text-center py-8 text-slate-400">✅ No SLA breaches</div>):(
          <div className="space-y-2">
            {breachedWOs.slice(0,8).map((w,i)=>{
              const daysOver=Math.floor((now-new Date(w.due_date))/86400000);
              return(
                <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                  className="w-full flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 text-left">
                  <span className={`text-xs font-black px-2 py-1 rounded ${w.priority==="critical"?"bg-red-500 text-white":"bg-orange-500 text-white"}`}>{w.priority}</span>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{w.title}</div><div className="text-xs text-slate-500">{w.status}</div></div>
                  <span className="text-red-600 font-black text-sm flex-shrink-0">{daysOver}d overdue</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}