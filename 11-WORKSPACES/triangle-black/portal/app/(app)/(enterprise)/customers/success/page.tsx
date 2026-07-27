"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function CustomerSuccess() {
  const router = useRouter();
  const { data: contractRaw } = useQuery(["cs-cont"], () => authFetch("/api/v1/contracts/").then(r=>r.json()));
  const { data: invRaw } = useQuery(["cs-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: srRaw } = useQuery(["cs-srs"], () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["cs-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const contracts=toArr(contractRaw); const invoices=toArr(invRaw); const srs=toArr(srRaw); const wos=toArr(woRaw);
  const activeContracts=contracts.filter(c=>c.status==="active");
  const totalRevenue=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const resolvedSRs=srs.filter(s=>s.work_order_id);
  const completedWOs=wos.filter(w=>w.status==="completed");
  const satisfactionScore=Math.min(100,Math.round((resolvedSRs.length/Math.max(srs.length,1))*50+(completedWOs.length/Math.max(wos.length,1))*50));
  const healthMetrics=[
    {label:"Active Client Accounts",value:activeContracts.length,target:40,color:"emerald",icon:"🏢"},
    {label:"Revenue Collected",value:fmtEGP(totalRevenue),target:null,color:"amber",icon:"💰"},
    {label:"Service Requests Resolved",value:`${resolvedSRs.length}/${srs.length}`,target:null,color:"blue",icon:"✅"},
    {label:"WOs Completed",value:completedWOs.length,target:100,color:"purple",icon:"🔧"},
    {label:"Customer Health Score",value:`${satisfactionScore}%`,target:null,color:satisfactionScore>=80?"emerald":"amber",icon:"❤️"},
    {label:"Renewal Risk",value:contracts.filter(c=>{if(!c.end_date||c.status!=="active")return false;return new Date(c.end_date)<=new Date(Date.now()+30*86400000);}).length,target:0,color:"red",icon:"⚠️"},
  ];
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Customer Success</div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Customer Success</h1>
      <p className="text-slate-500 mt-1">Client health, satisfaction, and retention metrics</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {healthMetrics.map((m,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="text-xs text-slate-500 mb-1">{m.label}</div>
            <div className={`text-2xl font-black text-${m.color}-500`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Top Active Clients</h2>
          {activeContracts.slice(0,6).map((c,i)=>(
            <button key={i} onClick={()=>router.push(`/commercial/contracts/${c.id}`)}
              className="w-full flex justify-between p-3 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-emerald-50 text-left transition-colors">
              <span className="text-sm font-medium truncate">{c.title||c.id?.slice(0,16)}</span>
              <span className="text-sm font-black text-emerald-600 ml-2">{fmtEGP(c.total_value)}</span>
            </button>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h2 className="font-bold mb-4">Quick Actions</h2>
          {[
            {label:"View Renewals",icon:"🔄",path:"/customers/renewals"},
            {label:"Customer 360",icon:"🔍",path:"/customers/360"},
            {label:"Review Board",icon:"📋",path:"/customers/review"},
            {label:"All Contracts",icon:"📄",path:"/commercial/contracts"},
          ].map((a,i)=>(
            <button key={i} onClick={()=>router.push(a.path)}
              className="w-full flex items-center gap-3 p-3 mb-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-amber-50 text-left transition-colors">
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}