"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const fmtDate = (d: any) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const PC = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};
const SC = {open:"#60A5FA",in_progress:"#FBBF24",completed:"#34D399"};

function ClientNav({ client, active }: any) {
  const router = useRouter();
  const items = [
    {id:"dashboard",label:"🏠 Overview",path:"/client-portal/dashboard"},
    {id:"workorders",label:"🔧 Work Orders",path:"/client-portal/work-orders"},
    {id:"requests",label:"🎫 Raise Request",path:"/client-portal/request"},
    {id:"approvals",label:"📋 SOW Approvals",path:"/client-portal/approvals"},
    {id:"projects",label:"🏗️ Projects",path:"/client-portal/projects"},
  ];
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"#0F172A"}}>
          <span className="text-white font-black text-xs">TB</span>
        </div>
        <div>
          <div className="text-xs font-black text-gray-800">{client?.company_name||"Client Portal"}</div>
          <div className="text-xs text-gray-400">{client?.site_name||"Portal"}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {items.map((item: any) =>(
          <button key={item.id} onClick={()=>router.push(item.path)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            style={{background:active===item.id?"#059669":"transparent",color:active===item.id?"white":"#6B7280"}}>
            {item.label}
          </button>
        ))}
      </div>
      <button onClick={()=>{localStorage.removeItem("tb_client_token");localStorage.removeItem("tb_client");router.push("/client-portal");}}
        className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">Sign Out</button>
    </nav>
  );
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("tb_client_token");
    const c = localStorage.getItem("tb_client");
    if (!t) { router.push("/client-portal"); return; }
    setToken(t);
    if (c) setClient(JSON.parse(c));
  }, []);

  const { data: dash, isLoading } = useQuery(
    ["client-dashboard", client?.site_id],
    () => fetch(`/api/v1/client/dashboard?site_id=${client.site_id}`,
        {headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
    { enabled: !!client?.site_id && !!token, staleTime: 30000 }
  );

  const wo = dash?.work_orders || {};
  const sr = dash?.service_requests || {};
  const assets = dash?.assets || {};
  const recent = dash?.recent_work_orders || [];

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>
      <ClientNav client={client} active="dashboard"/>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {client?.name?.split(" ")[0]||""}!</h1>
          <p className="text-gray-500 text-sm">{client?.company_name} · {client?.site_name}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map((i: any) =><div key={i} className="h-24 bg-white rounded-2xl animate-pulse"/>)}</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {label:"Open Jobs",value:wo.open_count||0,sub:"work orders",color:"#2563EB",bg:"#EFF6FF"},
                {label:"In Progress",value:wo.in_progress||0,sub:"being worked on",color:"#D97706",bg:"#FFFBEB"},
                {label:"Completed",value:wo.completed||0,sub:"this period",color:"#059669",bg:"#ECFDF5"},
                {label:"Our Assets",value:assets.total||0,sub:`${assets.operational||0} operational`,color:"#7C3AED",bg:"#F5F3FF"},
              ].map((k: any, i: number) =>(
                <div key={i} className="rounded-2xl p-5 border border-gray-100" style={{background:k.bg}}>
                  <div className="text-3xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
                  <div className="text-sm font-bold text-gray-700">{k.label}</div>
                  <div className="text-xs text-gray-400">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Critical Alert */}
            {(wo.critical||0) > 0 && (
              <div className="mb-6 p-4 rounded-2xl border border-red-200 bg-red-50 flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <div className="font-bold text-red-700">{wo.critical} Critical Job{wo.critical>1?"s":""} in Progress</div>
                  <div className="text-sm text-red-500">Our team is working on urgent issues at your property</div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800">Recent Activity</h2>
                <button onClick={()=>router.push("/client-portal/work-orders")}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700">View all →</button>
              </div>
              {recent.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm">No recent activity</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((wo_item: any, i: any) =>{
                    const pc = PC[wo_item.priority]||"#94A3B8";
                    const sc = SC[wo_item.status]||"#94A3B8";
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:pc}}/>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{wo_item.title}</div>
                          <div className="text-xs text-gray-400">Technician: {wo_item.technician_name||"Pending assignment"} · {fmtDate(wo_item.created_at)}</div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                              style={{background:sc+"15",color:sc}}>
                          {(wo_item.status||"").replace(/_/g," ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                {icon:"🎫",title:"Report an Issue",desc:"Submit a new service request",path:"/client-portal/request",color:"#059669"},
                {icon:"📋",title:"Pending Approvals",desc:"Review scope of work documents",path:"/client-portal/approvals",color:"#2563EB"},
                {icon:"🏗️",title:"Our Projects",desc:"Track ongoing project progress",path:"/client-portal/projects",color:"#7C3AED"},
              ].map((action: any, i: any) =>(
                <button key={i} onClick={()=>router.push(action.path)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left">
                  <span className="text-3xl">{action.icon}</span>
                  <div className="font-bold text-gray-800 mt-2">{action.title}</div>
                  <div className="text-sm text-gray-500">{action.desc}</div>
                  <div className="mt-3 text-xs font-medium" style={{color:action.color}}>Open →</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
