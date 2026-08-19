"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if(!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#94A3B8",pending_approval:"#FBBF24",approved:"#60A5FA",sent:"#A78BFA",received:"#34D399",paid:"#10B981",cancelled:"#EF4444"};

export default function SupplierPurchaseOrdersPage() {
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [token, setToken] = useState("");
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("tb_supplier_token");
    const s = localStorage.getItem("tb_supplier");
    if (!t) { router.push("/supplier-portal"); return; }
    setToken(t);
    const sup = s ? JSON.parse(s) : null;
    setSupplier(sup);
    if (sup?.vendor_id) {
      fetch(`/api/v1/supplier/purchase-orders?vendor_id=${sup.vendor_id}`, {headers:{Authorization:`Bearer ${t}`}})
        .then(r=>r.json()).then((d: any) => { setPos(Array.isArray(d)?d:[]); setLoading(false); });
    }
  }, []);

  return (
    <div className="min-h-screen" style={{background:"#0A0F1E"}}>
      <nav style={{background:"#0F172A",borderBottom:"1px solid rgba(255,255,255,0.08)"}} className="px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/supplier-portal/dashboard")} className="text-sm text-slate-400">← Dashboard</button>
        <div className="text-sm font-bold text-white">Purchase Orders — {supplier?.company_name}</div>
        <div className="ml-auto text-xs text-slate-400">{pos.length} total</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? <div className="space-y-3">{[1,2,3].map((i: any) =><div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:"#1E293B"}}/>)}</div>
        : pos.length===0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
            <div className="text-4xl mb-3">📦</div><div className="text-white font-bold">No Purchase Orders yet</div>
          </div>
        ) : pos.map((po: any, i: any) =>{
          const sc=SC[po.status]||"#94A3B8";
          return (
            <div key={i} className="rounded-2xl border p-5 mb-3" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{po.po_number}</div>
                  <div className="text-xs text-slate-400 mt-1">{po.title?.slice(0,50)} · {po.line_count||0} items · Due: {fmtDate(po.delivery_date)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Payment: {po.payment_terms||30} days · Created: {fmtDate(po.created_at)}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-emerald-400">{fmtEGP(po.total_amount||0)}</div>
                  <span className="text-xs px-2 py-1 rounded-full mt-1 inline-block" style={{background:sc+"20",color:sc}}>{po.status}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <a href={`/api/v1/pdf/purchase-order/${po.id}`} target="_blank"
                   className="text-xs px-3 py-1.5 rounded-lg font-medium text-amber-400 border border-amber-400/30 hover:bg-amber-400/10"
                   style={{textDecoration:"none"}}>📄 Download PDF</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
