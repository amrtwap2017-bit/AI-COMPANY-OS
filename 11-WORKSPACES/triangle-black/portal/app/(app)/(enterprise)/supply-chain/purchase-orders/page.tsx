"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { PageWrapper, PageHeader, SectionCard, LoadingState, EmptyState } from "@/components/ui";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtNum = (n) => { try { return Number(n||0).toLocaleString(); } catch { return "0"; } };

const STATUSES = ["all","draft","pending","sent","approved","delivered","received","cancelled"];
const S = {draft:"bg-slate-100 text-slate-600",pending:"bg-amber-100 text-amber-800",sent:"bg-blue-100 text-blue-800",approved:"bg-indigo-100 text-indigo-800",delivered:"bg-teal-100 text-teal-800",received:"bg-emerald-100 text-emerald-800",cancelled:"bg-red-100 text-red-600"};

export default function PurchaseOrdersPage() {
  const [sf, setSf] = useState("all");
  const [q,  setQ]  = useState("");

  const { data: raw=[], isLoading } = useQuery(
    ["po-page"], () => authFetch("/api/v1/purchase-orders/?limit=200").then(r=>r.json()), {refetchInterval:120000}
  );

  const pos = toArr(raw);
  const filtered = pos.filter(p => {
    if (sf!=="all"&&p.status!==sf) return false;
    if (q&&!(p.po_number?.toLowerCase().includes(q.toLowerCase())||p.title?.toLowerCase().includes(q.toLowerCase())||p.supplier_name?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const total=pos.length; const pending=pos.filter(p=>["draft","pending","sent"].includes(p.status)).length;
  const approved=pos.filter(p=>p.status==="approved").length; const received=pos.filter(p=>["received","delivered"].includes(p.status)).length;
  const totalVal=pos.reduce((s,p)=>s+(p.total_amount||p.amount||0),0);

  return (
    <PageWrapper>
      <PageHeader title="Purchase Orders" subtitle={`${total} orders · EGP ${fmtNum(totalVal)} total · ${pending} pending`}
        breadcrumbs={[{label:"Supply Chain",href:"/supply-chain"},{label:"Purchase Orders"}]} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[{l:"Total",v:total,c:"text-slate-800"},{l:"Pending",v:pending,c:"text-amber-700"},{l:"Approved",v:approved,c:"text-indigo-700"},{l:"Received",v:received,c:"text-emerald-700"}].map(k=>(
          <div key={k.l} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${k.c}`}>{isLoading?"…":k.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>
      {!isLoading&&totalVal>0&&(
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
          <div><p className="text-xs font-semibold text-blue-700">Total Purchase Value</p><p className="text-2xl font-bold text-blue-900">EGP {fmtNum(totalVal)}</p></div>
          <div className="text-xs text-blue-600 text-right"><p>{approved} approved</p><p>{received} received</p></div>
        </div>
      )}
      <SectionCard title={`Purchase Orders (${filtered.length})`}>
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
          <input type="text" placeholder="Search PO number, title, supplier…" value={q} onChange={e=>setQ(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm w-60 focus:outline-none focus:border-blue-400" />
          <select value={sf} onChange={e=>setSf(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400">
            {STATUSES.map(s=><option key={s} value={s}>{s==="all"?"All Status":s}</option>)}
          </select>
          {(sf!=="all"||q)&&<button onClick={()=>{setSf("all");setQ("");}} className="text-xs text-slate-400 hover:text-red-500 underline">Clear</button>}
        </div>
        {isLoading?<LoadingState/>:filtered.length===0?<EmptyState title="No purchase orders found"/>:(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                {["PO Number","Title","Supplier","Amount","Status","Order Date","Expected"].map(h=>(
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p=>(
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3"><span className="font-mono text-xs font-semibold text-slate-700">{p.po_number||"—"}</span></td>
                    <td className="py-3 px-3"><p className="font-medium text-slate-800 truncate max-w-[180px]">{p.title||p.description?.slice(0,50)||"—"}</p></td>
                    <td className="py-3 px-3 text-xs text-slate-600">{p.supplier_name||p.vendor_name||"—"}</td>
                    <td className="py-3 px-3"><span className="font-semibold text-slate-800">{(p.total_amount||p.amount)?`EGP ${fmtNum(p.total_amount||p.amount)}`:"—"}</span></td>
                    <td className="py-3 px-3"><span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold "+(S[p.status]||"bg-slate-100 text-slate-600")}>{p.status||"—"}</span></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{fmtDate(p.order_date||p.created_at)}</td>
                    <td className="py-3 px-3 text-xs text-slate-500">{fmtDate(p.expected_delivery||p.delivery_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageWrapper>
  );
}
