"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function OperationsCommand() {
  const router = useRouter();
  const { data: woRaw } = useQuery(["oc-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: techRaw } = useQuery(["oc-techs"], () => authFetch("/api/v1/technicians/").then(r=>r.json()));
  const { data: srRaw } = useQuery(["oc-srs"], () => authFetch("/api/v1/service-requests/").then(r=>r.json()));
  const wos=toArr(woRaw); const techs=toArr(techRaw); const srs=toArr(srRaw);
  const now=new Date();
  const commands=[
    {label:"Work Orders",icon:"🔧",path:"/operations/work-orders",count:wos.filter(w=>w.status==="open").length,sub:"open"},
    {label:"Dispatch",icon:"👷",path:"/operations/dispatch",count:wos.filter(w=>w.status==="in_progress").length,sub:"in progress"},
    {label:"Service Requests",icon:"📋",path:"/operations/service-requests",count:srs.filter(s=>s.status==="open"||s.status==="new").length,sub:"open"},
    {label:"Schedule",icon:"📅",path:"/operations/schedule",count:0,sub:"view calendar"},
    {label:"SLA Review",icon:"⏱️",path:"/operations/sla-review",count:wos.filter(w=>w.due_date&&new Date(w.due_date)<now&&w.status!=="completed").length,sub:"breached"},
    {label:"Workbench",icon:"⚡",path:"/operations/workbench",count:0,sub:"full view"},
  ];
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Operations Command</div>
      <h1 className="text-page-title text-primary">Operations Command Center</h1>
      <p className="text-secondary mt-1">Real-time operations control and dispatch</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Open WOs",value:wos.filter(w=>w.status==="open").length,color:"blue"},
          {label:"In Progress",value:wos.filter(w=>w.status==="in_progress").length,color:"amber"},
          {label:"Active Techs",value:techs.filter(t=>t.is_active).length,color:"emerald"},
          {label:"Open SRs",value:srs.filter(s=>s.status==="open"||s.status==="new").length,color:"purple"},
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-5 text-center">
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-secondary mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {commands.map((c,i)=>(
          <button key={i} onClick={()=>router.push(c.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{c.icon}</div>
              {c.count>0&&<span className="text-lg font-black text-amber-500">{c.count}</span>}
            </div>
            <div className="font-bold text-primary group-hover:text-amber-600">{c.label}</div>
            <div className="text-xs text-tertiary mt-0.5">{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}