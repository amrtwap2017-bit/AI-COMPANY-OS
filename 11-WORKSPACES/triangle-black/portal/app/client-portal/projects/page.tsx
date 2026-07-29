"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientProjectsPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("tb_client_token");
    const c = localStorage.getItem("tb_client");
    if (!t) { router.push("/client-portal"); return; }
    setToken(t);
    const cl = c ? JSON.parse(c) : null;
    setClient(cl);
    if (cl?.site_id) {
      fetch(`/api/v1/client/projects?site_id=${cl.site_id}`,
        {headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()).then(d=>{ setProjects(Array.isArray(d)?d:[]); setLoading(false); });
    }
  }, []);

  const fmtEGP = (n) => "EGP " + Number(n||0).toLocaleString();
  const fmtDate = (d) => { if(!d) return "—"; try { const dt=new Date(d); return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/client-portal/dashboard")} className="text-sm text-gray-500">← Dashboard</button>
        <div className="text-sm font-bold text-gray-800">Our Projects — {client?.company_name}</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-32 bg-white rounded-2xl animate-pulse"/>)}</div>
        : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🏗️</div>
            <div className="font-bold text-gray-700">No Active Projects</div>
          </div>
        ) : projects.map((proj,i)=>(
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium mr-2"
                      style={{background:proj.status==="active"?"#ECFDF5":"#F3F4F6",color:proj.status==="active"?"#059669":"#6B7280"}}>
                  {proj.status}
                </span>
                <div className="text-base font-bold text-gray-800 mt-1">{proj.title}</div>
                <div className="text-xs text-gray-400">Manager: {proj.manager_name||"—"} · {fmtDate(proj.start_date)} → {fmtDate(proj.end_date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${proj.completion_pct||0}%`}}/>
              </div>
              <span className="text-sm font-black text-emerald-600 w-12 text-right">{proj.completion_pct||0}%</span>
            </div>
            <div className="text-xs text-gray-400">Project Completion</div>
          </div>
        ))}
      </div>
    </div>
  );
}
