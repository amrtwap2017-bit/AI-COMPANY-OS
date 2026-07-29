"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d) => { if(!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const PS = {paid:"#34D399",unpaid:"#FBBF24",partial:"#FB923C"};

export default function SupplierInvoicesPage() {
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [token, setToken] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("tb_supplier_token");
    const s = localStorage.getItem("tb_supplier");
    if (!t) { router.push("/supplier-portal"); return; }
    setToken(t);
    const sup = s ? JSON.parse(s) : null;
    setSupplier(sup);
    if (sup?.vendor_id) {
      fetch(`/api/v1/supplier/invoices?vendor_id=${sup.vendor_id}`, {headers:{Authorization:`Bearer ${t}`}})
        .then(r=>r.json()).then(d=>{ setInvoices(Array.isArray(d)?d:[]); setLoading(false); });
    }
  }, []);

  return (
    <div className="min-h-screen" style={{background:"#0A0F1E"}}>
      <nav style={{background:"#0F172A",borderBottom:"1px solid rgba(255,255,255,0.08)"}} className="px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/supplier-portal/dashboard")} className="text-sm text-slate-400">← Dashboard</button>
        <div className="text-sm font-bold text-white">My Invoices — {supplier?.company_name}</div>
        <div className="ml-auto text-xs text-slate-400">{invoices.length} invoices</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl animate-pulse" style={{background:"#1E293B"}}/>)}</div>
        : invoices.length===0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
            <div className="text-4xl mb-3">📄</div><div className="text-white font-bold">No invoices yet</div>
          </div>
        ) : invoices.map((inv,i)=>{
          const ps=PS[inv.payment_status]||"#94A3B8";
          const overdue = inv.due_date && new Date(inv.due_date)<new Date() && inv.payment_status!=="paid";
          return (
            <div key={i} className="rounded-2xl border p-5 mb-3" style={{background:"#1E293B",borderColor:overdue?"#F8717140":"rgba(255,255,255,0.08)"}}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{inv.invoice_number}</div>
                  <div className="text-xs text-slate-400 mt-1">{inv.vendor_invoice_number||"—"} · Invoice: {fmtDate(inv.invoice_date)} · Due: <span style={{color:overdue?"#F87171":"#94A3B8"}}>{fmtDate(inv.due_date)}</span></div>
                  <div className="text-xs text-slate-500">Match: {inv.match_result||"pending"}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-white">{fmtEGP(inv.total_amount||0)}</div>
                  <div className="text-xs mt-0.5" style={{color:ps}}>Balance: {fmtEGP(inv.balance_due||0)}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{background:ps+"20",color:ps}}>{inv.payment_status}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 flex gap-2" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <a href={`/api/v1/pdf/invoice/${inv.id}`} target="_blank"
                   className="text-xs px-3 py-1.5 rounded-lg text-amber-400 border border-amber-400/30" style={{textDecoration:"none"}}>📄 Download PDF</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
