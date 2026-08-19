"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientApprovalsPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [token, setToken] = useState("");
  const [sows, setSows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("tb_client_token");
    const c = localStorage.getItem("tb_client");
    if (!t) { router.push("/client-portal"); return; }
    setToken(t);
    const cl = c ? JSON.parse(c) : null;
    setClient(cl);
    if (cl?.company_name) {
      fetch(`/api/v1/client/sow-approvals?client_name=${encodeURIComponent(cl.company_name)}`,
        {headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()).then((d: any) => { setSows(Array.isArray(d)?d:[]); setLoading(false); });
    }
  }, []);

  const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/client-portal/dashboard")} className="text-sm text-gray-500">← Dashboard</button>
        <div className="text-sm font-bold text-gray-800">SOW Approvals — {client?.company_name}</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="space-y-3">{[1,2].map((i: any) =><div key={i} className="h-32 bg-white rounded-2xl animate-pulse"/>)}</div>
        ) : sows.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-bold text-gray-700 mb-1">No Pending Approvals</div>
            <div className="text-sm text-gray-400">All scope of work documents have been processed</div>
          </div>
        ) : (
          <div className="space-y-4">
            {sows.map((sow,i)=>{
              const isPending = sow.status === "pending_approval";
              return (
                <div key={i} className="bg-white rounded-2xl border p-6"
                     style={{borderColor:isPending?"#FCD34D":"#E5E7EB"}}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isPending && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-yellow-100 text-yellow-700">AWAITING APPROVAL</span>}
                        <span className="text-xs text-gray-400">{sow.sow_number}</span>
                      </div>
                      <div className="text-base font-bold text-gray-800">{sow.title}</div>
                      <div className="text-sm text-gray-500">{sow.type} · {sow.boq_count||0} BOQ items</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-600">{fmtEGP(sow.total_cost)}</div>
                      <div className="text-xs text-gray-400">{sow.estimated_days||0} days est.</div>
                    </div>
                  </div>
                  {sow.scope_details && (
                    <div className="p-3 rounded-xl bg-gray-50 text-sm text-gray-600 mb-4">{sow.scope_details}</div>
                  )}
                  <div className="flex gap-3">
                    <a href={`/api/v1/pdf/scope-of-work/${sow.id}`} target="_blank"
                       className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                       style={{textDecoration:"none"}}>
                      📄 Download PDF
                    </a>
                    {isPending && (
                      <>
                        <button className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:"#059669"}}>
                          ✓ Approve
                        </button>
                        <button className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50">
                          ✗ Request Changes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
