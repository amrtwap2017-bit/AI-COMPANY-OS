"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
export default function EngineeringHub() {
  const router = useRouter();
  const { data: assetRaw } = useQuery(["eng-assets"], () => authFetch("/api/v1/assets/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["eng-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: pmRaw } = useQuery(["eng-pms"], () => authFetch("/api/v1/maintenance/pm-plans/").then(r=>r.json()));
  const { data: twin } = useQuery(["eng-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const assets=toArr(assetRaw); const wos=toArr(woRaw); const pms=toArr(pmRaw);
  const now=new Date();
  const criticalAssets=assets.filter(a=>a.criticality==="critical");
  const openWOs=wos.filter(w=>w.status==="open");
  const overduePMs=pms.filter(p=>p.next_due_ts&&new Date(p.next_due_ts)<now);
  const score=twin?.health_score??0;
  const sections=[
    {label:"Maintenance Intelligence",desc:"AI-powered maintenance insights",icon:"🧠",path:"/engineering/maintenance-intelligence"},
    {label:"New Work Order",desc:"Create corrective or preventive WO",icon:"🔧",path:"/engineering/new-work-order"},
    {label:"PM Plans",desc:"Schedule and manage PM plans",icon:"📅",path:"/engineering/pm-plans"},
    {label:"AI Assistant",desc:"Engineering AI hub",icon:"🤖",path:"/engineering/ai"},
    {label:"Actions Queue",desc:"Pending engineering actions",icon:"⚡",path:"/engineering/actions"},
    {label:"Review Board",desc:"Engineering review and analysis",icon:"📊",path:"/engineering/review"},
  ];
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Engineering</div>
      <h1 className="text-3xl font-black text-primary">Engineering Hub</h1>
      <p className="text-secondary mt-1">MEP engineering operations, assets, and technical management</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total Assets",value:assets.length,sub:`${criticalAssets.length} critical`,color:"blue"},
          {label:"Open WOs",value:openWOs.length,sub:"awaiting assignment",color:"amber"},
          {label:"Overdue PM",value:overduePMs.length,sub:"require scheduling",color:overduePMs.length>0?"red":"emerald"},
          {label:"Twin Score",value:`${score}/100`,sub:twin?.health_label||"—",color:score>=95?"emerald":"amber"},
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((s,i)=>(
          <button key={i} onClick={()=>router.push(s.path)}
            className="bg-surface border border-border rounded-2xl p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="font-bold text-primary group-hover:text-amber-600 transition-colors">{s.label}</div>
            <div className="text-sm text-secondary mt-1">{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}