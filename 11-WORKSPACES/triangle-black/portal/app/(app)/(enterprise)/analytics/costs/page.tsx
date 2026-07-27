"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function AnalyticsCosts() {
  const router = useRouter();
  const { data: invRaw } = useQuery(["ac-inv"], () => authFetch("/api/v1/invoices/").then(r=>r.json()));
  const { data: poRaw } = useQuery(["ac-pos"], () => authFetch("/api/v1/purchase-orders/").then(r=>r.json()));
  const { data: prRaw } = useQuery(["ac-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: dash } = useQuery(["ac-dash"], () => authFetch("/api/v1/dashboard/summary").then(r=>r.json()));
  const invoices = toArr(invRaw); const pos = toArr(poRaw); const prs = toArr(prRaw); const d = dash||{};
  const totalRevenue = invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.total_amount||0),0);
  const totalProcurement = pos.reduce((s,p)=>s+Number(p.total_amount||p.amount||0),0);
  const pendingPayments = invoices.filter(i=>i.status==="pending").reduce((s,i)=>s+Number(i.total_amount||0),0);
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Analytics</div>
      <h1 className="text-3xl font-black text-primary">Cost Analysis</h1>
      <p className="text-secondary mt-1">Revenue, procurement spend, and financial performance</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total Revenue",value:fmtEGP(totalRevenue),sub:`${invoices.filter(i=>i.status==="paid").length} paid invoices`,color:"emerald",path:"/invoices"},
          {label:"Pending Collection",value:fmtEGP(pendingPayments),sub:`${invoices.filter(i=>i.status==="pending").length} pending`,color:"amber",path:"/invoices"},
          {label:"Procurement Spend",value:fmtEGP(totalProcurement),sub:`${pos.length} purchase orders`,color:"blue",path:"/supply-chain/purchase-orders"},
          {label:"Pending Requests",value:prs.filter(p=>p.status==="pending").length,sub:"awaiting approval",color:"purple",path:"/supply-chain/purchase-requests"},
        ].map((k,i)=>(
          <button key={i} onClick={()=>router.push(k.path)} className="bg-surface border border-border rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-lg transition-all">
            <div className="text-xs text-secondary mb-2">{k.label}</div>
            <div className={`text-2xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-tertiary mt-1">{k.sub}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-bold text-primary mb-4">Invoice Revenue Breakdown</h2>
          {[
            {label:"Paid",count:invoices.filter(i=>i.status==="paid").length,value:totalRevenue,color:"emerald"},
            {label:"Pending",count:invoices.filter(i=>i.status==="pending").length,value:pendingPayments,color:"amber"},
            {label:"Overdue",count:invoices.filter(i=>i.status==="overdue").length,value:invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+Number(i.total_amount||0),0),color:"red"},
            {label:"Cancelled",count:invoices.filter(i=>i.status==="cancelled").length,value:0,color:"slate"},
          ].map((s,i)=>(
            <div key={i} className="flex justify-between items-center py-3 border-b border-divider last:border-0">
              <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full bg-${s.color}-500`}/><span className="text-sm text-slate-700 dark:text-tertiary">{s.label}</span></div>
              <div className="text-right"><div className={`font-black text-${s.color}-500`}>{s.count}</div><div className="text-xs text-tertiary">{fmtEGP(s.value)}</div></div>
            </div>
          ))}
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-bold text-primary mb-4">Procurement Summary</h2>
          {[
            {label:"Purchase Orders",count:pos.length,color:"blue"},
            {label:"Purchase Requests",count:prs.length,color:"purple"},
            {label:"Pending PRs",count:prs.filter(p=>p.status==="pending").length,color:"amber"},
            {label:"Approved PRs",count:prs.filter(p=>p.status==="approved").length,color:"emerald"},
          ].map((s,i)=>(
            <div key={i} className="flex justify-between items-center py-3 border-b border-divider last:border-0">
              <span className="text-sm text-slate-700 dark:text-tertiary">{s.label}</span>
              <span className={`font-black text-${s.color}-500 text-lg`}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}