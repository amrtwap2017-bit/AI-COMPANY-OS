"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];
const fmtEGP = (n) => `EGP ${Number(n||0).toLocaleString()}`;
export default function SupplyChainComparison() {
  const router = useRouter();
  const { data: supplierRaw } = useQuery(["scc-sup"], () => authFetch("/api/v1/suppliers/").then(r=>r.json()));
  const { data: stockRaw } = useQuery(["scc-stock"], () => authFetch("/api/v1/stock-balances/").then(r=>r.json()));
  const suppliers=toArr(supplierRaw); const stock=toArr(stockRaw);
  const totalValue=stock.reduce((s,i)=>s+Number(i.total_value||0),0);
  return (
    <div className="tb-page">
      <div><div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Supply Chain</div>
      <h1 className="text-3xl font-black text-primary">Supplier Comparison</h1>
      <p className="text-secondary mt-1">Compare supplier performance, risk, and terms</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:"Total Suppliers",value:suppliers.length,color:"blue"},
          {label:"Preferred",value:suppliers.filter(s=>s.preferred_flag).length,color:"emerald"},
          {label:"High Risk",value:suppliers.filter(s=>s.risk_level==="high").length,color:"red"},
        ].map((k,i)=>(
          <div key={i} className="bg-surface border border-border rounded-2xl p-5 text-center">
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-secondary mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-base-alt dark:bg-surface-alt">
            <tr>
              {["Supplier","Type","Payment Terms","Lead Time","Risk","Status"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-secondary font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-y-border">
            {suppliers.map((s,i)=>(
              <tr key={i} className="hover:bg-amber-50/50 transition-colors">
                <td className="px-4 py-3"><div className="font-medium">{s.company_name}</div>{s.preferred_flag&&<span className="text-xs text-emerald-600">★ Preferred</span>}</td>
                <td className="px-4 py-3 text-secondary">{s.supplier_type||"—"}</td>
                <td className="px-4 py-3 text-secondary">{s.payment_terms||"—"}</td>
                <td className="px-4 py-3 text-secondary">{s.lead_time_days?`${s.lead_time_days}d`:"—"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${s.risk_level==="low"?"bg-emerald-100 text-emerald-700":s.risk_level==="high"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{s.risk_level||"—"}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${s.status==="active"?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-secondary"}`}>{s.status||"—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}