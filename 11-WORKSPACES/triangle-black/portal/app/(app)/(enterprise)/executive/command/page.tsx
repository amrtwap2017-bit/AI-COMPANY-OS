"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function ExecutiveCommand() {
  const router = useRouter();
  const { data: twin } = useQuery(["ec-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: dash } = useQuery(["ec-dash"], () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: notifRaw } = useQuery(["ec-notifs"], () => authFetch("/api/v1/notifications/").then(r=>r.json()));
  const notifs = toArr(notifRaw); const d = dash||{}; const score = twin?.health_score??0;
  const unread = notifs.filter(n=>!n.is_read);
  const commands = [
    {label:"Intelligence",icon:"🧠",path:"/executive/intelligence",desc:"Platform AI insights"},
    {label:"Daily Review",icon:"☀️",path:"/executive/daily-review",desc:"Today's briefing"},
    {label:"Portfolio",icon:"💼",path:"/executive/portfolio",desc:"Business portfolio"},
    {label:"Risks",icon:"⚠️",path:"/executive/risks",desc:"Risk register"},
    {label:"Exceptions",icon:"🚨",path:"/executive/exceptions",desc:"Items needing action"},
    {label:"Reports",icon:"📊",path:"/executive/reports",desc:"Executive reports"},
    {label:"Workbench",icon:"⚡",path:"/executive/workbench",desc:"Command workbench"},
  ];
  return (
    <div className="tb-page">
      <div className="flex items-start justify-between">
        <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Command</div>
        <h1 className="text-3xl font-black text-primary">Executive Command Center</h1>
        <p className="text-secondary mt-1">Complete executive control and visibility</p></div>
        <div className={`rounded-2xl border px-6 py-4 text-center ${score>=95?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
          <div className={`text-4xl font-black ${score>=95?"text-emerald-500":"text-amber-500"}`}>{score}</div>
          <div className="text-xs text-secondary mt-1">Twin Score</div>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {[
          {label:"Open WOs",value:d.work_orders?.open??0,color:"blue"},
          {label:"Active Contracts",value:d.commercial?.active_contracts??0,color:"emerald"},
          {label:"Pending Invoices",value:d.finance?.pending??0,color:"amber"},
          {label:"PM Overdue",value:d.maintenance?.overdue??0,color:"red"},
          {label:"Unread Alerts",value:unread.length,color:"purple"},
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-4 text-center">
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-secondary mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {commands.map((c,i)=>(
          <button key={i} onClick={()=>router.push(c.path)}
            className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="font-bold text-primary group-hover:text-amber-600">{c.label}</div>
            <div className="text-xs text-secondary mt-1">{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}