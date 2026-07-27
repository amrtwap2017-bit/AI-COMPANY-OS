"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function OperationsWorkflows() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["ow-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: srRaw } = useQuery(["ow-srs"], () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const { data: prRaw } = useQuery(["ow-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: pmRaw } = useQuery(["ow-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: autoStatus } = useQuery(["ow-auto"], () => authFetch("/api/v1/automation/status").then(r=>r.json()));
  const wos=toArr(woRaw); const srs=toArr(srRaw); const prs=toArr(prRaw); const pms=toArr(pmRaw);
  const pending=autoStatus?.pending_actions||{};
  const workflows=[
    {name:"Service Request → Work Order",from:"Service Requests",to:"Work Orders",fromCount:srs.length,toCount:wos.length,active:srs.filter(s=>s.status==="open"||s.status==="new").length,color:"blue",path:"/operations/service-requests"},
    {name:"PM Plan → Work Order",from:"PM Plans",to:"Work Orders",fromCount:pms.length,toCount:wos.length,active:pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<new Date()).length,color:"amber",path:"/maintenance/pm-plans"},
    {name:"Work Order → Completion",from:"Open WOs",to:"Completed",fromCount:wos.filter(w=>w.status==="open").length,toCount:wos.filter(w=>w.status==="completed").length,active:wos.filter(w=>w.status==="in_progress").length,color:"emerald",path:"/operations/work-orders"},
    {name:"Stock Alert → Purchase Request",from:"Low Stock",to:"Purchase Requests",fromCount:pending.wf03_stock_below_min||0,toCount:prs.filter(p=>p.title?.startsWith("Auto-PR:")).length,active:prs.filter(p=>p.status==="pending").length,color:"purple",path:"/supply-chain/purchase-requests"},
  ];
  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Operations</div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Operations Workflows</h1>
      <p className="text-slate-500 mt-1">Automated workflow status and throughput</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflows.map((wf,i)=>(
          <button key={i} onClick={()=>router.push(wf.path)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">{wf.name}</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center"><div className="text-2xl font-black">{wf.fromCount}</div><div className="text-xs text-slate-500">{wf.from}</div></div>
              <div className="text-2xl text-slate-300">→</div>
              <div className="text-center"><div className="text-2xl font-black">{wf.toCount}</div><div className="text-xs text-slate-500">{wf.to}</div></div>
            </div>
            <div className={`text-center p-2 rounded-xl bg-${wf.color}-50 dark:bg-${wf.color}-900/20`}>
              <span className={`text-sm font-bold text-${wf.color}-600`}>{wf.active} currently active</span>
            </div>
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Workflow Approvals</h2>
          <button onClick={()=>router.push("/operations/workflows/approvals")} className="text-xs text-amber-500">View approvals →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:"Pending PRs",value:prs.filter(p=>p.status==="pending").length,path:"/supply-chain/purchase-requests"},
            {label:"Submitted PRs",value:prs.filter(p=>p.status==="submitted").length,path:"/supply-chain/purchase-requests"},
            {label:"Approved PRs",value:prs.filter(p=>p.status==="approved").length,path:"/supply-chain/purchase-requests"},
            {label:"Open WOs",value:wos.filter(w=>w.status==="open").length,path:"/operations/work-orders"},
          ].map((item,i)=>(
            <button key={i} onClick={()=>router.push(item.path)}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center hover:bg-amber-50 transition-colors">
              <div className="text-2xl font-black text-amber-500">{item.value}</div>
              <div className="text-xs text-slate-500 mt-1">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}