"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtDate = (d: any) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const PC = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};
const SC = {open:"#2563EB",in_progress:"#D97706",completed:"#059669",cancelled:"#6B7280"};

export default function ClientWorkOrdersPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [token, setToken] = useState("");
  const [wos, setWos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const t = localStorage.getItem("tb_client_token");
    const c = localStorage.getItem("tb_client");
    if (!t) { router.push("/client-portal"); return; }
    setToken(t);
    const cl = c ? JSON.parse(c) : null;
    setClient(cl);
    if (cl?.site_id) {
      fetch(`/api/v1/client/work-orders?site_id=${cl.site_id}&limit=100`,
        {headers:{Authorization:`Bearer ${t}`}}).then(r=>r.json()).then((d: any) => { setWos(Array.isArray(d)?d:[]); setLoading(false); });
    }
  }, []);

  const filtered = filter==="all" ? wos : wos.filter((w: any) =>w.status===filter);

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <button onClick={()=>router.push("/client-portal/dashboard")} className="text-sm text-gray-500">← Dashboard</button>
        <div className="text-sm font-bold text-gray-800">Work Orders — {client?.company_name}</div>
        <div className="ml-auto text-xs text-gray-400">{wos.length} total</div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {["all","open","in_progress","completed"].map((f: any) =>(
            <button key={f} onClick={()=>setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors"
              style={{background:filter===f?"#059669":filter===f?"#059669":"white",color:filter===f?"white":"#6B7280",border:"1px solid",borderColor:filter===f?"#059669":"#E5E7EB"}}>
              {f==="all"?"All":(f==="in_progress"?"In Progress":f.charAt(0).toUpperCase()+f.slice(1))}
              {" "}<span className="opacity-70">({f==="all"?wos.length:wos.filter((w: any) =>w.status===f).length})</span>
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i: any) =><div key={i} className="h-20 bg-white rounded-2xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔧</div>
            <div className="text-gray-500">No {filter==="all"?"work orders":filter.replace("_"," ")} found</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((wo,i)=>{
              const pc=PC[wo.priority]||"#94A3B8";
              const sc=SC[wo.status]||"#94A3B8";
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:pc}}/>
                        <span className="text-xs font-medium uppercase" style={{color:pc}}>{wo.priority}</span>
                      </div>
                      <div className="text-sm font-bold text-gray-800">{wo.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {wo.type?.replace(/_/g," ")} · Technician: {wo.technician_name||"Pending"} · Created: {fmtDate(wo.created_at)}
                      </div>
                      {wo.asset_name && <div className="text-xs text-gray-400">Asset: {wo.asset_name}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-3 py-1 rounded-full font-medium" style={{background:sc+"15",color:sc}}>
                        {(wo.status||"").replace(/_/g," ")}
                      </span>
                      {wo.due_date && <div className="text-xs text-gray-400 mt-1">Due: {fmtDate(wo.due_date)}</div>}
                    </div>
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
