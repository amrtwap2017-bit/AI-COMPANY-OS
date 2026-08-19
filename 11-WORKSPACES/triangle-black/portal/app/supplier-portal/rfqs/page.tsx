"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if(!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

export default function SupplierRFQsPage() {
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [token, setToken] = useState("");
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({rfq_id:"",total_amount:"",payment_terms:30,delivery_days:7,notes:""});
  const [showBid, setShowBid] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("tb_supplier_token");
    const s = localStorage.getItem("tb_supplier");
    if (!t) { router.push("/supplier-portal"); return; }
    setToken(t);
    const sup = s ? JSON.parse(s) : null;
    setSupplier(sup);
    if (sup?.vendor_id) {
      fetch(`/api/v1/supplier/rfqs?vendor_id=${sup.vendor_id}`, {headers:{Authorization:`Bearer ${t}`}})
        .then(r=>r.json()).then((d: any) => { setRfqs(Array.isArray(d)?d:[]); setLoading(false); });
    }
  }, []);

  const submitBid = async () => {
    if (!bidForm.total_amount) return;
    const r = await fetch("/api/v1/supplier/quotes", {
      method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
      body: JSON.stringify({...bidForm, vendor_id:supplier?.vendor_id, currency:"EGP"})
    });
    const data = await r.json();
    if (data.status==="submitted") {
      setSuccess(`Quote ${data.quotation_number} submitted!`);
      setShowBid(null);
      setBidForm({rfq_id:"",total_amount:"",payment_terms:30,delivery_days:7,notes:""});
    }
  };

  return (
    <div className="min-h-screen" style={{background:"#0A0F1E"}}>
      <nav style={{background:"#0F172A",borderBottom:"1px solid rgba(255,255,255,0.08)"}} className="px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/supplier-portal/dashboard")} className="text-sm text-slate-400">← Dashboard</button>
        <div className="text-sm font-bold text-white">RFQs & Bidding</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {success && <div className="mb-4 p-4 rounded-xl text-sm font-bold" style={{background:"#0D2A1E",color:"#34D399"}}>{success}</div>}
        {loading ? <div className="space-y-3">{[1,2,3].map((i: any) =><div key={i} className="h-24 rounded-2xl animate-pulse" style={{background:"#1E293B"}}/>)}</div>
        : rfqs.length===0 ? (
          <div className="text-center py-16 rounded-2xl border" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
            <div className="text-4xl mb-3">📝</div><div className="text-white font-bold">No active RFQs</div>
            <div className="text-slate-400 text-sm mt-1">You will be notified when RFQs matching your category are sent</div>
          </div>
        ) : rfqs.map((rfq,i)=>(
          <div key={i} className="rounded-2xl border p-6 mb-4" style={{background:"#1E293B",borderColor:rfq.is_selected?"#34D39940":"rgba(255,255,255,0.08)"}}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{background:rfq.status==="sent"?"#60A5FA20":"#94A3B820",color:rfq.status==="sent"?"#60A5FA":"#94A3B8"}}>
                    {rfq.status}
                  </span>
                  <span className="text-xs text-slate-500">{rfq.rfq_number}</span>
                  {rfq.is_selected && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400">AWARDED ✓</span>}
                </div>
                <div className="text-base font-bold text-white">{rfq.title}</div>
                <div className="text-xs text-slate-400">Deadline: {fmtDate(rfq.submission_deadline)} · Budget: {fmtEGP(rfq.total_budget||0)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                {rfq.my_quote_amount ? (
                  <div>
                    <div className="text-sm font-black text-emerald-400">{fmtEGP(rfq.my_quote_amount)}</div>
                    <div className="text-xs text-slate-400">My quote · {rfq.quote_status}</div>
                  </div>
                ) : rfq.status==="sent" ? (
                  <button onClick={()=>{setShowBid(rfq.id);setBidForm(f=>({...f,rfq_id:rfq.id}));}}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:"#D97706"}}>
                    Submit Quote
                  </button>
                ) : null}
              </div>
            </div>
            {showBid===rfq.id && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 space-y-3" style={{background:"rgba(217,119,6,0.05)"}}>
                <div className="text-sm font-bold text-amber-400">Submit Your Quotation</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Total Amount (EGP) *</label>
                    <input type="number" className="w-full px-3 py-2 rounded-lg text-sm text-white" style={{background:"#0A0F1E",border:"1px solid rgba(255,255,255,0.1)"}}
                      value={bidForm.total_amount} onChange={(e: any) =>setBidForm(f=>({...f,total_amount:e.target.value}))}/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Delivery Days</label>
                    <input type="number" className="w-full px-3 py-2 rounded-lg text-sm text-white" style={{background:"#0A0F1E",border:"1px solid rgba(255,255,255,0.1)"}}
                      value={bidForm.delivery_days} onChange={(e: any) =>setBidForm(f=>({...f,delivery_days:Number(e.target.value)}))}/>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Notes</label>
                    <input className="w-full px-3 py-2 rounded-lg text-sm text-white" style={{background:"#0A0F1E",border:"1px solid rgba(255,255,255,0.1)"}}
                      placeholder="Any conditions, inclusions, warranty…" value={bidForm.notes} onChange={(e: any) =>setBidForm(f=>({...f,notes:e.target.value}))}/>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={submitBid} disabled={!bidForm.total_amount} className="px-6 py-2 rounded-xl text-sm font-bold text-white" style={{background:"#D97706"}}>Submit Quote</button>
                  <button onClick={()=>setShowBid(null)} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
