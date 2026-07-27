"use client";
// @ts-nocheck
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
export default function TechnicianDetail() {
  const params = useParams(); const id = params?.id; const router = useRouter();
  const { data: techRaw } = useQuery(["td-tech",id], () => authFetch("/api/v1/technicians/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["td-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const techs=toArr(techRaw); const wos=toArr(woRaw);
  const tech=techs.find(t=>t.id===id)||techs[0];
  const techWOs=wos.filter(w=>w.technician_id===id);
  const openWOs=techWOs.filter(w=>w.status==="open"||w.status==="in_progress");
  const completedWOs=techWOs.filter(w=>w.status==="completed");
  const criticalWOs=techWOs.filter(w=>w.priority==="critical"&&w.status!=="completed");
  if(!tech)return(<div className="p-6 text-slate-400">Loading...</div>);
  const load=Math.round((tech.current_work_orders||0)/Math.max(tech.max_work_orders||5,1)*100);
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <button onClick={()=>router.push("/operations/technicians")} className="text-sm text-amber-500 hover:underline">← All Technicians</button>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-black">{(tech.name||"?")[0]}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{tech.name}</h1>
            <div className="text-slate-500 text-sm">{tech.email}</div>
            <div className="flex gap-3 mt-2 flex-wrap">
              {(tech.specializations||[]).map((s,i)=>(
                <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{s}</span>
              ))}
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${tech.is_active?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-700"}`}>{tech.is_active?"Active":"Inactive"}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total WOs",value:techWOs.length,color:"blue"},
          {label:"Completed",value:completedWOs.length,color:"emerald"},
          {label:"Open",value:openWOs.length,color:"amber"},
          {label:"Critical",value:criticalWOs.length,color:criticalWOs.length>0?"red":"emerald"},
        ].map((k,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Capacity</h2>
          <span className="text-sm font-bold">{tech.current_work_orders||0}/{tech.max_work_orders||5}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4">
          <div className={`h-4 rounded-full ${load>=90?"bg-red-500":load>=70?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${load}%`}}/>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-bold mb-4">Assigned Work Orders</h2>
        {techWOs.length===0?(<div className="text-center py-6 text-slate-400">No work orders assigned</div>):(
          <div className="space-y-2">
            {techWOs.slice(0,10).map((w,i)=>(
              <button key={i} onClick={()=>router.push(`/operations/work-orders/${w.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-amber-50 text-left">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${w.priority==="critical"?"bg-red-100 text-red-700":w.priority==="high"?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-600"}`}>{w.priority}</span>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{w.title}</div><div className="text-xs text-slate-400">{fmtDate(w.created_at)}</div></div>
                <span className={`text-xs px-2 py-0.5 rounded ${w.status==="completed"?"bg-emerald-100 text-emerald-700":w.status==="in_progress"?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-600"}`}>{w.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}