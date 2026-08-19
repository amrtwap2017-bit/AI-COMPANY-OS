"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRequestPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [token, setToken] = useState("");
  const [form, setForm] = useState({title:"",description:"",urgency:"medium",category:"fault",contact_phone:""});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("tb_client_token");
    const c = localStorage.getItem("tb_client");
    if (!t) { router.push("/client-portal"); return; }
    setToken(t); if (c) setClient(JSON.parse(c));
  }, []);

  const handleSubmit = async () => {
    if (!form.title) { setError("Title is required"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/v1/client/service-requests", {
        method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body: JSON.stringify({...form, site_id:client?.site_id, submitted_by:client?.name})
      });
      const data = await r.json();
      if (data.status === "created") { setSuccess(true); setForm({title:"",description:"",urgency:"medium",category:"fault",contact_phone:""}); }
      else setError(data.error || "Failed to submit request");
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  };

  const URGENCIES = [{v:"low",label:"Low — Scheduled maintenance"},{v:"medium",label:"Medium — Non-urgent issue"},{v:"high",label:"High — Affecting operations"},{v:"critical",label:"Critical — Emergency / Safety"}];
  const CATEGORIES = [{v:"fault",label:"Equipment Fault"},{v:"breakdown",label:"Breakdown / Emergency"},{v:"preventive",label:"Preventive Maintenance"},{v:"inspection",label:"Inspection Request"},{v:"other",label:"Other"}];

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/client-portal/dashboard")} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <div className="text-sm font-bold text-gray-800">Raise Service Request</div>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {success ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
            <p className="text-gray-500 mb-6">Our team has received your request and will respond within 2 hours for urgent issues.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>setSuccess(false)} className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Submit Another</button>
              <button onClick={()=>router.push("/client-portal/dashboard")} className="px-6 py-2 rounded-xl text-sm font-bold text-white" style={{background:"#059669"}}>Back to Dashboard</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h1 className="text-lg font-bold text-gray-800 mb-6">New Service Request — {client?.company_name}</h1>
            {error && <div className="mb-4 p-3 rounded-xl text-sm" style={{background:"#FEF2F2",color:"#DC2626"}}>{error}</div>}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Issue Title *</label>
                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  placeholder="e.g. Air conditioning not working in lobby" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Urgency Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {URGENCIES.map((u: any) =>(
                    <button key={u.v} onClick={()=>setForm({...form,urgency:u.v})}
                      className="p-3 rounded-xl border text-left transition-all text-sm"
                      style={{borderColor:form.urgency===u.v?"#059669":"#E5E7EB",background:form.urgency===u.v?"#ECFDF5":"white",color:form.urgency===u.v?"#065F46":"#374151"}}>
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {CATEGORIES.map((c: any) =><option key={c.v} value={c.v}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 resize-none h-28"
                  placeholder="Please describe the issue in detail — location, symptoms, when it started…"
                  value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Your Phone Number</label>
                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  placeholder="+20-2-XXXX-XXXX" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}/>
              </div>
              <button onClick={handleSubmit} disabled={loading||!form.title}
                className="w-full py-3 rounded-xl font-bold text-white transition-all"
                style={{background:loading||!form.title?"#9CA3AF":"#059669"}}>
                {loading ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
