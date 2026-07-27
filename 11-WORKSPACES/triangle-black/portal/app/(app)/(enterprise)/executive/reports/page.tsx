"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function ExecutiveReports() {
  const router = useRouter();
  const { data: dash } = useQuery(["er2-dash"], () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const { data: twin } = useQuery(["er2-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()));
  const { data: invRaw } = useQuery(["er2-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: woRaw } = useQuery(["er2-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const invoices=toArr(invRaw); const wos=toArr(woRaw); const d=dash||{};
  const totalRevenue=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const completionRate=wos.length>0?Math.round(wos.filter(w=>w.status==="completed").length/wos.length*100):0;
  const collectionRate=invoices.length>0?Math.round(invoices.filter(i=>i.status==="paid").length/invoices.length*100):0;
  const reports = [
    {title:"Operations Report",desc:`${d.work_orders?.total||0} WOs tracked · ${completionRate}% completion rate`,icon:"⚙️",path:"/operations/work-orders",metrics:[`Open: ${d.work_orders?.open||0}`,`Completed: ${d.work_orders?.completed||0}`,`Critical: ${d.work_orders?.critical||0}`]},
    {title:"Financial Report",desc:`${fmtEGP(totalRevenue)} collected · ${collectionRate}% collection rate`,icon:"💰",path:"/invoices",metrics:[`Paid: ${d.finance?.paid||0}`,`Pending: ${d.finance?.pending||0}`,`Overdue: ${d.finance?.overdue||0}`]},
    {title:"Maintenance Report",desc:`${d.maintenance?.pm_plans||0} PM plans · ${d.maintenance?.overdue||0} overdue`,icon:"🔧",path:"/maintenance/pm-plans",metrics:[`Due week: ${d.maintenance?.due_this_week||0}`,`Assets: ${d.assets?.total||0}`,`Operational: ${d.assets?.operational||0}`]},
    {title:"Commercial Report",desc:`${d.commercial?.active_contracts||0} active contracts`,icon:"💼",path:"/commercial",metrics:[`Open leads: ${d.commercial?.open_leads||0}`,`Expiring: ${d.commercial?.expiring_30d||0}`,`Unpaid: ${d.commercial?.unpaid_invoices||0}`]},
    {title:"Platform Health",desc:`Digital Twin: ${twin?.health_score||0}/100 · ${twin?.health_label||""}`,icon:"🔮",path:"/executive/intelligence",metrics:[`Technicians: ${d.platform?.technicians||0}`,`Projects: ${d.platform?.projects||0}`,`Notifications: ${d.platform?.notifications||0}`]},
    {title:"Procurement Report",desc:`${d.procurement?.purchase_requests||0} PRs · ${d.procurement?.purchase_orders||0} POs`,icon:"📦",path:"/supply-chain",metrics:[`Pending POs: ${d.procurement?.pending_pos||0}`,`Approved PRs: ${d.procurement?.approved_prs||0}`,`Suppliers: ${d.procurement?.suppliers||0}`]},
  ];
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Executive Reports</div>
      <h1 className="text-3xl font-black text-primary">Executive Reports</h1>
      <p className="text-secondary mt-1">Comprehensive platform performance reports</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reports.map((r,i)=>(
          <button key={i} onClick={()=>router.push(r.path)}
            className="bg-surface border border-border rounded-2xl p-6 text-left hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="text-3xl mb-3">{r.icon}</div>
            <div className="font-bold text-primary text-lg group-hover:text-amber-600 mb-1">{r.title}</div>
            <div className="text-xs text-secondary mb-4">{r.desc}</div>
            <div className="space-y-1">
              {r.metrics.map((m,j)=>(
                <div key={j} className="text-xs text-tertiary flex items-center gap-1"><span className="text-amber-500">·</span>{m}</div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}